import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { FormProgress } from '@/components/intake/FormProgress';
import { StepConfirmation } from '@/components/intake/StepConfirmation';
import { debounce } from '@/lib/utils/formHelpers';
import { createAnalysis } from '@/lib/api/createAnalysis';
import { useToast } from '@/hooks/use-toast';

// Attorney intake steps (11-step flow)
import { Step1FirmInfo } from '@/components/intake/attorney/Step1FirmInfo';
import { Step2InventionOverview } from '@/components/intake/attorney/Step2InventionOverview';
import { Step3TechnicalDetails } from '@/components/intake/attorney/Step3TechnicalDetails';
import { Step4PriorArt } from '@/components/intake/attorney/Step4PriorArt';
import { Step5Classifications } from '@/components/intake/attorney/Step5Classifications';
import { Step6GeographicScope } from '@/components/intake/attorney/Step6GeographicScope';
import { Step7CompetitiveLandscape } from '@/components/intake/attorney/Step7CompetitiveLandscape';
import { Step8BusinessContext } from '@/components/intake/attorney/Step8BusinessContext';
import { Step9AnalysisPreferences } from '@/components/intake/attorney/Step9AnalysisPreferences';
import { Step10DocumentUploads } from '@/components/intake/attorney/Step10DocumentUploads';
import { Step11PaymentDelivery } from '@/components/intake/attorney/Step11PaymentDelivery';

export default function NewAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentStep, formData, setStep, nextStep, prevStep, getTotalSteps, markSaved, reset } = useIntakeFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = debounce(() => {
      markSaved();
      console.log('Form auto-saved to localStorage');
    }, 30000);

    autoSave();
  }, [formData, markSaved]);

  const handleNext = () => {
    nextStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await createAnalysis({ userId: user.id, formData });
      
      if (result.success && result.analysisId) {
        setAnalysisId(result.analysisId);
        nextStep(); // Move to confirmation
        reset(); // Clear form data
        toast({ title: 'Analysis submitted successfully!' });
      } else {
        throw new Error('Failed to create analysis');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 11; // Fixed 11-step attorney flow
  const isConfirmation = analysisId !== null;

  // Render confirmation
  if (isConfirmation) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <StepConfirmation analysisId={analysisId} />
      </div>
    );
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1FirmInfo onNext={handleNext} onBack={() => {}} />;
      case 2:
        return <Step2InventionOverview onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3TechnicalDetails onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4PriorArt onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Step5Classifications onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <Step6GeographicScope onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <Step7CompetitiveLandscape onNext={handleNext} onBack={handleBack} />;
      case 8:
        return <Step8BusinessContext onNext={handleNext} onBack={handleBack} />;
      case 9:
        return <Step9AnalysisPreferences onNext={handleNext} onBack={handleBack} />;
      case 10:
        return <Step10DocumentUploads onNext={handleNext} onBack={handleBack} />;
      case 11:
        return <Step11PaymentDelivery onNext={handleSubmit} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New FTO Analysis</h1>
        <p className="text-muted-foreground mt-2">
          White-labeled Freedom to Operate report delivered in 24 hours
        </p>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="bg-card border border-border rounded-lg p-8">
        {renderStep()}
      </div>
    </div>
  );
}
