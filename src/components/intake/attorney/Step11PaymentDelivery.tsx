import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StepNavigation } from '../StepNavigation';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Mail, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { ResearcherExemptionDialog } from '../ResearcherExemptionDialog';

const paymentDeliverySchema = z.object({
  deliveryEmail: z.string().email('Valid email is required'),
  saveCard: z.boolean().default(false),
});

interface Step11PaymentDeliveryProps {
  onNext: () => void;
  onExemption: () => void;
  onBack: () => void;
}

export function Step11PaymentDelivery({ onNext, onExemption, onBack }: Step11PaymentDeliveryProps) {
  const { formData } = useIntakeFormStore();
  const [secondaryEmails, setSecondaryEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [showExemptionDialog, setShowExemptionDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(paymentDeliverySchema),
    defaultValues: {
      deliveryEmail: '',
      saveCard: false,
    },
  });

  const addSecondaryEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      setSecondaryEmails([...secondaryEmails, emailInput]);
      setEmailInput('');
    }
  };

  const removeSecondaryEmail = (index: number) => {
    setSecondaryEmails(secondaryEmails.filter((_, i) => i !== index));
  };

  const handleExemptionValidated = () => {
    // Proceed with exemption - skip payment
    onExemption();
  };

  const onSubmit = (data: z.infer<typeof paymentDeliverySchema>) => {
    // In production, this would trigger Stripe payment flow
    // For now, just proceed to confirmation
    onNext();
  };

  // Calculate price based on preferences (mock data)
const basePrice = 997;
const turnaroundUpcharge = 0; // Would be calculated from Step 9
const comprehensiveUpcharge = formData.analysisDepth === 'comprehensive' ? 297 : 0;
const totalPrice = basePrice + turnaroundUpcharge + comprehensiveUpcharge;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Payment & Delivery</h2>
          <p className="text-muted-foreground">
            Review your order and complete payment to start the analysis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Analysis Type:</span>
              <span className="font-medium">{formData.analysisDepth === 'comprehensive' ? 'Comprehensive FTO Analysis' : 'Standard FTO Analysis'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Turnaround:</span>
              <span className="font-medium">24 hours (Standard)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Report Formats:</span>
              <span className="font-medium">PDF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">White Space Analysis:</span>
              <span className="font-medium">Included</span>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price:</span>
              <span>${basePrice.toLocaleString()}</span>
            </div>
            {turnaroundUpcharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Turnaround Upgrade:</span>
                <span>+${turnaroundUpcharge.toLocaleString()}</span>
              </div>
            )}
            {comprehensiveUpcharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comprehensive Upgrade:</span>
                <span>+${comprehensiveUpcharge.toLocaleString()}</span>
              </div>
            )}
            
            <Separator className="my-3" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <FormLabel className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Information
          </FormLabel>
          
          <div className="p-6 border rounded-md bg-muted/20">
            <p className="text-sm text-muted-foreground text-center">
              Stripe payment form will be embedded here
            </p>
            <div className="mt-4 space-y-2">
              <div className="h-10 bg-background border rounded-md" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-background border rounded-md" />
                <div className="h-10 bg-background border rounded-md" />
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="saveCard"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    Save card for future reports
                  </FormLabel>
                  <FormDescription>
                    Securely store payment method for faster checkout next time
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Report Delivery
          </FormLabel>

          <FormField
            control={form.control}
            name="deliveryEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Delivery Email *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@lawfirm.com" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Where should we send the completed report?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Additional Recipients (Optional)</FormLabel>
            <div className="mt-2 space-y-2">
              {secondaryEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={email} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSecondaryEmail(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@lawfirm.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSecondaryEmail();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSecondaryEmail}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              CC other team members on report delivery
            </p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
          <p className="text-sm">
            <strong>What happens next:</strong>
          </p>
          <ol className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-decimal">
            <li>Your payment will be processed securely via Stripe</li>
            <li>Analysis begins immediately after payment confirmation</li>
            <li>You'll receive email updates on progress</li>
            <li>White-labeled report delivered to your inbox within 24 hours</li>
          </ol>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowExemptionDialog(true)}
            >
              Researcher Exemption
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!form.formState.isValid}
          >
            Process Payment & Submit
          </Button>
        </div>

        <ResearcherExemptionDialog
          open={showExemptionDialog}
          onOpenChange={setShowExemptionDialog}
          onCodeValidated={handleExemptionValidated}
        />
      </form>
    </Form>
  );
}
