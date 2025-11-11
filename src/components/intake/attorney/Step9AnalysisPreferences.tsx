import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { StepNavigation } from '../StepNavigation';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Zap } from 'lucide-react';

const analysisPreferencesSchema = z.object({
  analysisDepth: z.enum(['standard', 'comprehensive']),
  whiteSpaceFocus: z.boolean().default(true),
  reportFormats: z.array(z.string()).min(1, 'Select at least 1 format'),
  turnaroundTime: z.enum(['standard', 'priority', 'rush']),
});

interface Step9AnalysisPreferencesProps {
  onNext: () => void;
  onBack: () => void;
}

const formats = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'docx', label: 'Word (DOCX)', icon: FileText },
  { value: 'pptx', label: 'PowerPoint', icon: FileText },
];

export function Step9AnalysisPreferences({ onNext, onBack }: Step9AnalysisPreferencesProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm<z.infer<typeof analysisPreferencesSchema>>({
    resolver: zodResolver(analysisPreferencesSchema),
    defaultValues: {
      analysisDepth: formData.analysisDepth || 'standard',
      whiteSpaceFocus: formData.whiteSpaceFocus ?? true,
      reportFormats: formData.reportFormats || ['pdf'],
      turnaroundTime: formData.turnaroundTime || 'standard',
    },
  });

  const reportFormats = form.watch('reportFormats');
  const turnaroundTime = form.watch('turnaroundTime');
  const analysisDepth = form.watch('analysisDepth');

  const handleToggleFormat = (format: string) => {
    const current = form.getValues('reportFormats');
    if (current.includes(format)) {
      if (current.length > 1) {
        form.setValue('reportFormats', current.filter(f => f !== format));
      }
    } else {
      form.setValue('reportFormats', [...current, format]);
    }
  };

  const calculatePrice = () => {
    let basePrice = 997;
    if (analysisDepth === 'comprehensive') {
      basePrice = 1497;
    }
    
    if (turnaroundTime === 'priority') {
      basePrice += 300;
    }
    if (turnaroundTime === 'rush') {
      basePrice += 600;
    }
    
    return basePrice;
  };

  const onSubmit = (data: z.infer<typeof analysisPreferencesSchema>) => {
    updateFormData({
      analysisDepth: data.analysisDepth,
      whiteSpaceFocus: data.whiteSpaceFocus,
      reportFormats: data.reportFormats,
      turnaroundTime: data.turnaroundTime,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Analysis Preferences</h2>
          <p className="text-muted-foreground">
            Customize the scope and delivery of your FTO report
          </p>
        </div>

        <FormField
          control={form.control}
          name="analysisDepth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analysis Depth</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3"
                >
                  <div
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === 'standard'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => field.onChange('standard')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor="standard" className="font-medium cursor-pointer">
                            Standard Analysis
                          </label>
                          <Badge variant="secondary">$997</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Top 20-30 relevant patents, risk assessment, 3-5 design-around strategies
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === 'comprehensive'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => field.onChange('comprehensive')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="comprehensive" id="comprehensive" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor="comprehensive" className="font-medium cursor-pointer">
                            Comprehensive Analysis
                          </label>
                          <Badge variant="secondary">$1,497</Badge>
                          <Badge>Recommended</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          50-75 patents, detailed claim charts, white space mapping, 10+ design-around options
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whiteSpaceFocus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Include White Space Analysis
                </FormLabel>
                <FormDescription>
                  Identify unpatented innovation opportunities (included free)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reportFormats"
          render={() => (
            <FormItem>
              <FormLabel>Report Format(s)</FormLabel>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {formats.map((format) => (
                  <div
                    key={format.value}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      reportFormats.includes(format.value)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleToggleFormat(format.value)}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Checkbox
                        checked={reportFormats.includes(format.value)}
                        onCheckedChange={() => handleToggleFormat(format.value)}
                      />
                      <format.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{format.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <FormDescription>
                All formats are white-labeled and client-ready
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turnaroundTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turnaround Time</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3"
                >
                  <div
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === 'standard'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => field.onChange('standard')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="standard" id="turnaround-standard" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <label htmlFor="turnaround-standard" className="font-medium cursor-pointer">
                            Standard (24 hours)
                          </label>
                          <Badge variant="outline">Included</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Report delivered within 1 business day
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === 'priority'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => field.onChange('priority')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="priority" id="turnaround-priority" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <label htmlFor="turnaround-priority" className="font-medium cursor-pointer">
                            Priority (12 hours)
                          </label>
                          <Badge variant="secondary">+$300</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Report delivered within 12 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === 'rush'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => field.onChange('rush')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="rush" id="turnaround-rush" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-500" />
                          <label htmlFor="turnaround-rush" className="font-medium cursor-pointer">
                            Rush (6 hours)
                          </label>
                          <Badge variant="secondary">+$600</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Report delivered within 6 hours (same-day for urgent deals)
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Estimated Total:</span>
            <span className="text-2xl font-bold">${calculatePrice().toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Final price shown on next page before payment
          </p>
        </div>

        <StepNavigation
          onBack={onBack}
          onNext={form.handleSubmit(onSubmit)}
          canGoNext={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
