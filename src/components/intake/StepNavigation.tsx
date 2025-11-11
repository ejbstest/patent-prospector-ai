import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  canGoNext: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export function StepNavigation({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext,
  isLastStep = false,
  isLoading = false,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      {canGoBack && onBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      ) : (
        <div />
      )}
      
      <Button
        type="button"
        onClick={onNext}
        disabled={!canGoNext || isLoading}
      >
        {isLoading ? (
          'Processing...'
        ) : isLastStep ? (
          'Submit Analysis'
        ) : (
          <>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
