import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { CPCAutocomplete } from '../CPCAutocomplete';
import { StepNavigation } from '../StepNavigation';
import { expertStep4Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step4ClassificationsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4Classifications({ onNext, onBack }: Step4ClassificationsProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(expertStep4Schema),
    defaultValues: {
      ipcCpcCodes: formData.ipcCpcCodes || [],
    },
  });

  const onSubmit = (data: { ipcCpcCodes: string[] }) => {
    updateFormData({ ipcCpcCodes: data.ipcCpcCodes });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">IPC/CPC classifications</h2>
          <p className="text-muted-foreground">
            Provide the patent classification codes relevant to your invention
          </p>
        </div>

        <FormField
          control={form.control}
          name="ipcCpcCodes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classification Codes <span className="text-destructive">*</span></FormLabel>
              <FormDescription>
                Search and select IPC or CPC codes that classify your invention
              </FormDescription>
              <FormControl>
                <CPCAutocomplete
                  selectedCodes={field.value}
                  onChange={field.onChange}
                  placeholder="Search classification codes..."
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
