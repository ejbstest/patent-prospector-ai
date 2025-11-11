import { cn } from '@/lib/utils';

interface RiskMeterProps {
  score: number; // 0-100
  size?: number;
  showLabel?: boolean;
}

export function RiskMeter({ score, size = 150, showLabel = true }: RiskMeterProps) {
  const getRiskLevel = () => {
    if (score < 25) return { label: 'Low', color: 'text-success', bgColor: 'bg-success' };
    if (score < 50) return { label: 'Medium', color: 'text-warning', bgColor: 'bg-warning' };
    if (score < 75) return { label: 'High', color: 'text-destructive', bgColor: 'bg-destructive' };
    return { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive' };
  };

  const risk = getRiskLevel();
  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`hsl(var(--${score < 25 ? 'success' : score < 50 ? 'warning' : 'destructive'}))`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('text-4xl font-bold', risk.color)}>{score}</div>
          <div className="text-xs text-muted-foreground">Risk Score</div>
        </div>
      </div>
      {showLabel && (
        <div className={cn('px-3 py-1 rounded-full text-sm font-medium', risk.bgColor, 'text-white')}>
          {risk.label} Risk
        </div>
      )}
    </div>
  );
}
