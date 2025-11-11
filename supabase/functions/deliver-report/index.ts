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
    const { analysis_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Delivering report for analysis: ${analysis_id}`);

    // Fetch analysis and user data
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq('id', analysis_id)
      .single();

    if (!analysis) throw new Error('Analysis not found');

    const user = analysis.profiles as any;

    // Mark analysis as complete
    await supabase
      .from('analyses')
      .update({ 
        status: 'complete',
        progress_percentage: 100
      })
      .eq('id', analysis_id);

    // Send email notification
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendKey) {

      const dashboardLink = `${supabaseUrl.replace('supabase.co', 'lovable.app')}/dashboard/analysis/${analysis_id}`;
      const reportLink = `${dashboardLink}/report`;

      const riskBadgeColor = 
        analysis.risk_level === 'low' ? '#00D084' :
        analysis.risk_level === 'medium' ? '#FFB020' :
        analysis.risk_level === 'high' ? '#FF6B35' : '#DC2626';

      const emailHtml = analysis.payment_status === 'paid' 
        ? `
          <h1>Your IP Risk Analysis is Complete!</h1>
          <p>Hi ${user.full_name || 'there'},</p>
          <p>Your IP risk analysis for <strong>"${analysis.invention_title}"</strong> is ready.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0;"><strong>Risk Level:</strong> <span style="color: ${riskBadgeColor}; font-weight: bold; text-transform: uppercase;">${analysis.risk_level}</span></p>
            <p style="margin: 10px 0 0;"><strong>Overall Score:</strong> ${analysis.risk_score}/100</p>
          </div>
          <p><a href="${reportLink}" style="display: inline-block; padding: 12px 24px; background: #1A2332; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">View Complete Report</a></p>
          <p style="color: #666; font-size: 14px;">Questions? Reply to this email or schedule a consultation.</p>
          <p>Best,<br>The Aegis Team</p>
        `
        : `
          <h1>Your IP Risk Snapshot is Ready!</h1>
          <p>Hi ${user.full_name || 'there'},</p>
          <p>Your free IP risk snapshot for <strong>"${analysis.invention_title}"</strong> is complete.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0;"><strong>Risk Level:</strong> <span style="color: ${riskBadgeColor}; font-weight: bold; text-transform: uppercase;">${analysis.risk_level}</span></p>
            <p style="margin: 10px 0 0;"><strong>Overall Score:</strong> ${analysis.risk_score}/100</p>
          </div>
          <p><a href="${dashboardLink}" style="display: inline-block; padding: 12px 24px; background: #0099FF; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">View Free Snapshot</a></p>
          <p><strong>Want the full analysis?</strong> Upgrade to see detailed claim charts, design-around strategies, and actionable recommendations.</p>
          <p><a href="${dashboardLink}" style="color: #0099FF;">Upgrade to Full Report ($2,500)</a></p>
          <p style="color: #666; font-size: 14px;">Questions? Reply to this email.</p>
          <p>Best,<br>The Aegis Team</p>
        `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Aegis IP Analysis <onboarding@resend.dev>',
          to: [user.email],
          subject: `Your IP Risk Analysis for "${analysis.invention_title}" is Ready`,
          html: emailHtml
        })
      });

      if (!emailResponse.ok) {
        console.error('Resend API error:', await emailResponse.text());
      }

      console.log(`Email sent to ${user.email}`);
    } else {
      console.log('RESEND_API_KEY not configured, skipping email');
    }

    // Log completion
    const executionTime = Date.now() - startTime;
    await supabase.from('agent_logs').insert({
      analysis_id,
      agent_name: 'qa',
      status: 'success',
      agent_input: { analysis_id },
      agent_output: { status: 'complete', email_sent: !!resendKey },
      execution_time_ms: executionTime
    });

    console.log(`Report delivery completed in ${executionTime}ms`);

    return new Response(
      JSON.stringify({ success: true, message: 'Report delivered' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deliver-report:', error);
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
