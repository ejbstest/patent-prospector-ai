import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { JurisdictionSelect } from '../JurisdictionSelect';
import { StepNavigation } from '../StepNavigation';
import { intermediateStep6Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step6JurisdictionsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step6Jurisdictions({ onNext, onBack }: Step6JurisdictionsProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(intermediateStep6Schema),
    defaultValues: {
      jurisdictions: formData.jurisdictions || [],
    },
  });

  const onSubmit = (data: { jurisdictions: string[] }) => {
    updateFormData({ jurisdictions: data.jurisdictions });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Target jurisdictions for FTO analysis</h2>
          <p className="text-muted-foreground">
            Select the countries/regions where you need freedom-to-operate clearance
          </p>
        </div>

        <FormField
          control={form.control}
          name="jurisdictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jurisdictions <span className="text-destructive">*</span></FormLabel>
              <FormDescription>
                Choose where you plan to manufacture, sell, or use your invention
              </FormDescription>
              <FormControl>
                <JurisdictionSelect
                  selected={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
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
