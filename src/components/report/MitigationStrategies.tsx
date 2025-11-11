import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, TrendingDown } from 'lucide-react';

interface Strategy {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  estimatedCost: string;
  timeline: string;
  riskReduction: string;
  type: 'immediate' | 'near-term' | 'long-term';
  canDIY: boolean;
}

const strategies: Strategy[] = [
  {
    priority: 1,
    title: 'Design around Patent US10234567B2',
    description: 'Modify the data processing algorithm to use a different mathematical approach that avoids the specific method claims in the patent.',
    estimatedCost: '$15,000 - $30,000',
    timeline: '2-3 months',
    riskReduction: '60 → 35 points',
    type: 'immediate',
    canDIY: false,
  },
  {
    priority: 1,
    title: 'Obtain Freedom-to-Operate Opinion',
    description: 'Engage patent counsel to provide a formal FTO opinion letter analyzing infringement risks and defensibility.',
    estimatedCost: '$8,000 - $15,000',
    timeline: '4-6 weeks',
    riskReduction: 'Legal protection',
    type: 'immediate',
    canDIY: false,
  },
  {
    priority: 2,
    title: 'Initiate Licensing Discussions',
    description: 'Reach out to key patent holders to explore licensing opportunities before product launch.',
    estimatedCost: '$50,000 - $200,000/year',
    timeline: '3-6 months',
    riskReduction: 'Eliminates risk',
    type: 'near-term',
    canDIY: false,
  },
  {
    priority: 2,
    title: 'File Defensive Patents',
    description: 'Protect your unique innovations with patent applications in key jurisdictions.',
    estimatedCost: '$10,000 - $25,000 per patent',
    timeline: '6-12 months',
    riskReduction: 'Defensive position',
    type: 'near-term',
    canDIY: false,
  },
  {
    priority: 3,
    title: 'Implement Patent Watch Service',
    description: 'Set up ongoing monitoring for new patent filings in your technology space.',
    estimatedCost: '$500 - $2,000/month',
    timeline: 'Ongoing',
    riskReduction: 'Preventive',
    type: 'long-term',
    canDIY: true,
  },
];

export function MitigationStrategies() {
  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'border-destructive bg-destructive/5';
    if (priority === 2) return 'border-warning bg-warning/5';
    return 'border-muted bg-muted/5';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return 'Immediate Action';
    if (priority === 2) return 'Near-Term';
    return 'Long-Term';
  };

  const immediate = strategies.filter(s => s.priority === 1);
  const nearTerm = strategies.filter(s => s.priority === 2);
  const longTerm = strategies.filter(s => s.priority === 3);

  return (
    <section id="mitigation-strategies" className="space-y-6 page-break-before">
      <div>
        <h2 className="text-3xl font-bold mb-2">Mitigation Strategies</h2>
        <p className="text-muted-foreground">
          Prioritized action plan to reduce IP risks
        </p>
      </div>

      {/* Priority 1: Immediate */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="destructive">Priority 1</Badge>
          <h3 className="font-semibold">Immediate Actions Required</h3>
        </div>
        <div className="grid gap-4">
          {immediate.map((strategy, index) => (
            <Card key={index} className={getPriorityColor(strategy.priority)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    <CardDescription className="mt-2">{strategy.description}</CardDescription>
                  </div>
                  {!strategy.canDIY && (
                    <Badge variant="outline">Professional Required</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="font-medium">{strategy.estimatedCost}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Timeline</p>
                      <p className="font-medium">{strategy.timeline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Risk Reduction</p>
                      <p className="font-medium">{strategy.riskReduction}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Priority 2: Near-Term */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="bg-warning text-warning-foreground">Priority 2</Badge>
          <h3 className="font-semibold">Near-Term Recommendations</h3>
        </div>
        <div className="grid gap-4">
          {nearTerm.map((strategy, index) => (
            <Card key={index} className={getPriorityColor(strategy.priority)}>
              <CardHeader>
                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                <CardDescription>{strategy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-medium">{strategy.estimatedCost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="font-medium">{strategy.timeline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Reduction</p>
                    <p className="font-medium">{strategy.riskReduction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Priority 3: Long-Term */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">Priority 3</Badge>
          <h3 className="font-semibold">Long-Term Considerations</h3>
        </div>
        <div className="grid gap-4">
          {longTerm.map((strategy, index) => (
            <Card key={index} className={getPriorityColor(strategy.priority)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </div>
                  {strategy.canDIY && (
                    <Badge variant="outline" className="bg-success/10 text-success">Can DIY</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-medium">{strategy.estimatedCost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="font-medium">{strategy.timeline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Impact</p>
                    <p className="font-medium">{strategy.riskReduction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
