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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate input
    const body = await req.json() as StartAnalysisInput;
    const { analysis_id } = body;
    
    if (!analysis_id || !validateUUID(analysis_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid analysis_id: must be a valid UUID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting analysis workflow for analysis_id: ${analysis_id}`);

    // Fetch the analysis
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysis_id)
      .single();

    if (fetchError || !analysis) {
      console.error('Error fetching analysis:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check current status (allow both 'intake' and legacy 'submitted')
    if (analysis.status !== 'intake' && analysis.status !== 'submitted') {
      console.log(`Analysis ${analysis_id} is not in a startable state (current: ${analysis.status})`);
      return new Response(
        JSON.stringify({ 
          error: 'Analysis must be in intake/submitted state to start',
          current_status: analysis.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check payment status (accept both 'paid' and 'exemption')
    if (analysis.payment_status !== 'paid' && analysis.payment_status !== 'exemption') {
      console.log(`Analysis ${analysis_id} payment not confirmed (status: ${analysis.payment_status})`);
      return new Response(
        JSON.stringify({ 
          error: 'Payment must be confirmed before starting analysis',
          payment_status: analysis.payment_status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to queued
    const { error: updateError } = await supabase
      .from('analyses')
      .update({ 
        status: 'queued',
        progress_percentage: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', analysis_id);

    if (updateError) {
      console.error('Error updating analysis status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update analysis status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the start of the analysis
    await supabase
      .from('agent_logs')
      .insert({
        analysis_id,
        agent_name: 'workflow_orchestrator',
        status: 'success',
        agent_input: { 
          action: 'start_analysis',
          invention_title: analysis.invention_title 
        },
        agent_output: { message: 'Analysis workflow initiated' },
        execution_time_ms: 0
      });

    console.log(`Analysis ${analysis_id} moved to queued status`);

    // Trigger the research-agent in the background (fire and forget)
    // This starts the automated workflow
    (async () => {
      try {
        // Small delay to ensure the response is sent
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update to searching status
        await supabase
          .from('analyses')
          .update({ 
            status: 'searching',
            progress_percentage: 10,
            updated_at: new Date().toISOString()
          })
          .eq('id', analysis_id);

        console.log(`Updated analysis ${analysis_id} to searching status`);

        // Invoke research agent
        const { error } = await supabase.functions.invoke('research-agent', {
          body: { 
            analysis_id,
            invention_description: analysis.invention_description,
            technical_keywords: analysis.technical_keywords,
            cpc_classifications: analysis.cpc_classifications,
            jurisdictions: analysis.jurisdictions
          }
        });

        if (error) {
          console.error('Error invoking research-agent:', error);
          
          // Update analysis to failed state
          await supabase
            .from('analyses')
            .update({ 
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', analysis_id);

          // Log the failure
          await supabase
            .from('agent_logs')
            .insert({
              analysis_id,
              agent_name: 'workflow_orchestrator',
              status: 'error',
              error_message: error.message || 'Failed to start research agent',
              agent_input: { action: 'trigger_research' },
              execution_time_ms: 0
            });
        } else {
          console.log(`Successfully triggered research-agent for analysis ${analysis_id}`);
        }
      } catch (err) {
        console.error('Error in background research task:', err);
      }
    })();

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true,
        analysis_id,
        status: 'queued',
        message: 'Analysis workflow started successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in start-analysis function:', error);
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

