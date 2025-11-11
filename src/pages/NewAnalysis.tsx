import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { FormProgress } from '@/components/intake/FormProgress';
import { StepConfirmation } from '@/components/intake/StepConfirmation';
import { debounce } from '@/lib/utils/formHelpers';
import { createAnalysis } from '@/lib/api/createAnalysis';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Check, Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftManager } from '@/components/intake/DraftManager';
import { SaveDraftDialog } from '@/components/intake/SaveDraftDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
  const { currentStep, formData, setStep, nextStep, prevStep, markSaved, reset, isDirty, lastSaved, updateFormData } = useIntakeFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isExemptionAnalysis, setIsExemptionAnalysis] = useState(false);
  const [showDraftManager, setShowDraftManager] = useState(false);
  const [showSaveDraft, setShowSaveDraft] = useState(false);

  // Auto-save every 30 seconds (stable debounced function)
  const debouncedSaveRef = useRef<() => void>();
  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      markSaved();
      console.log('Form auto-saved to localStorage');
    }, 30000);
  }, [markSaved]);

  useEffect(() => {
    debouncedSaveRef.current?.();
  }, [formData]);

  const handleNext = () => {
    markSaved(); // Auto-save when progressing to next step
    nextStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    markSaved(); // Auto-save when going back
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadDraft = (draft: any) => {
    setStep(draft.current_step);
    const d = draft.form_data || {};
    const normalized = {
      targetMarkets: Array.isArray(d.targetMarkets) ? d.targetMarkets : (d.targetMarkets ? [d.targetMarkets] : []),
      priorityJurisdiction: typeof d.priorityJurisdiction === 'string' ? d.priorityJurisdiction : '',
      reportFormats: Array.isArray(d.reportFormats) ? d.reportFormats : (d.reportFormats ? [d.reportFormats] : ['pdf']),
    };
    updateFormData({ ...d, ...normalized });
    toast({
      title: 'Draft loaded',
      description: `Continuing from step ${draft.current_step}`,
    });
  };

  const handleSubmit = async (isExemption = false) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await createAnalysis({ userId: user.id, formData, isExemption });
      
      if (result.success && result.analysisId) {
        setAnalysisId(result.analysisId);
        setIsExemptionAnalysis(isExemption);
        nextStep(); // Move to confirmation
        reset(); // Clear form data
        toast({ 
          title: isExemption ? 'Exemption analysis created!' : 'Analysis submitted successfully!',
          description: isExemption ? 'Your complimentary report will be generated.' : undefined
        });
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

  const handleExemptionSubmit = () => handleSubmit(true);

  const totalSteps = 11; // Fixed 11-step attorney flow
  const isConfirmation = analysisId !== null;

  // Render confirmation
  if (isConfirmation) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <StepConfirmation analysisId={analysisId} isExemption={isExemptionAnalysis} />
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
        return <Step11PaymentDelivery onNext={() => handleSubmit(false)} onExemption={handleExemptionSubmit} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">New FTO Analysis</h1>
          <p className="text-muted-foreground mt-2">
            White-labeled Freedom to Operate report delivered in 24 hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isDirty && lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">Saved {format(lastSaved, 'p')}</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDraftManager(true)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDraft(true)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <FormProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="bg-card border border-border rounded-lg p-8">
        <ErrorBoundary>
          {renderStep()}
        </ErrorBoundary>
      </div>

      <DraftManager
        open={showDraftManager}
        onClose={() => setShowDraftManager(false)}
        onLoadDraft={handleLoadDraft}
      />

      <SaveDraftDialog
        open={showSaveDraft}
        onClose={() => setShowSaveDraft(false)}
      />
    </div>
  );
}
