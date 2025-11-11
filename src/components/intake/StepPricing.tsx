import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { PricingCards } from './PricingCards';
import { StepNavigation } from './StepNavigation';
import { pricingSchema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import type { PricingTier } from '@/stores/intakeFormStore';

interface StepPricingProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPricing({ onNext, onBack }: StepPricingProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      pricingTier: formData.pricingTier || undefined,
    },
  });

  const onSubmit = (data: { pricingTier: PricingTier }) => {
    updateFormData({ pricingTier: data.pricingTier });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select your analysis package</h2>
          <p className="text-muted-foreground">
            Choose the level of analysis that best fits your needs
          </p>
        </div>

        <FormField
          control={form.control}
          name="pricingTier"
          render={({ field }) => (
            <FormItem>
              <PricingCards
                selectedTier={field.value}
                onSelectTier={field.onChange}
              />
            </FormItem>
          )}
        />

        <StepNavigation
          onBack={onBack}
          onNext={form.handleSubmit(onSubmit)}
          canGoNext={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
