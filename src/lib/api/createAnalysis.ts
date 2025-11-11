import { supabase } from '@/integrations/supabase/client';
import type { FormData } from '@/stores/intakeFormStore';

interface CreateAnalysisParams {
  userId: string;
  formData: FormData;
}

export async function createAnalysis({ userId, formData }: CreateAnalysisParams) {
  try {
    // Prepare analysis data based on user type
    let inventionTitle = '';
    let inventionDescription = '';
    let jurisdictions: string[] = [];
    let cpcClassifications: string[] = [];

    if (formData.userType === 'novice') {
      inventionTitle = formData.productDescription?.slice(0, 100) || 'Product Analysis';
      inventionDescription = [
        formData.productDescription,
        formData.uniqueness,
        formData.competitors?.length ? `Competitors: ${formData.competitors.join(', ')}` : '',
      ].filter(Boolean).join('\n\n');
      jurisdictions = formData.regions || [];
    } else if (formData.userType === 'intermediate') {
      inventionTitle = formData.technicalDescription?.slice(0, 100) || 'Technical Invention';
      inventionDescription = [
        formData.technicalDescription,
        formData.innovations?.length ? `Innovations:\n${formData.innovations.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}` : '',
      ].filter(Boolean).join('\n\n');
      jurisdictions = formData.jurisdictions || [];
      cpcClassifications = formData.cpcCodes || [];
    } else if (formData.userType === 'expert') {
      inventionTitle = formData.disclosure?.slice(0, 100) || 'Expert Analysis';
      inventionDescription = [
        formData.disclosure,
        formData.claims?.length ? `Claims:\n${formData.claims.map((c, idx) => `${idx + 1}. ${c}`).join('\n')}` : '',
      ].filter(Boolean).join('\n\n');
      jurisdictions = ['US']; // Default for experts
      cpcClassifications = formData.ipcCpcCodes || [];
    }

    // All analyses start as free preview (unpaid)
    const analysisType: 'standard' | 'premium' | 'whitespace' = 'standard';
    const paymentStatus: 'unpaid' | 'pending' | 'paid' = 'unpaid';
    const amountPaid = null;

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert([{
        user_id: userId,
        invention_title: inventionTitle,
        invention_description: inventionDescription,
        jurisdictions,
        cpc_classifications: cpcClassifications,
        analysis_type: analysisType,
        payment_status: paymentStatus,
        amount_paid: amountPaid,
        status: 'searching',
        progress_percentage: 5,
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

    // Trigger preview generation workflow
    console.log('Analysis created successfully:', analysis.id);
    console.log('Triggering preview generation...');
    
    // Call the preview generation edge function (fire and forget)
    supabase.functions.invoke('generate-preview', {
      body: { analysis_id: analysis.id }
    }).then(({ error }) => {
      if (error) console.error('Preview generation failed:', error);
      else console.log('Preview generation started');
    });

    return { success: true, analysisId: analysis.id };
  } catch (error) {
    console.error('Error creating analysis:', error);
    return { success: false, error };
  }
}
