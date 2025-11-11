import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { StepNavigation } from '../StepNavigation';
import { noviceStep5Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { cn } from '@/lib/utils';

interface Step5RegionsProps {
  onNext: () => void;
  onBack: () => void;
}

const regions = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'Europe', label: 'Europe', flag: '🇪🇺' },
  { value: 'Asia', label: 'Asia', flag: '🌏' },
  { value: 'Other', label: 'Other regions', flag: '🌍' },
];

export function Step5Regions({ onNext, onBack }: Step5RegionsProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(noviceStep5Schema),
    mode: 'onChange',
    defaultValues: {
      regions: formData.regions || [],
    },
  });

  const selectedRegions = form.watch('regions') || [];

  const toggleRegion = (value: string) => {
    const current = selectedRegions;
    const updated = current.includes(value)
      ? current.filter((r) => r !== value)
      : [...current, value];
    form.setValue('regions', updated, { shouldValidate: true });
  };

  const onSubmit = (data: { regions: string[] }) => {
    updateFormData({ regions: data.regions });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Where will you sell this product?</h2>
          <p className="text-muted-foreground">
            Select the regions where you plan to market your product
          </p>
        </div>

        <FormField
          control={form.control}
          name="regions"
          render={() => (
            <FormItem>
              <FormLabel>Target Regions <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3">
                  {regions.map((region) => {
                    const isSelected = selectedRegions.includes(region.value);
                    
                    return (
                      <label
                        key={region.value}
                        className={cn(
                          'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRegion(region.value)}
                        />
                        <span className="text-2xl">{region.flag}</span>
                        <span className="font-medium">{region.label}</span>
                      </label>
                    );
                  })}
                </div>
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
