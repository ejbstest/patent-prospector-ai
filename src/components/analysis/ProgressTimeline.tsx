import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  label: string;
  status: 'complete' | 'in-progress' | 'pending';
  count?: number;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function ProgressTimeline({ steps, className }: ProgressTimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {step.status === 'complete' && (
              <CheckCircle2 className="w-5 h-5 text-success" />
            )}
            {step.status === 'in-progress' && (
              <Loader2 className="w-5 h-5 text-secondary animate-spin" />
            )}
            {step.status === 'pending' && (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className={cn(
              'text-sm',
              step.status === 'complete' && 'text-success',
              step.status === 'in-progress' && 'text-secondary font-medium',
              step.status === 'pending' && 'text-muted-foreground'
            )}>
              {step.label}
              {step.count && step.status === 'in-progress' && (
                <span className="ml-2 text-xs">({step.count} items)</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
