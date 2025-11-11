import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { BulletPointEditor } from '../BulletPointEditor';
import { StepNavigation } from '../StepNavigation';
import { intermediateStep3Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step3InnovationsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Innovations({ onNext, onBack }: Step3InnovationsProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(intermediateStep3Schema),
    defaultValues: {
      innovations: formData.innovations || [],
    },
  });

  const onSubmit = (data: { innovations: string[] }) => {
    updateFormData({ innovations: data.innovations });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Key technical innovations</h2>
          <p className="text-muted-foreground">
            List the specific novel features or improvements in your invention
          </p>
        </div>

        <FormField
          control={form.control}
          name="innovations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Innovations <span className="text-destructive">*</span></FormLabel>
              <FormDescription>
                List at least 3 specific innovations or novel aspects
              </FormDescription>
              <FormControl>
                <BulletPointEditor
                  points={field.value}
                  onChange={field.onChange}
                  placeholder="e.g., Real-time image processing using edge computing"
                  minPoints={3}
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
