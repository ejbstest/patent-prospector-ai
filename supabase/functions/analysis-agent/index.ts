// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts"
// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to parse AI response content, handling markdown code blocks
function parseAiResponseContent(content: string): any {
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse AI response content:', content, error);
    return {}; // Return empty object to allow continuation
  }
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
    const xaiApiKey = Deno.env.get('XAI_API_KEY')!;

    if (!xaiApiKey) {
      throw new Error('Missing required API key: XAI_API_KEY. Please configure it in Supabase secrets.');
    }

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

      let scoreAnalysis: any = {};
      let claimAnalysis: any = {};
      let severityScore = 0;
      let claimOverlapPercentage = 0;
      let conflictDescription = '';
      let relevantClaims: string[] = [];

      // STEP 1: Score patent relevance
      try {
        const scoringResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${xaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-4-fast-reasoning',
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

        if (!scoringResponse.ok) {
          const errorText = await scoringResponse.text();
          throw new Error(`xAI Relevance Scoring API error: ${scoringResponse.status} - ${errorText}`);
        }

        const scoringData = await scoringResponse.json();
        scoreAnalysis = parseAiResponseContent(scoringData.choices[0].message.content);
        
        severityScore = Math.round(scoreAnalysis.overall_relevance_score || 0);
        claimOverlapPercentage = Math.round((scoreAnalysis.dimension_scores?.claim_coverage?.score || 0) * 10);
        conflictDescription = (scoreAnalysis.key_overlapping_features || []).join('; ');

      } catch (aiError) {
        console.error(`Error scoring patent ${patent.patent_number}:`, aiError);
        // Continue with default/zero scores for this patent
      }

      // Only proceed with detailed analysis if relevance score >= 4 (or default 0 if scoring failed)
      if (severityScore >= 4) {
        // STEP 2: Generate claim chart for high-risk patents
        try {
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

          const claimChartResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${xaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'grok-4-fast-reasoning',
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

          if (!claimChartResponse.ok) {
            const errorText = await claimChartResponse.text();
            throw new Error(`xAI Claim Chart API error: ${claimChartResponse.status} - ${errorText}`);
          }

          const claimData = await claimChartResponse.json();
          claimAnalysis = parseAiResponseContent(claimData.choices[0].message.content);

          relevantClaims = (claimAnalysis.claim_elements || [])
            .filter((e: any) => e.meets)
            .map((e: any) => e.element)
            .slice(0, 5);

        } catch (aiError) {
          console.error(`Error generating claim chart for patent ${patent.patent_number}:`, aiError);
          // Continue with empty relevant claims
        }

        const conflict = {
          analysis_id,
          patent_number: patent.patent_number,
          patent_title: patent.title,
          assignee: patent.assignee,
          filing_date: patent.filing_date,
          conflict_severity: severityScore,
          claim_overlap_percentage: claimOverlapPercentage,
          conflict_description: conflictDescription,
          legal_status: 'active', // This should ideally come from AI or external data
          relevant_claims: relevantClaims
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
      low_severity_conflicts: conflicts.filter(c => c.conflict_severity < 4).length // Corrected low severity count
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
    
    const { analysis_id } = await req.json().catch(() => ({})); // Safely get analysis_id
    
    if (analysis_id) {
      await supabase.from('agent_logs').insert({
        analysis_id,
        agent_name: 'analysis',
        status: 'failed',
        error_message: errorMessage,
        execution_time_ms: executionTime
      });
      // Mark analysis as failed if analysis agent fails
      await supabase
        .from('analyses')
        .update({ status: 'failed' })
        .eq('id', analysis_id);
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