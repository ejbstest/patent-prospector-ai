import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepNavigation } from '../StepNavigation';
import { RichTextEditor } from '../RichTextEditor';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

const inventionOverviewSchema = z.object({
  inventionTitle: z.string().min(5, 'Title must be at least 5 characters').max(100),
  inventionCategory: z.string().min(1, 'Category is required'),
  valueProp: z.string().min(20, 'Value proposition must be at least 20 characters').max(200),
  problemBeingSolved: z.string().min(200, 'Problem description must be at least 200 characters').max(1000),
  solutionApproach: z.string().min(300, 'Solution description must be at least 300 characters').max(1500),
  targetCustomers: z.string().min(100, 'Target customers must be at least 100 characters').max(500),
});

interface Step2InventionOverviewProps {
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  'Software',
  'Hardware',
  'Biotech',
  'Mechanical',
  'Chemical',
  'Medical Device',
  'Consumer Product',
  'Telecommunications',
  'Other',
];

export function Step2InventionOverview({ onNext, onBack }: Step2InventionOverviewProps) {
  const { formData, updateFormData } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(inventionOverviewSchema),
    defaultValues: {
      inventionTitle: formData.inventionTitle || '',
      inventionCategory: formData.inventionCategory || '',
      valueProp: formData.valueProp || '',
      problemBeingSolved: formData.problemBeingSolved || '',
      solutionApproach: formData.solutionApproach || '',
      targetCustomers: formData.targetCustomers || '',
    },
  });

  const onSubmit = (data: z.infer<typeof inventionOverviewSchema>) => {
    updateFormData({
      inventionTitle: data.inventionTitle,
      inventionCategory: data.inventionCategory,
      valueProp: data.valueProp,
      problemBeingSolved: data.problemBeingSolved,
      solutionApproach: data.solutionApproach,
      targetCustomers: data.targetCustomers,
      // Legacy field for backward compatibility with createAnalysis
      disclosure: data.inventionTitle,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Invention Overview</h2>
          <p className="text-muted-foreground">
            Provide a high-level overview of the invention being analyzed
          </p>
        </div>

        <FormField
          control={form.control}
          name="inventionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invention Title *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="AI-Powered Patent Analysis System" 
                  maxLength={100}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/100 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventionCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invention Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valueProp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Sentence Value Proposition *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="A method for analyzing patents that improves accuracy by 90% using AI" 
                  maxLength={200}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/200 characters - What makes this invention valuable?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problemBeingSolved"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Being Solved *</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Describe the problem this invention addresses. What pain point does it solve? Who experiences this problem? Why do current solutions fall short?"
                  maxLength={1000}
                  minRows={6}
                />
              </FormControl>
              <FormDescription>
                200-1000 words - Be specific about the problem and its impact
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="solutionApproach"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How the Invention Solves It *</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Explain how this invention solves the problem. What is the core innovation? What approach does it take? Why is this approach better than alternatives?"
                  maxLength={1500}
                  minRows={8}
                />
              </FormControl>
              <FormDescription>
                300-1500 words - Focus on the solution, not technical implementation details yet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetCustomers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Customers/Users *</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Who will use this invention? What industries or market segments? What are their characteristics?"
                  maxLength={500}
                  minRows={4}
                />
              </FormControl>
              <FormDescription>
                100-500 words - Describe the end users and target market
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
