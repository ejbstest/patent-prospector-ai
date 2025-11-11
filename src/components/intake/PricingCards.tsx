import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PricingTier } from '@/stores/intakeFormStore';

interface PricingCardsProps {
  selectedTier: PricingTier;
  onSelectTier: (tier: PricingTier) => void;
}

export function PricingCards({ selectedTier, onSelectTier }: PricingCardsProps) {
  const tiers = [
    {
      id: 'free' as const,
      name: 'Free IP Risk Snapshot',
      price: 0,
      description: 'Get started with a basic risk assessment',
      features: [
        'Overall risk score',
        'Top 3 potential conflicts',
        '2-page summary report',
        'Upgrade anytime',
      ],
      cta: 'Get Free Snapshot',
      badge: null,
    },
    {
      id: 'standard' as const,
      name: 'Standard FTO Report',
      price: 2500,
      description: 'Comprehensive freedom-to-operate analysis',
      features: [
        'Everything in Free tier',
        'Full 10-15 page report',
        'Detailed claim charts',
        'All potential conflicts',
        'Design-around strategies',
        '48-hour turnaround',
      ],
      cta: 'Purchase Standard',
      badge: 'Recommended',
    },
    {
      id: 'premium' as const,
      name: 'Premium FTO + White Space',
      price: 3900,
      description: 'Complete analysis with innovation opportunities',
      features: [
        'Everything in Standard tier',
        'Cross-domain white space analysis',
        'Competitive landscape mapping',
        'Innovation opportunity identification',
        'Priority support',
        '24-hour turnaround',
      ],
      cta: 'Purchase Premium',
      badge: 'Best for innovators',
      savings: 600,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          className={cn(
            'relative transition-all cursor-pointer',
            selectedTier === tier.id
              ? 'border-primary shadow-lg scale-105'
              : 'hover:border-primary/50 hover:shadow-md'
          )}
          onClick={() => onSelectTier(tier.id)}
        >
          {tier.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant={tier.id === 'standard' ? 'default' : 'secondary'}>
                {tier.badge}
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">{tier.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">${tier.price.toLocaleString()}</span>
              {tier.price > 0 && <span className="text-muted-foreground"> USD</span>}
            </div>
            {tier.savings && (
              <p className="text-sm text-success mt-2">
                Save ${tier.savings}
              </p>
            )}
            <CardDescription className="mt-2">{tier.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              type="button"
              variant={selectedTier === tier.id ? 'default' : 'outline'}
              className="w-full"
              onClick={() => onSelectTier(tier.id)}
            >
              {tier.cta}
            </Button>
            
            {tier.id === 'free' && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Upgrade to full report anytime
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
