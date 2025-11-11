import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { FormProgress } from '@/components/intake/FormProgress';
import { Step1UserType } from '@/components/intake/Step1UserType';
import { StepPricing } from '@/components/intake/StepPricing';
import { StepConfirmation } from '@/components/intake/StepConfirmation';
import { debounce } from '@/lib/utils/formHelpers';
import { createAnalysis } from '@/lib/api/createAnalysis';
import { useToast } from '@/hooks/use-toast';

// Novice steps
import { Step2Product } from '@/components/intake/novice/Step2Product';
import { Step3Uniqueness } from '@/components/intake/novice/Step3Uniqueness';
import { Step4Competitors } from '@/components/intake/novice/Step4Competitors';
import { Step5Regions } from '@/components/intake/novice/Step5Regions';
import { Step6Files as NoviceStep6Files } from '@/components/intake/novice/Step6Files';

// Intermediate steps
import { Step2Description } from '@/components/intake/intermediate/Step2Description';
import { Step3Innovations } from '@/components/intake/intermediate/Step3Innovations';
import { Step4CPC } from '@/components/intake/intermediate/Step4CPC';
import { Step5PriorArt } from '@/components/intake/intermediate/Step5PriorArt';
import { Step6Jurisdictions } from '@/components/intake/intermediate/Step6Jurisdictions';
import { Step7Files as IntermediateStep7Files } from '@/components/intake/intermediate/Step7Files';

// Expert steps
import { Step2Disclosure } from '@/components/intake/expert/Step2Disclosure';
import { Step3Claims } from '@/components/intake/expert/Step3Claims';
import { Step4Classifications } from '@/components/intake/expert/Step4Classifications';
import { Step5Assignees } from '@/components/intake/expert/Step5Assignees';
import { Step6PriorArt as ExpertStep6PriorArt } from '@/components/intake/expert/Step6PriorArt';
import { Step7Parameters } from '@/components/intake/expert/Step7Parameters';
import { Step8Files as ExpertStep8Files } from '@/components/intake/expert/Step8Files';

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

  const totalSteps = getTotalSteps();
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
    // Step 1: User type
    if (currentStep === 1) {
      return <Step1UserType onNext={handleNext} />;
    }

    // Novice flow
    if (formData.userType === 'novice') {
      if (currentStep === 2) return <Step2Product onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 3) return <Step3Uniqueness onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 4) return <Step4Competitors onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 5) return <Step5Regions onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 6) return <NoviceStep6Files onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 7) return <StepPricing onNext={handleSubmit} onBack={handleBack} />;
    }

    // Intermediate flow
    if (formData.userType === 'intermediate') {
      if (currentStep === 2) return <Step2Description onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 3) return <Step3Innovations onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 4) return <Step4CPC onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 5) return <Step5PriorArt onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 6) return <Step6Jurisdictions onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 7) return <IntermediateStep7Files onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 8) return <StepPricing onNext={handleSubmit} onBack={handleBack} />;
    }

    // Expert flow
    if (formData.userType === 'expert') {
      if (currentStep === 2) return <Step2Disclosure onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 3) return <Step3Claims onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 4) return <Step4Classifications onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 5) return <Step5Assignees onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 6) return <ExpertStep6PriorArt onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 7) return <Step7Parameters onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 8) return <ExpertStep8Files onNext={handleNext} onBack={handleBack} />;
      if (currentStep === 9) return <StepPricing onNext={handleSubmit} onBack={handleBack} />;
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New IP Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Start a comprehensive intellectual property risk assessment
        </p>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="bg-card border border-border rounded-lg p-8">
        {renderStep()}
      </div>
    </div>
  );
}
