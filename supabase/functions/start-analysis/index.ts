import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis_id } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analysis data
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysis_id)
      .single();

    if (fetchError) throw fetchError;

    console.log(`Starting analysis workflow for: ${analysis.invention_title}`);

    // Log workflow start
    await supabase.from('agent_logs').insert({
      analysis_id,
      agent_name: 'research',
      status: 'success',
      agent_input: { invention_description: analysis.invention_description },
      agent_output: { message: 'Workflow initiated' },
      execution_time_ms: 0
    });

    // Update status
    await supabase
      .from('analyses')
      .update({ 
        status: 'searching',
        progress_percentage: 5 
      })
      .eq('id', analysis_id);

    // Call research agent (non-blocking)
    const startTime = Date.now();
    const researchResponse = await supabase.functions.invoke('research-agent', {
      body: {
        analysis_id,
        invention_description: analysis.invention_description,
        technical_keywords: analysis.technical_keywords,
        cpc_classifications: analysis.cpc_classifications,
        jurisdictions: analysis.jurisdictions
      }
    });

    if (researchResponse.error) {
      console.error('Research agent error:', researchResponse.error);
      
      await supabase.from('agent_logs').insert({
        analysis_id,
        agent_name: 'research',
        status: 'failed',
        error_message: researchResponse.error.message,
        execution_time_ms: Date.now() - startTime
      });

      await supabase
        .from('analyses')
        .update({ status: 'failed' })
        .eq('id', analysis_id);

      throw researchResponse.error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis workflow started',
        analysis_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in start-analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
