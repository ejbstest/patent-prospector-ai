import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  patentsFoundCount?: number;
}

export function UpgradeDialog({ open, onOpenChange, analysisId, patentsFoundCount = 247 }: UpgradeDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (tier: 'standard' | 'premium') => {
    setIsProcessing(true);
    
    try {
      const amount = tier === 'standard' ? 2500 : 3900;
      const analysisType = tier === 'premium' ? 'premium_whitespace' : 'standard';
      
      // Update analysis to paid status
      const { error } = await supabase
        .from('analyses')
        .update({
          payment_status: 'paid',
          amount_paid: amount,
          analysis_type: analysisType,
          status: 'reviewing' // Set to reviewing to trigger expert review
        })
        .eq('id', analysisId);

      if (error) throw error;

      toast({
        title: 'Payment Successful!',
        description: `You have upgraded to the ${tier} plan. Expert review will begin shortly.`,
      });

      onOpenChange(false);
      
      // Reload the page to show the updated status
      window.location.reload();
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: 'Upgrade failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unlock Full Analysis & Expert Review</DialogTitle>
          <DialogDescription>
            Choose the plan that fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Standard Plan */}
          <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Standard FTO Report</h3>
                <Badge>Recommended</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">$2,500</div>
                <div className="text-sm text-muted-foreground">One-time payment</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Complete Patent Analysis</div>
                  <div className="text-xs text-muted-foreground">
                    All {patentsFoundCount}+ identified patents analyzed
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Detailed Claim Charts</div>
                  <div className="text-xs text-muted-foreground">
                    Side-by-side comparison of claims
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Design-Around Strategies</div>
                  <div className="text-xs text-muted-foreground">
                    Actionable recommendations
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Expert Attorney Review</div>
                  <div className="text-xs text-muted-foreground">
                    Professional validation
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">48-Hour Delivery</div>
                  <div className="text-xs text-muted-foreground">
                    Guaranteed turnaround
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleUpgrade('standard')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Select Standard'}
            </Button>
          </Card>

          {/* Premium Plan */}
          <Card className="p-6 space-y-4 border-2 border-primary bg-primary/5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Premium + White Space</h3>
                <Badge variant="secondary">Best Value</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">$3,900</div>
                <div className="text-sm text-green-600 font-medium">Save $600</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Everything in Standard</div>
                  <div className="text-xs text-muted-foreground">
                    All features from the standard plan
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">White Space Analysis</div>
                  <div className="text-xs text-muted-foreground">
                    Innovation opportunity identification
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Competitive Landscape Map</div>
                  <div className="text-xs text-muted-foreground">
                    Strategic market positioning
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Priority Support</div>
                  <div className="text-xs text-muted-foreground">
                    Direct access to experts
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">24-Hour Delivery</div>
                  <div className="text-xs text-muted-foreground">
                    Expedited turnaround
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-primary" 
              size="lg"
              onClick={() => handleUpgrade('premium')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Select Premium'}
            </Button>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Limited Time Offer:</strong> $500 off if you upgrade within 48 hours
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
          <span>✓ Secure payment</span>
          <span>✓ Money-back guarantee</span>
          <span>✓ Expert review included</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
