import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { userTypeSchema } from '@/lib/schemas/intakeFormSchemas';
import { StepNavigation } from './StepNavigation';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { cn } from '@/lib/utils';
import type { UserType } from '@/stores/intakeFormStore';

interface Step1UserTypeProps {
  onNext: () => void;
}

export function Step1UserType({ onNext }: Step1UserTypeProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(userTypeSchema),
    defaultValues: {
      userType: formData.userType || undefined,
    },
  });

  const onSubmit = (data: { userType: UserType }) => {
    updateFormData({ userType: data.userType });
    onNext();
  };

  const options = [
    {
      value: 'novice' as const,
      title: 'A new product idea I\'m developing',
      description: 'I\'m working on a product concept and want to understand potential IP risks',
    },
    {
      value: 'intermediate' as const,
      title: 'A technical invention with specific innovations',
      description: 'I have technical specifications and can describe the novel features',
    },
    {
      value: 'expert' as const,
      title: 'A patent application or technical disclosure',
      description: 'I have detailed claims, classifications, or a formal technical document',
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">What best describes what you're working on?</h2>
          <p className="text-muted-foreground">
            This helps us tailor the analysis process to your needs
          </p>
        </div>

        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="space-y-4"
                >
                  {options.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all',
                        field.value === option.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value={option.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{option.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <StepNavigation
          onNext={form.handleSubmit(onSubmit)}
          canGoBack={false}
          canGoNext={form.formState.isValid}
        />
      </form>
    </Form>
  );
}
