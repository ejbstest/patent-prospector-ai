import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '../RichTextEditor';
import { StepNavigation } from '../StepNavigation';
import { expertStep2Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step2DisclosureProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Disclosure({ onNext, onBack }: Step2DisclosureProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(expertStep2Schema),
    defaultValues: {
      disclosure: formData.disclosure || '',
    },
  });

  const onSubmit = (data: { disclosure: string }) => {
    updateFormData({ disclosure: data.disclosure });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Patent application details or full disclosure</h2>
          <p className="text-muted-foreground">
            Provide your technical disclosure, patent draft, or detailed invention description
          </p>
        </div>

        <FormField
          control={form.control}
          name="disclosure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Disclosure <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Provide detailed technical disclosure including background, summary, detailed description, and any drawings or figures..."
                  maxLength={2000}
                  minRows={10}
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
