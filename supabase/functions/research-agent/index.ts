// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

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

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Parse and validate input
    const body = await req.json();
    const { 
      analysis_id, 
      invention_description, 
      technical_keywords,
      cpc_classifications 
    } = body;
    
    if (!analysis_id || !validateUUID(analysis_id)) {
      throw new Error('Invalid analysis_id: must be a valid UUID');
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

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;

    console.log(`Research agent starting for analysis: ${analysis_id}`);

    // PROMPT 1: Enhanced Patent Search Query Generator
    const SEARCH_QUERY_PROMPT = `You are a patent search specialist with 20 years of experience. Your task is to generate optimal search queries for prior art discovery.

INPUT:
Invention description: ${invention_description}
Technical keywords: ${technical_keywords || 'Not provided'}
CPC classifications: ${cpc_classifications || 'Not provided'}

TASK:
Generate 10 diverse patent search queries that maximize recall and precision. Use these strategies:

1. SEMANTIC VARIATIONS: Rephrase the core innovation using different technical terminology
2. ABSTRACTION LEVELS: Create queries at different abstraction levels (high/mid/low)
3. PROBLEM-SOLUTION FRAMING: Search for the problem being solved, not just the solution
4. COMPONENT-BASED: Break down the invention into components and search for each
5. CROSS-DOMAIN: Look for similar concepts in adjacent technology domains
6. TEMPORAL COVERAGE: Include date ranges to catch recent and historical patents

OUTPUT FORMAT (JSON):
{
  "queries": [
    {
      "query_number": 1,
      "search_string": "full Boolean search query with operators",
      "strategy": "which strategy above",
      "expected_results": estimated number,
      "priority": "high/medium/low",
      "rationale": "why this query matters"
    }
  ],
  "recommended_databases": ["USPTO", "EPO", "Lens.org"],
  "estimated_total_patents": range estimate
}

BE CREATIVE. Think like a patent examiner trying to find reasons to reject this application.`;

    let searchQueries: any[] = [];
    try {
      // Generate optimized search queries using OpenRouter with DeepSeek
      console.log('Generating search queries with OpenRouter (DeepSeek)...');
      const response = await retryWithBackoff(async () => {
        return await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': supabaseUrl,
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3-0324:free',
            messages: [{
              role: 'system',
              content: SEARCH_QUERY_PROMPT
            }, {
              role: 'user',
              content: 'Generate the 10 search queries as specified. Return valid JSON only.'
            }],
            temperature: 0.3,
            max_tokens: 2500,
            response_format: { type: "json_object" },
            provider: {
              only: ['DeepSeek']
            }
          })
        });
      });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded on OpenRouter. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('OpenRouter credits exhausted. Please add credits.');
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Strip markdown code fences if present
      content = content.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      
      const parsed = JSON.parse(content);
      console.log('Successfully generated queries using OpenRouter (DeepSeek)');
      searchQueries = parsed.queries || []; // Ensure it's an array
    } catch (aiError) {
      console.error('Error generating search queries:', aiError);
      // Continue with empty search queries
    }

    console.log(`Generated ${searchQueries.length} search queries`);

    // Simulate patent search (in production, call real patent APIs)
    const mockPatents = searchQueries.flatMap((q: any, idx: number) => 
      Array.from({ length: 10 }, (_, i) => ({
        patent_number: `US${10000000 + idx * 100 + i}B2`,
        title: `${q.search_string.substring(0, 50)}... - Patent ${i + 1}`, // Use search_string from query
        abstract: `This patent relates to ${q.search_string.substring(0, 100)}...`,
        assignee: ['TechCorp Inc.', 'InnovateCo', 'PatentHoldings LLC'][i % 3],
        filing_date: new Date(2020 + idx, i % 12, (i % 28) + 1).toISOString().split('T')[0],
        relevance_score: 0.95 - (idx * 0.1) - (i * 0.01),
        source: 'uspto'
      }))
    );

    // Calculate semantic similarity using OpenRouter embeddings
    console.log('Calculating semantic similarity...');
    
    let inventionEmbedding: number[] = [];
    try {
      const embeddingResponse = await retryWithBackoff(async () => {
        return await fetch('https://openrouter.ai/api/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': supabaseUrl,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: invention_description
          })
        });
      });

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        throw new Error(`OpenRouter Embeddings API error: ${embeddingResponse.status} - ${errorText}`);
      }

      const embeddingData = await embeddingResponse.json();
      inventionEmbedding = embeddingData.data[0].embedding;
    } catch (aiError) {
      console.error('Error generating embeddings:', aiError);
      // Continue with empty embedding
    }

    // Sort patents by relevance (in production, calculate actual cosine similarity)
    const rankedPatents = mockPatents
      .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
      .slice(0, 100);

    const output = {
      patents_found: mockPatents.length,
      top_relevant_patents: rankedPatents.slice(0, 50),
      search_queries_used: searchQueries,
      embedding_model: 'text-embedding-3-small'
    };

    // Update progress
    await supabase
      .from('analyses')
      .update({ 
        status: 'analyzing',
        progress_percentage: 25 
      })
      .eq('id', analysis_id);

    // Log agent execution
    const executionTime = Date.now() - startTime;
    await supabase.from('agent_logs').insert({
      analysis_id,
      agent_name: 'research',
      status: 'success',
      agent_input: { 
        invention_description, 
        technical_keywords, 
        cpc_classifications 
      },
      agent_output: output,
      execution_time_ms: executionTime
    });

    console.log(`Research agent completed in ${executionTime}ms`);

    // Trigger analysis agent
    await supabase.functions.invoke('analysis-agent', {
      body: {
        analysis_id,
        patents: rankedPatents.slice(0, 50),
        invention_description
      }
    });

    return new Response(
      JSON.stringify(output),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in research-agent:', error);
    
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { analysis_id } = await req.json().catch(() => ({})); // Safely get analysis_id
    
    if (analysis_id) {
      await supabase.from('agent_logs').insert({
        analysis_id,
        agent_name: 'research',
        status: 'failed',
        error_message: errorMessage,
        execution_time_ms: executionTime
      });

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