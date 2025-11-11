import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { StepNavigation } from '../StepNavigation';
import { CPCAutocomplete } from '../CPCAutocomplete';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const classificationsSchema = z.object({
  selectedClassifications: z.array(z.string()).min(1, 'Select at least 1 classification'),
  primaryDomain: z.string().min(1, 'Primary domain is required'),
});

interface Step5ClassificationsProps {
  onNext: () => void;
  onBack: () => void;
}

// Mock AI suggestions - in production, these would come from an API
const aiSuggestions = [
  { code: 'G06F16/33', description: 'Query processing', confidence: 95 },
  { code: 'G06N3/08', description: 'Learning methods', confidence: 92 },
  { code: 'G06F40/30', description: 'Semantic analysis', confidence: 88 },
  { code: 'G06Q50/18', description: 'Legal services', confidence: 85 },
  { code: 'G06F16/93', description: 'Document retrieval', confidence: 82 },
  { code: 'G06N20/00', description: 'Machine learning', confidence: 78 },
  { code: 'G06F40/20', description: 'Natural language processing', confidence: 75 },
  { code: 'G06Q10/10', description: 'Office automation', confidence: 70 },
];

const technologyDomains = [
  'Artificial Intelligence & Machine Learning',
  'Software & Computing',
  'Telecommunications',
  'Biotechnology',
  'Medical Devices',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Electronics & Semiconductors',
  'Materials Science',
  'Energy & Clean Tech',
];

export function Step5Classifications({ onNext, onBack }: Step5ClassificationsProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [manualCodes, setManualCodes] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(classificationsSchema),
    defaultValues: {
      selectedClassifications: formData.selectedClassifications || [],
      primaryDomain: formData.primaryDomain || '',
    },
  });

  const selectedClassifications = form.watch('selectedClassifications');

  const handleToggleClassification = (code: string) => {
    const current = form.getValues('selectedClassifications');
    if (current.includes(code)) {
      form.setValue('selectedClassifications', current.filter(c => c !== code));
    } else {
      form.setValue('selectedClassifications', [...current, code]);
    }
  };

  const onSubmit = (data: z.infer<typeof classificationsSchema>) => {
    updateFormData({
      selectedClassifications: [...data.selectedClassifications, ...manualCodes],
      manualClassifications: manualCodes,
      primaryDomain: data.primaryDomain,
      // Legacy field for backward compatibility
      cpcCodes: [...data.selectedClassifications, ...manualCodes],
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Patent Classification</h2>
          <p className="text-muted-foreground">
            AI-generated classification suggestions based on your invention description
          </p>
        </div>

        <FormField
          control={form.control}
          name="selectedClassifications"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Suggested Classifications
              </FormLabel>
              <div className="space-y-3 mt-3">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.code}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedClassifications.includes(suggestion.code)}
                      onCheckedChange={() => handleToggleClassification(suggestion.code)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-medium">{suggestion.code}</code>
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.confidence}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <FormDescription>
                {selectedClassifications.length} classification{selectedClassifications.length !== 1 ? 's' : ''} selected from AI suggestions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Add Additional Classifications (Optional)</FormLabel>
          <CPCAutocomplete
            selectedCodes={manualCodes}
            onChange={setManualCodes}
            placeholder="Search for CPC or IPC codes..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            Manually add any classifications the AI may have missed
          </p>
        </div>

        <FormField
          control={form.control}
          name="primaryDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Technology Domain *</FormLabel>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {technologyDomains.map((domain) => (
                  <div
                    key={domain}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      field.value === domain
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => field.onChange(domain)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === domain ? 'border-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {field.value === domain && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{domain}</span>
                    </div>
                  </div>
                ))}
              </div>
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
