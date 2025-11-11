import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { expertStep5Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step5AssigneesProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step5Assignees({ onNext, onBack }: Step5AssigneesProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [inputValue, setInputValue] = useState('');

  const form = useForm({
    resolver: zodResolver(expertStep5Schema),
    defaultValues: {
      assignees: formData.assignees || [],
    },
  });

  const assignees = form.watch('assignees') || [];

  const addAssignee = () => {
    if (inputValue.trim()) {
      form.setValue('assignees', [...assignees, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeAssignee = (index: number) => {
    form.setValue('assignees', assignees.filter((_, i) => i !== index));
  };

  const onSubmit = (data: { assignees?: string[] }) => {
    updateFormData({ assignees: data.assignees || [] });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Assignees or competitors to monitor</h2>
          <p className="text-muted-foreground">
            Optional: Companies or entities whose patents should be prioritized in the search
          </p>
        </div>

        <FormField
          control={form.control}
          name="assignees"
          render={() => (
            <FormItem>
              <FormLabel>Assignees / Competitors</FormLabel>
              <FormDescription>
                Add company names or patent assignees to focus the analysis
              </FormDescription>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssignee())}
                      placeholder="e.g., Apple Inc., Samsung Electronics"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addAssignee}
                      disabled={!inputValue.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {assignees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {assignees.map((assignee, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pl-3 pr-1">
                          {assignee}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeAssignee(index)}
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
