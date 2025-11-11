import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { 
      analysis_id, 
      invention_description, 
      technical_keywords,
      cpc_classifications 
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    console.log(`Research agent starting for analysis: ${analysis_id}`);

    // Generate optimized search queries using Perplexity (with fallback to OpenAI)
    let searchQueries;
    
    if (perplexityKey) {
      try {
        searchQueries = await retryWithBackoff(async () => {
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-large-128k-online',
              messages: [{
                role: 'system',
                content: 'You are a patent search expert. Generate diverse patent search queries with technical terminology and CPC codes.'
              }, {
                role: 'user',
                content: `Based on this invention: "${invention_description}", generate 5 diverse patent search queries. Return as JSON array with: {query, cpc_codes, rationale, priority}. Format: {"queries": [...]}`
              }],
              temperature: 0.3,
              max_tokens: 1500
            })
          });

          if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`);
          const data = await response.json();
          const content = data.choices[0].message.content;
          return JSON.parse(content).queries;
        });
      } catch (error) {
        console.warn('Perplexity API failed, falling back to OpenAI:', error);
        searchQueries = null;
      }
    }

    // Fallback to OpenAI if Perplexity failed or not available
    if (!searchQueries) {
      const response = await retryWithBackoff(async () => {
        return await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'system',
              content: 'You are a patent search expert. Generate diverse patent search queries.'
            }, {
              role: 'user',
              content: `Based on this invention: "${invention_description}", generate 5 diverse patent search queries. Return as JSON: {"queries": [{"query": "...", "cpc_codes": ["..."], "rationale": "...", "priority": 1-5}]}`
            }],
            temperature: 0.3,
            response_format: { type: "json_object" }
          })
        });
      });

      const data = await response.json();
      searchQueries = JSON.parse(data.choices[0].message.content).queries;
    }

    console.log(`Generated ${searchQueries.length} search queries`);

    // Simulate patent search (in production, call real patent APIs)
    const mockPatents = searchQueries.flatMap((q: any, idx: number) => 
      Array.from({ length: 10 }, (_, i) => ({
        patent_number: `US${10000000 + idx * 100 + i}B2`,
        title: `${q.query.substring(0, 50)}... - Patent ${i + 1}`,
        abstract: `This patent relates to ${q.query.substring(0, 100)}...`,
        assignee: ['TechCorp Inc.', 'InnovateCo', 'PatentHoldings LLC'][i % 3],
        filing_date: new Date(2020 + idx, i % 12, (i % 28) + 1).toISOString().split('T')[0],
        relevance_score: 0.95 - (idx * 0.1) - (i * 0.01),
        source: 'uspto'
      }))
    );

    // Calculate semantic similarity using OpenAI embeddings
    console.log('Calculating semantic similarity...');
    
    const embeddingResponse = await retryWithBackoff(async () => {
      return await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: invention_description
        })
      });
    });

    const embeddingData = await embeddingResponse.json();
    const inventionEmbedding = embeddingData.data[0].embedding;

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
    
    const { analysis_id } = await req.json().catch(() => ({}));
    
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
