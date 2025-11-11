import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function FormProgress({ currentStep, totalSteps, className }: FormProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {Math.round(percentage)}% complete
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
