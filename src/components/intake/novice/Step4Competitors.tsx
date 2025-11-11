import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { noviceStep4Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step4CompetitorsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4Competitors({ onNext, onBack }: Step4CompetitorsProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [inputValue, setInputValue] = useState('');

  const form = useForm({
    resolver: zodResolver(noviceStep4Schema),
    defaultValues: {
      competitors: formData.competitors || [],
    },
  });

  const competitors = form.watch('competitors') || [];

  const addCompetitor = () => {
    if (inputValue.trim()) {
      form.setValue('competitors', [...competitors, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeCompetitor = (index: number) => {
    form.setValue('competitors', competitors.filter((_, i) => i !== index));
  };

  const onSubmit = (data: { competitors?: string[] }) => {
    updateFormData({ competitors: data.competitors || [] });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Who are your main competitors?</h2>
          <p className="text-muted-foreground">
            List any companies or products in the same space (optional)
          </p>
        </div>

        <FormField
          control={form.control}
          name="competitors"
          render={() => (
            <FormItem>
              <FormLabel>Competitors</FormLabel>
              <FormDescription>
                Add company names or product names that compete with yours
              </FormDescription>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                      placeholder="e.g., MyFitnessPal, WaterMinder"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addCompetitor}
                      disabled={!inputValue.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {competitors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {competitors.map((competitor, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pl-3 pr-1">
                          {competitor}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeCompetitor(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
