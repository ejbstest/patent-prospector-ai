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
  priorityJurisdiction: z.string().min(1, 'Priority jurisdiction is required'),
  manufacturingLocations: z.string().optional(),
});

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
      targetMarkets: formData.targetMarkets || [],
      priorityJurisdiction: formData.priorityJurisdiction || '',
      manufacturingLocations: formData.manufacturingLocations || '',
    },
  });

  const targetMarkets = form.watch('targetMarkets');

  const handleToggleMarket = (code: string) => {
    const current = form.getValues('targetMarkets');
    if (current.includes(code)) {
      form.setValue('targetMarkets', current.filter(c => c !== code), { shouldValidate: true });
    } else {
      form.setValue('targetMarkets', [...current, code], { shouldValidate: true });
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
                        field.onChange(market.code);
                        form.trigger('priorityJurisdiction');
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
          onBack={onBack}
          onNext={form.handleSubmit(onSubmit)}
          canGoNext={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
