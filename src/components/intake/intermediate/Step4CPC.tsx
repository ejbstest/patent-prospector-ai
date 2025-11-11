import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { CPCAutocomplete } from '../CPCAutocomplete';
import { StepNavigation } from '../StepNavigation';
import { intermediateStep4Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step4CPCProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4CPC({ onNext, onBack }: Step4CPCProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(intermediateStep4Schema),
    defaultValues: {
      cpcCodes: formData.cpcCodes || [],
    },
  });

  const onSubmit = (data: { cpcCodes?: string[] }) => {
    updateFormData({ cpcCodes: data.cpcCodes || [] });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Relevant patent classifications</h2>
          <p className="text-muted-foreground">
            Optional: Add CPC or IPC codes if you know them. We'll auto-suggest based on your description.
          </p>
        </div>

        <FormField
          control={form.control}
          name="cpcCodes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPC/IPC Codes</FormLabel>
              <FormDescription>
                Search for classification codes related to your invention
              </FormDescription>
              <FormControl>
                <CPCAutocomplete
                  selectedCodes={field.value || []}
                  onChange={field.onChange}
                  placeholder="Search codes or descriptions..."
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
