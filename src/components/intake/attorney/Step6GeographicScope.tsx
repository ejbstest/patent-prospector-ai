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
      targetMarkets: Array.isArray(formData.targetMarkets) ? formData.targetMarkets : [],
      priorityJurisdiction: typeof formData.priorityJurisdiction === 'string' ? formData.priorityJurisdiction : '',
      manufacturingLocations: typeof formData.manufacturingLocations === 'string' ? formData.manufacturingLocations : '',
    },
  });

  useEffect(() => {
    try {
      const tm = Array.isArray(form.getValues('targetMarkets')) ? form.getValues('targetMarkets') as string[] : [];
      const pj = form.getValues('priorityJurisdiction') as string;
      if (pj && !tm.includes(pj)) {
        form.setValue('priorityJurisdiction', '', { shouldValidate: true });
      }
      console.log('Step6 init', { tm, pj });
    } catch (err) {
      console.error('Step6GeographicScope: init error', err);
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, info) => {
      try {
        console.log('Step6 watch', {
          name: (info as any)?.name,
          type: (info as any)?.type,
          targetMarkets: (value as any)?.targetMarkets,
          priorityJurisdiction: (value as any)?.priorityJurisdiction,
        });
      } catch (e) {
        console.warn('Step6 watch log error', e);
      }
    });
    return () => {
      try {
        if (typeof (subscription as any) === 'function') {
          (subscription as any)();
        } else {
          (subscription as any)?.unsubscribe?.();
        }
      } catch {}
    };
  }, [form]);

  const watchedTargetMarkets = form.watch('targetMarkets');
  const targetMarkets = Array.isArray(watchedTargetMarkets) ? watchedTargetMarkets : [];

  const handleToggleMarket = (code: string) => {
    try {
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
    } catch (err) {
      console.error('Step6GeographicScope: handleToggleMarket error', err, { code });
    }
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {markets.map((market) => (
                  <div
                    key={market.code}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      targetMarkets.includes(market.code)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleToggleMarket(market.code)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={targetMarkets.includes(market.code)}
                        onCheckedChange={() => handleToggleMarket(market.code)}
                      />
                      <span className="text-2xl">{market.flag}</span>
                      <div>
                        <div className="text-sm font-medium">{market.name}</div>
                        <div className="text-xs text-muted-foreground">{market.code}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <FormDescription>
                Select all markets where the product will be sold or manufactured
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {markets
                  .filter(m => targetMarkets.includes(m.code))
                  .map((market) => (
                    <div
                      key={market.code}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        field.value === market.code
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                        onClick={() => {
                          try {
                            field.onChange(market.code);
                            form.trigger('priorityJurisdiction');
                          } catch (err) {
                            console.error('Step6GeographicScope: set priority error', err, { code: market.code });
                          }
                        }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            field.value === market.code ? 'border-primary' : 'border-muted-foreground'
                          }`}
                        >
                          {field.value === market.code && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-2xl">{market.flag}</span>
                        <span className="text-sm font-medium">{market.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
              <FormDescription>
                Which jurisdiction is most critical for freedom to operate?
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
          onBack={() => {
            try {
              onBack();
            } catch (err) {
              console.error('Step6GeographicScope: onBack error', err);
            }
          }}
          onNext={form.handleSubmit((data) => {
            try {
              onSubmit(data);
            } catch (err) {
              console.error('Step6GeographicScope: onSubmit error', err, { data });
            }
          })}
          canGoNext={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
