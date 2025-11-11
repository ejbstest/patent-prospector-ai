import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body = await req.json();
    const { analysis_id, conflicts, invention_description } = body;
    
    if (!analysis_id || !validateUUID(analysis_id)) {
      throw new Error('Invalid analysis_id: must be a valid UUID');
    }
    if (!Array.isArray(conflicts)) {
      throw new Error('Invalid conflicts: must be an array');
    }

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

    // PROMPT 5: Executive Summary Generator (Plain English)
    const EXEC_SUMMARY_PROMPT = `You are a business consultant translating complex patent analysis into executive-friendly language.

TARGET AUDIENCE: Startup founder with no legal background

STRUCTURE (2-4 pages):

PAGE 1: THE BOTTOM LINE
- ONE-SENTENCE VERDICT: [Green/Yellow/Red] to proceed
- OVERALL IP RISK SCORE: ${riskScore}/100 (${riskLevel})
- TOP 3 KEY FINDINGS with "What we found", "Why it matters", "What to do"
- ESTIMATED COST TO MITIGATE RISKS

PAGE 2: COMPETITIVE LANDSCAPE
- WHO OWNS PATENTS IN YOUR SPACE
- PATENT ACTIVITY TIMELINE
- YOUR COMPETITIVE POSITION

PAGE 3: RISK BREAKDOWN
- HIGH-RISK PATENTS (detailed)
- MEDIUM-RISK PATENTS (summary)
- LOW-RISK PATENTS (brief)

PAGE 4: OPPORTUNITIES & RECOMMENDATIONS
- WHITE SPACE OPPORTUNITIES
- RECOMMENDED ACTION PLAN (immediate/near-term/long-term)
- INVESTMENT REQUIRED

WRITING STYLE:
- Short sentences and paragraphs
- Define legal terms in parentheses
- Use bullet points generously
- Include specific numbers (costs, timelines, patent counts)
- No "legalese"
- Professional but approachable

TONE:
- Honest about risks without being alarmist
- Solution-oriented
- Empowering

OUTPUT: Plain text with Markdown formatting`;

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
          content: EXEC_SUMMARY_PROMPT
        }, {
          role: 'user',
          content: `Create executive summary for:
          
Invention: ${invention_description}
Risk Score: ${riskScore}/100 (${riskLevel})
Conflicts Found: ${conflicts.length}
High Severity: ${highSeverityCount}

Top Conflicts:
${conflicts.slice(0, 5).map((c: any) => `- ${c.patent_number}: ${c.conflict_description}`).join('\n')}`
        }],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    const summaryData = await summaryResponse.json();
    const executiveSummary = summaryData.choices[0].message.content;

    // PROMPT 4: White Space Opportunity Identifier
    const WHITE_SPACE_PROMPT = `You are an innovation strategist identifying patent white space opportunities.

TARGET INVENTION: ${invention_description}
CONFLICTS FOUND: ${conflicts.length}

Identify 3-5 validated "white space" opportunity zones where the client can innovate without patent conflicts.

METHODOLOGY:
1. PATENT DENSITY MAPPING
2. CROSS-DOMAIN ANALYSIS
3. TEMPORAL ANALYSIS (expiring patents)
4. FEATURE COMBINATION
5. MARKET VALIDATION

OUTPUT (JSON):
{
  "white_space_opportunities": [
    {
      "opportunity_id": 1,
      "title": "...",
      "description": "...",
      "technology_category": "...",
      "patent_density": "low/medium",
      "key_differentiators": ["..."],
      "market_potential": {
        "estimated_market_size": "$XXM-$XXM",
        "target_customers": ["..."],
        "competitive_intensity": "low/medium/high",
        "time_to_market": "X months"
      },
      "technical_feasibility": {
        "difficulty": "easy/moderate/hard",
        "required_capabilities": ["..."],
        "development_time": "X months",
        "estimated_cost": "$XX-XXK"
      },
      "patent_strategy": {
        "patentability_assessment": "high/medium/low",
        "recommended_claims_focus": ["..."],
        "prior_art_gaps": "..."
      }
    }
  ]
}`;

    const whiteSpaceResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: WHITE_SPACE_PROMPT
        }, {
          role: 'user',
          content: 'Generate 3-5 white space opportunities.'
        }],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    const whiteSpaceData = await whiteSpaceResponse.json();
    const whiteSpaceOpportunities = JSON.parse(whiteSpaceData.choices[0].message.content);

    // PROMPT 6: Design-Around Strategy Generator
    const DESIGN_AROUND_PROMPT = `You are a product engineer and patent attorney collaborating on design-around strategies.

TARGET INVENTION: ${invention_description}

Generate 3-5 specific, actionable design-around strategies for the top conflicting patents.

CRITERIA:
- Legally Sound (avoids infringement)
- Technically Feasible
- Commercially Viable
- Cost-Effective
- Defensible (creates own IP)

OUTPUT (JSON):
{
  "design_around_strategies": [
    {
      "strategy_id": 1,
      "strategy_name": "...",
      "approach_type": "substitution/omission/addition/rearrangement",
      "detailed_description": "...",
      "specific_changes": ["..."],
      "legal_analysis": {
        "avoids_literal_infringement": true/false,
        "avoids_doctrine_of_equivalents": true/false,
        "confidence_level": "high/medium/low"
      },
      "technical_feasibility": {
        "difficulty": "easy/moderate/hard",
        "development_time": "X weeks"
      },
      "commercial_impact": {
        "performance_change": "+/-X%",
        "cost_change": "+/-$XXX"
      },
      "implementation_cost": {
        "total_estimate": "$XX,XXX - $XX,XXX"
      }
    }
  ]
}`;

    const designAroundResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: DESIGN_AROUND_PROMPT
        }, {
          role: 'user',
          content: `Generate design-around strategies for these conflicts:
${conflicts.slice(0, 5).map((c: any) => `${c.patent_number}: ${c.conflict_description}`).join('\n')}`
        }],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    const designAroundData = await designAroundResponse.json();
    const designAroundStrategies = JSON.parse(designAroundData.choices[0].message.content);

    // Compile full report
    const reportData = {
      executive_summary: executiveSummary,
      methodology: {
        data_sources: ['USPTO PatentsView', 'AI-powered semantic search'],
        search_strategy: 'Enhanced multi-query approach with 10 diverse search strategies',
        analysis_approach: 'AI-assisted conflict detection with comprehensive claim chart analysis',
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
      white_space_opportunities: whiteSpaceOpportunities,
      design_around_strategies: designAroundStrategies,
      next_steps: [
        'Review detailed claim charts for high-risk patents',
        'Consult with patent attorney for FTO opinion',
        'Explore white space opportunities for strategic positioning',
        'Implement recommended design-around strategies',
        'Monitor patent landscape for new filings'
      ]
    };

    // Determine report type based on payment status
    const reportType = analysis.payment_status === 'paid' || analysis.payment_status === 'exemption' ? 'full' : 'snapshot';

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
        status: 'complete',
        progress_percentage: 100,
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
