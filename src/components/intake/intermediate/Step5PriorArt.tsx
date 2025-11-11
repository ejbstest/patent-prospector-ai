import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { PatentNumberInput } from '../PatentNumberInput';
import { StepNavigation } from '../StepNavigation';
import { intermediateStep5Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step5PriorArtProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step5PriorArt({ onNext, onBack }: Step5PriorArtProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(intermediateStep5Schema),
    defaultValues: {
      priorArtPatents: formData.priorArtPatents || [],
    },
  });

  const onSubmit = (data: { priorArtPatents?: string[] }) => {
    updateFormData({ priorArtPatents: data.priorArtPatents || [] });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Known prior art or competitor patents</h2>
          <p className="text-muted-foreground">
            Optional: List any patents you're aware of that are similar to your invention
          </p>
        </div>

        <FormField
          control={form.control}
          name="priorArtPatents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prior Art Patents</FormLabel>
              <FormDescription>
                Enter patent numbers like US1234567A or EP1234567A1
              </FormDescription>
              <FormControl>
                <PatentNumberInput
                  patents={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <StepNavigation
          onBack={onBack}
          onNext={form.handleSubmit(onSubmit)}
          canGoNext={true}
        />
      </form>
    </Form>
  );
}
