import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '../RichTextEditor';
import { StepNavigation } from '../StepNavigation';
import { noviceStep3Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step3UniquenessProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Uniqueness({ onNext, onBack }: Step3UniquenessProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(noviceStep3Schema),
    defaultValues: {
      uniqueness: formData.uniqueness || '',
    },
  });

  const onSubmit = (data: { uniqueness: string }) => {
    updateFormData({ uniqueness: data.uniqueness });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">What makes it unique from competitors?</h2>
          <p className="text-muted-foreground">
            What sets your product apart? What problem does it solve better or differently?
          </p>
        </div>

        <FormField
          control={form.control}
          name="uniqueness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Features <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Example: Unlike other water tracking apps, ours uses AI-powered image recognition to automatically identify and measure beverages without manual input..."
                  maxLength={300}
                  minRows={5}
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
