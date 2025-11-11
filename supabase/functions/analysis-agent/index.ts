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
    // Parse and validate input
    const body = await req.json();
    const { analysis_id, patents, invention_description } = body;
    
    if (!analysis_id || !validateUUID(analysis_id)) {
      throw new Error('Invalid analysis_id: must be a valid UUID');
    }
    if (!Array.isArray(patents)) {
      throw new Error('Invalid patents: must be an array');
    }
    if (!invention_description || typeof invention_description !== 'string') {
      throw new Error('Invalid invention_description: must be a non-empty string');
    }
    if (invention_description.length > 10000) {
      throw new Error('invention_description too long: max 10,000 characters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    console.log(`Analysis agent processing ${patents.length} patents`);

    // PROMPT 2: Patent Relevance Scoring & Ranking
    const RELEVANCE_SCORING_PROMPT = `You are a patent examiner evaluating prior art relevance. Your task is to score how relevant each patent is to the target invention.

TARGET INVENTION: ${invention_description}

SCORING CRITERIA (1-10 scale for each, then weighted average):

1. TECHNICAL OVERLAP (40% weight): How similar are the technical approaches?
2. CLAIM COVERAGE (30% weight): How much of the target invention is covered by this patent's claims?
3. LEGAL STATUS & ENFORCEABILITY (15% weight): Is this patent currently enforceable?
4. ASSIGNEE RISK PROFILE (10% weight): Is the assignee litigious?
5. CITATION STRENGTH (5% weight): How influential is this patent?

OUTPUT FORMAT (JSON):
{
  "patent_number": "{patent_number}",
  "overall_relevance_score": weighted average (1-10, two decimals),
  "dimension_scores": {
    "technical_overlap": {"score": number, "justification": "..."},
    "claim_coverage": {"score": number, "justification": "..."},
    "legal_status": {"score": number, "justification": "..."},
    "assignee_risk": {"score": number, "justification": "..."},
    "citation_strength": {"score": number, "justification": "..."}
  },
  "risk_level": "critical/high/medium/low",
  "key_overlapping_features": ["feature 1", "feature 2"],
  "recommended_action": "immediate design-around / FTO opinion / monitor / ignore"
}

Be conservative—overestimate risk rather than underestimate.`;

    const conflicts = [];

    // Process top patents for conflict detection
    for (const patent of patents.slice(0, 20)) {
      console.log(`Analyzing patent: ${patent.patent_number}`);

      // STEP 1: Score patent relevance
      const scoringResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: RELEVANCE_SCORING_PROMPT
          }, {
            role: 'user',
            content: `Evaluate this patent:
Patent Number: ${patent.patent_number}
Title: ${patent.title}
Abstract: ${patent.abstract}
Assignee: ${patent.assignee}
Filing Date: ${patent.filing_date}`
          }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      const scoringData = await scoringResponse.json();
      const scoreAnalysis = JSON.parse(scoringData.choices[0].message.content);

      // Only proceed with detailed analysis if relevance score >= 4
      if (scoreAnalysis.overall_relevance_score >= 4) {
        // STEP 2: Generate claim chart for high-risk patents
        const CLAIM_CHART_PROMPT = `You are a patent litigation expert creating claim charts for infringement analysis.

TARGET INVENTION: ${invention_description}

PATENT: ${patent.patent_number} - ${patent.title}

Create a detailed claim-by-claim analysis. For each claim element:
- Quote exact claim language
- Map to specific features of target invention
- Determine "MEETS" or "DOES NOT MEET"
- Explain any ambiguous interpretations

OUTPUT (JSON):
{
  "claim_elements": [
    {
      "element": "...",
      "patent_language": "...",
      "target_feature": "...",
      "meets": true/false,
      "analysis": "..."
    }
  ],
  "infringement_conclusion": {
    "literal_infringement": "yes/no/unclear",
    "doctrine_of_equivalents": "possible/unlikely",
    "overall_assessment": "high risk / medium risk / low risk"
  },
  "design_around_opportunities": ["opportunity 1", "opportunity 2"]
}`;

        const claimChartResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'system',
              content: CLAIM_CHART_PROMPT
            }, {
              role: 'user',
              content: 'Generate the claim chart analysis.'
            }],
            temperature: 0.2,
            response_format: { type: "json_object" }
          })
        });

        const claimData = await claimChartResponse.json();
        const claimAnalysis = JSON.parse(claimData.choices[0].message.content);

        // Calculate conflict severity based on relevance score
        const severityScore = Math.round(scoreAnalysis.overall_relevance_score);

        const conflict = {
          analysis_id,
          patent_number: patent.patent_number,
          patent_title: patent.title,
          assignee: patent.assignee,
          filing_date: patent.filing_date,
          conflict_severity: severityScore,
          claim_overlap_percentage: Math.round(scoreAnalysis.dimension_scores.claim_coverage.score * 10),
          conflict_description: scoreAnalysis.key_overlapping_features.join('; '),
          legal_status: 'active',
          relevant_claims: claimAnalysis.claim_elements
            .filter((e: any) => e.meets)
            .map((e: any) => e.element)
            .slice(0, 5)
        };

        conflicts.push(conflict);

        // Insert conflict into database
        await supabase.from('patent_conflicts').insert(conflict);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
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
