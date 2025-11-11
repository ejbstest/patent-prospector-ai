import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { StepNavigation } from '../StepNavigation';
import { expertStep7Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step7ParametersProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step7Parameters({ onNext, onBack }: Step7ParametersProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(expertStep7Schema),
    defaultValues: {
      analysisParameters: formData.analysisParameters || {},
    },
  });

  const citationDepth = form.watch('analysisParameters.citationDepth') || 3;

  const onSubmit = (data: any) => {
    updateFormData({ analysisParameters: data.analysisParameters });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Custom analysis parameters</h2>
          <p className="text-muted-foreground">
            Optional: Configure advanced search and analysis settings
          </p>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="analysisParameters.dateRange.start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date (Priority Date Range)</FormLabel>
                <FormDescription>
                  Limit search to patents filed after this date
                </FormDescription>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="analysisParameters.dateRange.end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormDescription>
                  Limit search to patents filed before this date
                </FormDescription>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="analysisParameters.citationDepth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Citation Depth: {citationDepth}</FormLabel>
                <FormDescription>
                  How many levels of forward/backward citations to analyze (1-10)
                </FormDescription>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value || 3]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                    className="py-4"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <StepNavigation
          onBack={onBack}
          onNext={form.handleSubmit(onSubmit)}
          canGoNext={true}
        />
      </form>
    </Form>
  );
}
