import { supabase } from '@/integrations/supabase/client';
import type { FormData } from '@/stores/intakeFormStore';

interface CreateAnalysisParams {
  userId: string;
  formData: FormData;
}

export async function createAnalysis({ userId, formData }: CreateAnalysisParams) {
  try {
    // Map attorney intake form data to analyses table fields
    // Note: The form components currently use temporary mappings to the old FormData structure
    // We extract the data from those temporary fields
    
    const inventionTitle = formData.disclosure || 'Untitled Invention'; // From Step2
    const inventionDescription = formData.technicalDescription || ''; // From Step3
    const jurisdictions = formData.regions || []; // From Step6
    const cpcClassifications = formData.cpcCodes || []; // From Step5
    
    // Extract keywords from innovations for technical_keywords
    const technicalKeywords = formData.innovations || [];
    
    // Determine analysis type (standard vs comprehensive) from Step9
    // For now, default to 'standard' until we fully integrate Step9 data
    const analysisType: 'standard' | 'premium' | 'whitespace' = 'standard';
    
    // All new analyses start as paid (attorney flow requires payment upfront)
    const paymentStatus: 'unpaid' | 'pending' | 'paid' = 'pending';
    const amountPaid = null; // Will be updated after Stripe payment

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
        status: 'submitted', // Start in submitted state, will move to queued after payment
        progress_percentage: 0,
      }] as any)
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Upload files to storage
    if (formData.uploadedFiles.length > 0) {
      const uploadPromises = formData.uploadedFiles.map(async ({ file }) => {
        const filePath = `${userId}/${analysis.id}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('analysis-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { error: docError } = await supabase
          .from('uploaded_documents')
          .insert({
            analysis_id: analysis.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
          });

        if (docError) throw docError;
      });

      await Promise.all(uploadPromises);
    }

    // Note: Analysis workflow will be triggered after payment is confirmed
    // For now, we don't trigger any automated workflow until payment is processed
    console.log('Analysis created successfully:', analysis.id);
    console.log('Awaiting payment confirmation to start analysis...');

    return { success: true, analysisId: analysis.id };
  } catch (error) {
    console.error('Error creating analysis:', error);
    return { success: false, error };
  }
}
