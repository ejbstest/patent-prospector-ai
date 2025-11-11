import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { StepNavigation } from '../StepNavigation';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

const geographicScopeSchema = z.object({
  targetMarkets: z.array(z.string()).min(1, 'Select at least 1 target market'),
  priorityJurisdiction: z.string(),
  manufacturingLocations: z.string().optional(),
}).refine(
  (data) => {
    // Priority jurisdiction is required only if target markets are selected
    if (data.targetMarkets.length > 0 && !data.priorityJurisdiction) {
      return false;
    }
    // Priority jurisdiction must be one of the selected target markets
    if (data.priorityJurisdiction && !data.targetMarkets.includes(data.priorityJurisdiction)) {
      return false;
    }
    return true;
  },
  {
    message: 'Priority jurisdiction is required and must be one of your selected target markets',
    path: ['priorityJurisdiction'],
  }
);

interface Step6GeographicScopeProps {
  onNext: () => void;
  onBack: () => void;
}

const markets = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'EP', name: 'European Union', flag: '🇪🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
];

export function Step6GeographicScope({ onNext, onBack }: Step6GeographicScopeProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(geographicScopeSchema),
    mode: 'onChange',
    defaultValues: {
      targetMarkets: Array.isArray(formData.targetMarkets) && formData.targetMarkets.length > 0 ? formData.targetMarkets : ['US'],
      priorityJurisdiction: typeof formData.priorityJurisdiction === 'string' && formData.priorityJurisdiction ? formData.priorityJurisdiction : 'US',
      manufacturingLocations: typeof formData.manufacturingLocations === 'string' ? formData.manufacturingLocations : '',
    },
  });

  useEffect(() => {
    const tm = Array.isArray(form.getValues('targetMarkets')) ? (form.getValues('targetMarkets') as string[]) : [];
    if (!tm.includes('US')) {
      form.setValue('targetMarkets', ['US'], { shouldValidate: true });
    }
    const pj = form.getValues('priorityJurisdiction') as string;
    if (pj !== 'US') {
      form.setValue('priorityJurisdiction', 'US', { shouldValidate: true });
    }
    form.trigger();
  }, []);

  const watchedTargetMarkets = form.watch('targetMarkets');
  const targetMarkets = Array.isArray(watchedTargetMarkets) ? watchedTargetMarkets : [];

  const handleToggleMarket = (code: string) => {
    const currentRaw = form.getValues('targetMarkets');
    const current = Array.isArray(currentRaw) ? currentRaw : [];
    const priorityJurisdiction = form.getValues('priorityJurisdiction');

    if (current.includes(code)) {
      const newMarkets = current.filter((c) => c !== code);
      form.setValue('targetMarkets', newMarkets, { shouldValidate: true });

      if (priorityJurisdiction === code) {
        form.setValue('priorityJurisdiction', '', { shouldValidate: true });
        form.trigger('priorityJurisdiction');
      }
    } else {
      form.setValue('targetMarkets', [...current, code], { shouldValidate: true });
    }

    form.trigger('targetMarkets');
  };

  const onSubmit = (data: z.infer<typeof geographicScopeSchema>) => {
    updateFormData({
      targetMarkets: data.targetMarkets,
      priorityJurisdiction: data.priorityJurisdiction,
      manufacturingLocations: data.manufacturingLocations,
      // Legacy field for backward compatibility
      regions: data.targetMarkets,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Geographic Scope</h2>
          <p className="text-muted-foreground">
            Where does your client plan to operate or sell this invention?
          </p>
        </div>

        <FormField
          control={form.control}
          name="targetMarkets"
          render={() => (
            <FormItem>
              <FormLabel>Target Markets *</FormLabel>
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="p-3 border rounded-md bg-primary/5 border-primary">
                  <div className="flex items-center gap-2">
                    <Checkbox checked disabled />
                    <span className="text-2xl">🇺🇸</span>
                    <div>
                      <div className="text-sm font-medium">United States</div>
                      <div className="text-xs text-muted-foreground">US</div>
                    </div>
                  </div>
                </div>
              </div>
              <FormDescription>
                Currently limited to the United States while we expand coverage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priorityJurisdiction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority Jurisdiction for FTO Analysis *</FormLabel>
              <div className="p-3 border rounded-md bg-primary/5 border-primary">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-2xl">🇺🇸</span>
                  <span className="text-sm font-medium">United States</span>
                </div>
              </div>
              <FormDescription>
                Currently fixed to United States while we expand coverage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturingLocations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturing Locations (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., China (assembly), Vietnam (components)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Where will the product be manufactured? This may affect patent exposure.
              </FormDescription>
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
