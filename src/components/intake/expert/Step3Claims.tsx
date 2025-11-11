import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { BulletPointEditor } from '../BulletPointEditor';
import { StepNavigation } from '../StepNavigation';
import { expertStep3Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step3ClaimsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Claims({ onNext, onBack }: Step3ClaimsProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(expertStep3Schema),
    defaultValues: {
      claims: formData.claims || [],
    },
  });

  const onSubmit = (data: { claims: string[] }) => {
    updateFormData({ claims: data.claims });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Specific claims to analyze</h2>
          <p className="text-muted-foreground">
            Enter the numbered claims from your application or invention disclosure
          </p>
        </div>

        <FormField
          control={form.control}
          name="claims"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Claims <span className="text-destructive">*</span></FormLabel>
              <FormDescription>
                Enter each claim as a separate item (independent and dependent claims)
              </FormDescription>
              <FormControl>
                <BulletPointEditor
                  points={field.value}
                  onChange={field.onChange}
                  placeholder="Claim 1: A method for..."
                  minPoints={1}
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
