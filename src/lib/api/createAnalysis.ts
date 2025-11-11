import { supabase } from '@/integrations/supabase/client';
import type { FormData } from '@/stores/intakeFormStore';

interface CreateAnalysisParams {
  userId: string;
  formData: FormData;
}

export async function createAnalysis({ userId, formData }: CreateAnalysisParams) {
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
    const analysisType: 'standard' | 'premium' | 'whitespace' = 
      formData.analysisDepth === 'comprehensive' ? 'premium' : 'standard';
    
    // All new analyses start as pending payment
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
