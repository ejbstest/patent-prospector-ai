import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  FileText,
  Clock,
  Building2,
  Calendar,
  Shield,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewReport {
  preliminary_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_level: number;
  top_conflicts: Array<{
    patent_number: string;
    title: string;
    assignee: string;
    filing_date: string;
    legal_status: string;
    severity: 'low' | 'medium' | 'high';
    conflict_description: string;
    blurred?: boolean;
  }>;
  key_findings: string[];
  landscape_summary: {
    patents_by_year?: Record<string, number>;
    top_assignees: Array<{ name: string; count: number }>;
    market_density: string;
  };
  patents_found_count: number;
}

interface FreePreviewReportProps {
  preview: PreviewReport;
  analysisId: string;
  onUpgrade: () => void;
}

export function FreePreviewReport({ preview, analysisId, onUpgrade }: FreePreviewReportProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Preview Badge */}
      <div className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 rounded-lg py-3 px-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-medium text-primary">AI-Generated Free Preview</span>
        <Badge variant="outline" className="ml-2">85% Confidence</Badge>
      </div>

      {/* 1. Overall Risk Indicator */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl">Preliminary Risk Assessment</CardTitle>
          <CardDescription>Based on initial AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Meter */}
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(preview.preliminary_risk_score / 100) * 552.64} 552.64`}
                  className={cn(
                    preview.risk_level === 'critical' && 'text-red-500',
                    preview.risk_level === 'high' && 'text-orange-500',
                    preview.risk_level === 'medium' && 'text-yellow-500',
                    preview.risk_level === 'low' && 'text-green-500'
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{preview.preliminary_risk_score}</span>
                <span className="text-sm text-muted-foreground">Risk Score</span>
              </div>
            </div>
            
            <Badge className={cn('text-lg py-2 px-4', getRiskColor(preview.risk_level))}>
              {preview.risk_level.toUpperCase()} RISK
            </Badge>

            <p className="text-center text-muted-foreground max-w-md">
              We identified <strong className="text-foreground">{preview.top_conflicts.length} potential patent conflicts</strong> that require detailed analysis. 
              Upgrade for complete claim-by-claim comparison and expert review.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Key Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {preview.key_findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {finding.startsWith('✓') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{finding.replace(/^[✓⚠️]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 3. Top Concerning Patents */}
      <Card>
        <CardHeader>
          <CardTitle>Top {preview.top_conflicts.length} Concerning Patents</CardTitle>
          <CardDescription>
            Partially revealed - upgrade for full claim analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview.top_conflicts.map((conflict, idx) => (
            <div key={idx} className="relative border rounded-lg p-4 space-y-3">
              {/* Patent Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {conflict.patent_number}
                    </Badge>
                    <Badge className={getSeverityColor(conflict.severity)}>
                      {conflict.severity} severity
                    </Badge>
                  </div>
                  <h4 className="font-semibold">{conflict.title}</h4>
                </div>
              </div>

              {/* Patent Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{conflict.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Filed: {conflict.filing_date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>{conflict.legal_status}</span>
                </div>
              </div>

              {/* Conflict Description (Partially Blurred) */}
              <div className="relative">
                <p className="text-sm leading-relaxed">
                  {conflict.conflict_description.split('.').slice(0, 2).join('.')}. 
                </p>
                <div className="mt-2 p-4 bg-muted/50 backdrop-blur-sm border border-dashed rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Detailed claim comparison locked
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onUpgrade}>
                    Unlock <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Full Report Includes:</p>
            <p className="text-xs text-muted-foreground mt-1">
              All {preview.patents_found_count}+ identified patents • Claim charts • Design-around strategies
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Technology Landscape Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Technology Landscape Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Top Patent Holders in Your Space</h4>
            <div className="space-y-2">
              {preview.landscape_summary.top_assignees.map((assignee, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm w-4 text-muted-foreground">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{assignee.name}</span>
                      <span className="text-sm text-muted-foreground">{assignee.count} patents</span>
                    </div>
                    <Progress value={(assignee.count / 15) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Market Assessment</span>
            <Badge variant="outline">
              {preview.landscape_summary.market_density} density
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 5. What's Included in Full Report */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Unlock Full Analysis</CardTitle>
          <CardDescription>See what you are missing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            'Detailed claim-by-claim analysis',
            'Visual claim charts (side-by-side comparison)',
            'Specific design-around strategies',
            'Complete legal risk assessment',
            'Jurisdictional risk breakdown (US, EU, Asia)',
            'Cross-domain innovation opportunities',
            'Prioritized action plan with costs/timelines',
            '15-page professional PDF report',
            'Expert patent attorney review and validation'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                <span className="text-xs text-muted-foreground">✗</span>
              </div>
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 6. Upgrade CTA */}
      <Card className="border-2 border-primary shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Unlock Full Analysis & Expert Review</h3>
            <p className="text-muted-foreground">
              Get complete claim analysis, design-around strategies, and professional validation
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <div className="text-left bg-background p-6 rounded-lg border flex-1 min-w-[250px]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Standard FTO Report</h4>
                <Badge>Recommended</Badge>
              </div>
              <div className="text-3xl font-bold mb-4">$2,500</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Complete analysis of all {preview.patents_found_count}+ patents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Detailed claim charts & strategies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  48-hour delivery
                </li>
              </ul>
              <Button className="w-full mt-4" size="lg" onClick={onUpgrade}>
                Upgrade Now
              </Button>
            </div>

            <div className="text-left bg-background p-6 rounded-lg border flex-1 min-w-[250px]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Premium + White Space</h4>
                <Badge variant="secondary">Best Value</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">$3,900</div>
              <div className="text-sm text-green-600 mb-4">Save $600</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Everything in Standard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Innovation opportunity analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  24-hour priority delivery
                </li>
              </ul>
              <Button className="w-full mt-4" size="lg" onClick={onUpgrade}>
                Upgrade Now
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Trusted by 50+ startups</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★★★★★</span>
              <span>4.9/5 rating</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">Limited offer: $500 off if you upgrade within 48 hours</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          I will decide later
        </Button>
      </div>
    </div>
  );
}
