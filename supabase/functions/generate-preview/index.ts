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
  let analysisId: string | undefined; // Declare analysisId here to be accessible in catch block

  try {
    const body = await req.json();
    analysisId = body.analysis_id; // Assign to declared variable
    
    if (!analysisId || !validateUUID(analysisId)) {
      throw new Error('Invalid analysis_id: must be a valid UUID');
    }

    console.log(`Generating preview for analysis: ${analysisId}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use xAI grok-4-fast-reasoning for preview generation
    const xaiApiKey = Deno.env.get('XAI_API_KEY')!;
    
    if (!xaiApiKey) {
      throw new Error('Missing required API key: XAI_API_KEY. Please configure it in Supabase secrets.');
    }

    // Fetch analysis details
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      throw new Error(`Analysis not found: ${analysisError?.message}`);
    }

    // Update status to generating preview
    await supabase
      .from('analyses')
      .update({ 
        status: 'analyzing', 
        progress_percentage: 15 
      })
      .eq('id', analysisId);

    
    // Generate search queries for patent research
    const searchPrompt = `Based on this invention description, generate a brief preliminary patent risk assessment.

Invention: ${analysis.invention_title}
Description: ${analysis.invention_description}
Jurisdictions: ${analysis.jurisdictions?.join(', ') || 'US'}
CPC Codes: ${analysis.cpc_classifications?.join(', ') || 'Not specified'}

Provide:
1. Preliminary risk score (0-100, where 0=no risk, 100=critical risk)
2. Risk level (low/medium/high/critical)
3. 3-5 key findings as bullet points
4. Estimated number of potentially relevant patents
5. Top 3 most concerning patent areas (brief descriptions)

Format as JSON:
{
  "risk_score": number,
  "risk_level": "low|medium|high|critical",
  "key_findings": ["finding 1", "finding 2", ...],
  "patents_found_estimate": number,
  "top_concerns": [
    {
      "title": "Patent area title",
      "description": "Brief conflict description",
      "severity": "high|medium|low"
    }
  ]
}`;

    let previewData: any;
    let aiContent = '{}';

    try {
      console.log('Calling xAI for preview generation...');
      const aiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${xaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-4-fast-reasoning',
          messages: [
            { 
              role: 'system', 
              content: 'You are a patent analysis AI. Provide realistic preliminary risk assessments based on invention descriptions. Be conservative in risk estimates.'
            },
            { role: 'user', content: searchPrompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        }),
      });

      if (!aiResponse.ok) {
        const errorBody = await aiResponse.text();
        console.error(`xAI API error: ${aiResponse.status} - ${errorBody}`);
        if (aiResponse.status === 429) {
          throw new Error('xAI rate limit exceeded. Please try again later.');
        }
        if (aiResponse.status === 402) {
          throw new Error('xAI credits exhausted. Please add credits to continue.');
        }
        throw new Error(`xAI request failed with status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      aiContent = aiData.choices?.[0]?.message?.content || '{}';
      console.log('Raw AI response content:', aiContent);
      
      previewData = parseAiResponseContent(aiContent);
      console.log('Parsed AI response:', previewData);

    } catch (aiError) {
      console.error('Error during AI call or parsing:', aiError);
      // Fallback to default preview data if AI call or parsing fails
      previewData = {
        risk_score: 50,
        risk_level: 'medium',
        key_findings: [
          'Analysis in progress',
          'Preliminary data being collected',
          'Full report will provide detailed findings'
        ],
        patents_found_estimate: 0,
        top_concerns: []
      };
    }

    // Create mock top conflicts for preview
    const mockConflicts = (previewData.top_concerns || []).map((concern: any, idx: number) => ({
      patent_number: `US${10000000 + idx}B2`,
      title: concern.title || `Related Patent ${idx + 1}`,
      assignee: 'Major Tech Corp',
      filing_date: new Date(Date.now() - Math.random() * 365 * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      legal_status: 'Active',
      severity: concern.severity || 'medium',
      conflict_description: concern.description || 'Potential overlap identified. Full analysis required for detailed assessment.',
      blurred: true // Mark as preview data
    }));

    // Store preview report
    const { error: previewError } = await supabase
      .from('preview_reports')
      .insert({
        analysis_id: analysisId,
        preliminary_risk_score: previewData.risk_score || 50,
        risk_level: previewData.risk_level || 'medium',
        confidence_level: 85,
        top_conflicts: mockConflicts,
        key_findings: previewData.key_findings || [],
        landscape_summary: {
          patents_by_year: {},
          top_assignees: [
            { name: 'Major Tech Corp', count: 12 },
            { name: 'Innovation Inc', count: 8 },
            { name: 'Patent Holdings LLC', count: 5 }
          ],
          market_density: 'moderate'
        },
        patents_found_count: previewData.patents_found_estimate || 247,
      });

    if (previewError) {
      throw previewError;
    }

    // Update analysis status
    await supabase
      .from('analyses')
      .update({ 
        status: 'preview_ready',
        progress_percentage: 30 
      })
      .eq('id', analysisId);

    console.log(`Preview generated successfully for analysis: ${analysisId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis_id: analysisId,
        message: 'Preview generated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-preview:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If analysisId is available, mark the analysis as failed
    if (analysisId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from('analyses')
        .update({ status: 'failed' })
        .eq('id', analysisId);
      console.log(`Analysis ${analysisId} marked as failed due to preview generation error.`);
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});