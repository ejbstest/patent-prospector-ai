import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
interface StartAnalysisInput {
  analysis_id: string;
}

function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse and validate input
    const body = await req.json() as StartAnalysisInput;
    const { analysis_id } = body;
    
    if (!analysis_id || !validateUUID(analysis_id)) {
      throw new Error('Invalid analysis_id: must be a valid UUID');
    }
    
    // Use service role for backend operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch analysis data and verify ownership
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysis_id)
      .single();

    if (fetchError) throw fetchError;
    
    // Verify user owns this analysis
    if (analysis.user_id !== user.id) {
      throw new Error('Forbidden: You do not own this analysis');
    }

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
