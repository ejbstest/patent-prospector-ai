import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '../RichTextEditor';
import { StepNavigation } from '../StepNavigation';
import { noviceStep2Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step2ProductProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Product({ onNext, onBack }: Step2ProductProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(noviceStep2Schema),
    defaultValues: {
      productDescription: formData.productDescription || '',
    },
  });

  const onSubmit = (data: { productDescription: string }) => {
    updateFormData({ productDescription: data.productDescription });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">What does your product do?</h2>
          <p className="text-muted-foreground">
            Describe your product idea in plain language. Don't worry about technical jargon.
          </p>
        </div>

        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Example: A smartphone app that helps users track their daily water intake by scanning beverage containers and automatically logging the amount consumed..."
                  maxLength={500}
                  minRows={6}
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
