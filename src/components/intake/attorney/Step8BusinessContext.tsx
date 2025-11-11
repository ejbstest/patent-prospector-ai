import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { StepNavigation } from '../StepNavigation';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

const businessContextSchema = z.object({
  developmentStage: z.string().min(1, 'Development stage is required'),
  fundingStage: z.string().min(1, 'Funding stage is required'),
  fundingTimeline: z.date().optional(),
  launchDate: z.date({
    required_error: 'Product launch date is required',
  }),
});

interface Step8BusinessContextProps {
  onNext: () => void;
  onBack: () => void;
}

const developmentStages = [
  'Concept/Ideation',
  'Prototype Development',
  'MVP Built',
  'Beta Testing',
  'Ready for Production',
  'Already Launched',
];

const fundingStages = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Bootstrapped',
  'Profitable',
];

export function Step8BusinessContext({ onNext, onBack }: Step8BusinessContextProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(businessContextSchema),
    defaultValues: {
      developmentStage: '',
      fundingStage: '',
      fundingTimeline: undefined,
      launchDate: undefined,
    },
  });

  const onSubmit = (data: z.infer<typeof businessContextSchema>) => {
    updateFormData({
      technicalDescription: formData.technicalDescription || '', // Preserve existing data
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Business Context</h2>
          <p className="text-muted-foreground">
            Understanding timing and urgency helps prioritize the FTO analysis
          </p>
        </div>

        <FormField
          control={form.control}
          name="developmentStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Development Stage *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {developmentStages.map((stage) => (
                    <SelectItem key={stage} value={stage.toLowerCase().replace(/\s+/g, '-')}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How far along is the product development?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fundingStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Stage *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fundingStages.map((stage) => (
                    <SelectItem key={stage} value={stage.toLowerCase().replace(/\s+/g, '-')}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Current funding status of the client
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fundingTimeline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Upcoming Funding Round (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Select date'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                If raising soon, investors may require FTO clearance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="launchDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expected Product Launch Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Select date'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When does the client plan to commercialize? This affects turnaround urgency.
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
