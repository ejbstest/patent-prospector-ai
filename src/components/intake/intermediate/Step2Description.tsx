import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '../RichTextEditor';
import { StepNavigation } from '../StepNavigation';
import { intermediateStep2Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step2DescriptionProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Description({ onNext, onBack }: Step2DescriptionProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(intermediateStep2Schema),
    defaultValues: {
      technicalDescription: formData.technicalDescription || '',
    },
  });

  const onSubmit = (data: { technicalDescription: string }) => {
    updateFormData({ technicalDescription: data.technicalDescription });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Describe your invention with technical specifications</h2>
          <p className="text-muted-foreground">
            Provide technical details about how your invention works and what makes it novel
          </p>
        </div>

        <FormField
          control={form.control}
          name="technicalDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Description <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Example: A neural network-based image classification system that utilizes convolutional layers to identify beverage containers and extract volume measurements from packaging labels with 95%+ accuracy..."
                  maxLength={1000}
                  minRows={8}
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
