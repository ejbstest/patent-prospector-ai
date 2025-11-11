import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

  const startTime = Date.now();

  try {
    const { analysis_id, patents, invention_description } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    console.log(`Analysis agent processing ${patents.length} patents`);

    const conflicts = [];

    // Process top patents for conflict detection
    for (const patent of patents.slice(0, 20)) {
      console.log(`Analyzing patent: ${patent.patent_number}`);

      // Simulate claim extraction and conflict analysis
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a patent attorney conducting infringement analysis. Analyze claim overlap objectively.'
          }, {
            role: 'user',
            content: `Compare this patent: "${patent.title}" (${patent.abstract}) with this invention: "${invention_description}". Determine: (1) claim_overlap_percentage (0-100), (2) conflict_description (specific features), (3) infringement_likelihood (low/medium/high). Return JSON: {"claim_overlap_percentage": number, "conflict_description": "...", "infringement_likelihood": "..."}`
          }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      const analysisData = await analysisResponse.json();
      const analysis = JSON.parse(analysisData.choices[0].message.content);

      // Calculate conflict severity (1-10)
      const overlapWeight = analysis.claim_overlap_percentage * 0.4;
      const statusWeight = 20; // Active patent
      const litigationWeight = Math.random() * 20; // Mock data
      const severityScore = Math.min(
        Math.round((overlapWeight + statusWeight + litigationWeight) / 10),
        10
      );

      // Only store conflicts with severity >= 4
      if (severityScore >= 4) {
        const conflict = {
          analysis_id,
          patent_number: patent.patent_number,
          patent_title: patent.title,
          assignee: patent.assignee,
          filing_date: patent.filing_date,
          conflict_severity: severityScore,
          claim_overlap_percentage: analysis.claim_overlap_percentage,
          conflict_description: analysis.conflict_description,
          legal_status: 'active',
          relevant_claims: ['Claim 1', 'Claim 3', 'Claim 7']
        };

        conflicts.push(conflict);

        // Insert conflict into database
        await supabase.from('patent_conflicts').insert(conflict);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const output = {
      conflicts_identified: conflicts.length,
      high_severity_conflicts: conflicts.filter(c => c.conflict_severity >= 7).length,
      medium_severity_conflicts: conflicts.filter(c => c.conflict_severity >= 4 && c.conflict_severity < 7).length,
      low_severity_conflicts: 0
    };

    // Update progress
    await supabase
      .from('analyses')
      .update({ 
        status: 'analyzing',
        progress_percentage: 50 
      })
      .eq('id', analysis_id);

    // Log execution
    const executionTime = Date.now() - startTime;
    await supabase.from('agent_logs').insert({
      analysis_id,
      agent_name: 'analysis',
      status: 'success',
      agent_input: { patents_analyzed: patents.length },
      agent_output: output,
      execution_time_ms: executionTime
    });

    console.log(`Analysis agent completed in ${executionTime}ms`);

    // Trigger report generation
    await supabase.functions.invoke('report-generator', {
      body: {
        analysis_id,
        conflicts,
        invention_description
      }
    });

    return new Response(
      JSON.stringify(output),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analysis-agent:', error);
    
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { analysis_id } = await req.json().catch(() => ({}));
    
    if (analysis_id) {
      await supabase.from('agent_logs').insert({
        analysis_id,
        agent_name: 'analysis',
        status: 'failed',
        error_message: errorMessage,
        execution_time_ms: executionTime
      });
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
