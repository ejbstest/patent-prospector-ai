import { supabase } from '@/integrations/supabase/client';
import type { FormData } from '@/stores/intakeFormStore';

interface CreateAnalysisParams {
  userId: string;
  formData: FormData;
  isExemption?: boolean;
}

export async function createAnalysis({ userId, formData, isExemption = false }: CreateAnalysisParams) {
  try {
    // Map attorney intake form data to analyses table fields
    const inventionTitle = formData.inventionTitle || 'Untitled Invention';
    
    // Build comprehensive invention description from multiple fields
    const descriptionParts = [
      formData.valueProp ? `Value Proposition: ${formData.valueProp}` : '',
      formData.problemBeingSolved ? `Problem: ${formData.problemBeingSolved}` : '',
      formData.solutionApproach ? `Solution: ${formData.solutionApproach}` : '',
      formData.technicalDescription || '',
      formData.targetCustomers ? `Target Customers: ${formData.targetCustomers}` : '',
    ].filter(Boolean);
    
    const inventionDescription = descriptionParts.join('\n\n');
    
    // Map geographic data
    const jurisdictions = formData.targetMarkets || [];
    
    // Map classification data
    const cpcClassifications = formData.selectedClassifications || [];
    
    // Extract keywords from innovations and other sources
    const technicalKeywords = [
      ...(formData.keyInnovations || []),
      formData.inventionCategory || '',
      formData.primaryDomain || '',
    ].filter(Boolean);
    
    // Determine analysis type from preferences
    const analysisType: 'standard' | 'premium_whitespace' = 
      formData.analysisDepth === 'comprehensive' ? 'premium_whitespace' : 'standard';
    
    // Handle exemption vs normal payment
    const paymentStatus: 'unpaid' | 'pending' | 'paid' | 'exemption' = 
      isExemption ? 'exemption' : 'pending';
    const amountPaid = isExemption ? 0 : null; // Exemptions are $0, others updated after payment

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert([{
        user_id: userId,
        invention_title: inventionTitle,
        invention_description: inventionDescription,
        jurisdictions,
        cpc_classifications: cpcClassifications,
        technical_keywords: technicalKeywords,
        analysis_type: analysisType,
        payment_status: paymentStatus,
        amount_paid: amountPaid,
        status: 'intake', // Start in intake state, orchestrator will transition
        progress_percentage: 0,
      }] as any)
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Upload files to storage (best-effort, non-blocking)
    if (Array.isArray(formData.uploadedFiles) && formData.uploadedFiles.length > 0) {
      const uploadTasks = formData.uploadedFiles.map(async ({ file }) => {
        try {
          const filePath = `${userId}/${analysis.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('analysis-documents')
            .upload(filePath, file);

          if (uploadError) {
            console.warn('File upload failed (continuing):', uploadError);
            return;
          }

          const { error: docError } = await supabase
            .from('uploaded_documents')
            .insert({
              analysis_id: analysis.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
            });

          if (docError) {
            console.warn('Document record insert failed (continuing):', docError);
          }
        } catch (e) {
          console.warn('Unexpected error during file upload (continuing):', e);
        }
      });

      await Promise.allSettled(uploadTasks);
    }

    // Trigger workflow if exemption (immediate) or after payment confirmation
    if (isExemption) {
      console.log('Exemption analysis - triggering workflow immediately:', analysis.id);
      
      // Trigger the start-analysis edge function to orchestrate the workflow
      try {
        const { data: startData, error: startError } = await supabase.functions.invoke('start-analysis', {
          body: { analysis_id: analysis.id }
        });
        
        if (startError) {
          console.error('Error starting analysis workflow:', startError);
          throw startError;
        }
        
        console.log('Workflow triggered successfully for exemption analysis:', startData);
      } catch (workflowError) {
        console.error('Error triggering workflow:', workflowError);
        // Mark analysis as failed if workflow doesn't start
        await supabase
          .from('analyses')
          .update({ status: 'failed' })
          .eq('id', analysis.id);
        throw workflowError;
      }
    } else {
      console.log('Analysis created successfully:', analysis.id);
      console.log('Awaiting payment confirmation to start analysis...');
    }

    return { success: true, analysisId: analysis.id, isExemption };
  } catch (error) {
    console.error('Error creating analysis:', error);
    return { success: false, error };
  }
}
