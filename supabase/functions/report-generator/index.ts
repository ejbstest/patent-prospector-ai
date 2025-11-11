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
    const { analysis_id, conflicts, invention_description } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    console.log(`Report generator starting for analysis: ${analysis_id}`);

    // Fetch analysis data
    const { data: analysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysis_id)
      .single();

    // Calculate risk score
    const highSeverityCount = conflicts.filter((c: any) => c.conflict_severity >= 7).length;
    const avgSeverity = conflicts.length > 0 
      ? conflicts.reduce((sum: number, c: any) => sum + c.conflict_severity, 0) / conflicts.length 
      : 0;
    
    const baseScore = avgSeverity * 10;
    const highConflictBonus = highSeverityCount * 5;
    const riskScore = Math.min(Math.round(baseScore + highConflictBonus), 100);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore <= 30) riskLevel = 'low';
    else if (riskScore <= 60) riskLevel = 'medium';
    else if (riskScore <= 85) riskLevel = 'high';
    else riskLevel = 'critical';

    // Generate Executive Summary with OpenAI
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are a patent attorney writing executive summaries for C-level executives. Be direct, clear, and actionable.'
        }, {
          role: 'user',
          content: `Create a 1-page executive summary for this IP risk analysis:
          
Invention: ${invention_description}
Risk Score: ${riskScore}/100 (${riskLevel})
Conflicts Found: ${conflicts.length}
High Severity: ${highSeverityCount}

Top Conflicts:
${conflicts.slice(0, 3).map((c: any) => `- ${c.patent_number}: ${c.conflict_description}`).join('\n')}

Include: (1) Overall assessment (2) Top 3 key findings (3) Primary concerns (4) Bottom-line recommendation (proceed/caution/redesign) (5) Estimated mitigation cost range.`
        }],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const summaryData = await summaryResponse.json();
    const executiveSummary = summaryData.choices[0].message.content;

    // Generate Mitigation Strategies
    const mitigationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are an IP strategist providing actionable design-around strategies.'
        }, {
          role: 'user',
          content: `Based on these patent conflicts, create a prioritized action plan with immediate, near-term, and long-term strategies. Format as JSON: {"immediate": [{"strategy": "...", "description": "...", "cost_estimate": "...", "timeline": "...", "risk_reduction": number}], "near_term": [...], "long_term": [...]}.

Conflicts:
${conflicts.slice(0, 5).map((c: any) => `${c.patent_number}: ${c.conflict_description}`).join('\n')}`
        }],
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    const mitigationData = await mitigationResponse.json();
    const mitigationStrategies = JSON.parse(mitigationData.choices[0].message.content);

    // Compile full report
    const reportData = {
      executive_summary: executiveSummary,
      methodology: {
        data_sources: ['USPTO PatentsView', 'AI-powered semantic search'],
        search_strategy: 'Multi-query approach with CPC classification filtering',
        analysis_approach: 'AI-assisted conflict detection with semantic similarity scoring',
        disclaimer: 'This report provides an informational snapshot and does not constitute legal advice.'
      },
      invention_overview: {
        description: invention_description,
        title: analysis.invention_title,
        classifications: analysis.cpc_classifications,
        jurisdictions: analysis.jurisdictions
      },
      risk_assessment: {
        overall_score: riskScore,
        risk_level: riskLevel,
        conflicts_count: conflicts.length,
        high_severity_count: highSeverityCount,
        breakdown: {
          prior_art: Math.round(riskScore * 0.6),
          claim_overlap: Math.round(riskScore * 0.3),
          jurisdictional: Math.round(riskScore * 0.1)
        }
      },
      detailed_analysis: conflicts,
      mitigation_strategies: mitigationStrategies,
      next_steps: [
        'Review detailed claim charts for high-risk patents',
        'Consult with patent attorney for FTO opinion',
        'Consider design modifications to avoid top conflicts',
        'Monitor patent landscape for new filings'
      ]
    };

    // Determine report type based on payment status
    const reportType = analysis.payment_status === 'paid' ? 'full' : 'snapshot';

    // Store report
    await supabase.from('reports').insert({
      analysis_id,
      report_type: reportType,
      executive_summary: executiveSummary,
      detailed_analysis: reportData,
      generated_by: 'ai_workflow',
      version: 1
    });

    // Update analysis with risk assessment
    await supabase
      .from('analyses')
      .update({ 
        status: 'reviewing',
        progress_percentage: 90,
        risk_score: riskScore,
        risk_level: riskLevel,
        report_generated_at: new Date().toISOString()
      })
      .eq('id', analysis_id);

    // Log execution
    const executionTime = Date.now() - startTime;
    await supabase.from('agent_logs').insert({
      analysis_id,
      agent_name: 'report',
      status: 'success',
      agent_input: { conflicts_count: conflicts.length },
      agent_output: { risk_score: riskScore, risk_level: riskLevel },
      execution_time_ms: executionTime
    });

    console.log(`Report generator completed in ${executionTime}ms`);

    // Trigger delivery
    await supabase.functions.invoke('deliver-report', {
      body: { analysis_id }
    });

    return new Response(
      JSON.stringify({ success: true, risk_score: riskScore, risk_level: riskLevel }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in report-generator:', error);
    
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { analysis_id } = await req.json().catch(() => ({}));
    
    if (analysis_id) {
      await supabase.from('agent_logs').insert({
        analysis_id,
        agent_name: 'report',
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
