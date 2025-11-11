import { RiskMeter } from '@/components/analysis/RiskMeter';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ExecutiveSummaryProps {
  riskScore: number;
  riskLevel: string;
  keyFindings: string[];
  recommendation: 'proceed' | 'caution' | 'halt';
  estimatedCost: number;
}

export function ExecutiveSummary({
  riskScore,
  riskLevel,
  keyFindings,
  recommendation,
  estimatedCost,
}: ExecutiveSummaryProps) {
  const recommendationConfig = {
    proceed: {
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Green Light - Proceed with Confidence',
      description: 'IP risks are manageable with minimal mitigation required',
    },
    caution: {
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      label: 'Yellow Light - Proceed with Caution',
      description: 'Moderate IP risks identified. Implement recommended mitigation strategies',
    },
    halt: {
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      label: 'Red Light - Significant Concerns',
      description: 'High IP risks require immediate attention before proceeding',
    },
  };

  const config = recommendationConfig[recommendation];
  const Icon = config.icon;

  return (
    <section id="executive-summary" className="space-y-8 page-break-after">
      <div>
        <h2 className="text-3xl font-bold mb-2">Executive Summary</h2>
        <p className="text-muted-foreground">
          A high-level overview of IP risks and recommended actions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <RiskMeter score={riskScore} size={220} />
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${config.bgColor}`}>
            <div className="flex items-start gap-3">
              <Icon className={`w-6 h-6 ${config.color} mt-1`} />
              <div>
                <h3 className={`font-bold ${config.color}`}>{config.label}</h3>
                <p className="text-sm mt-1">{config.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm">
              Estimated mitigation cost: <strong className="text-foreground">${estimatedCost.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Key Findings</h3>
        <ul className="space-y-3">
          {keyFindings.map((finding, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">{index + 1}</span>
              </div>
              <p className="text-sm flex-1">{finding}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
