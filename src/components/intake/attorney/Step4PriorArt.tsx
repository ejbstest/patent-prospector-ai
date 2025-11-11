import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { StepNavigation } from '../StepNavigation';
import { BulletPointEditor } from '../BulletPointEditor';
import { PatentNumberInput } from '../PatentNumberInput';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

const priorArtSchema = z.object({
  knownCompetitors: z.array(z.string()).min(1, 'At least 1 competitor is required'),
  knownPatents: z.array(z.string()).optional(),
});

interface Step4PriorArtProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4PriorArt({ onNext, onBack }: Step4PriorArtProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [researchPapers, setResearchPapers] = useState<string[]>([]);
  const [publications, setPublications] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(priorArtSchema),
    defaultValues: {
      knownCompetitors: formData.knownCompetitors || [],
      knownPatents: formData.knownPatents || [],
    },
  });

  const onSubmit = (data: z.infer<typeof priorArtSchema>) => {
    updateFormData({
      knownCompetitors: data.knownCompetitors,
      knownPatents: data.knownPatents || [],
      // Legacy fields for backward compatibility
      competitors: data.knownCompetitors,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Prior Art Awareness</h2>
          <p className="text-muted-foreground">
            Help us understand what prior art you're already aware of
          </p>
        </div>

        <FormField
          control={form.control}
          name="knownCompetitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Known Competing Products/Technologies *</FormLabel>
              <FormControl>
                <BulletPointEditor
                  points={field.value}
                  onChange={field.onChange}
                  placeholder="Name of competing product or technology"
                  minPoints={1}
                />
              </FormControl>
              <FormDescription>
                List companies, products, or technologies that do something similar
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="knownPatents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Known Relevant Patents (Optional)</FormLabel>
              <FormControl>
                <PatentNumberInput
                  patents={field.value || []}
                  onChange={field.onChange}
                  placeholder="US1234567, EP9876543, etc."
                />
              </FormControl>
              <FormDescription>
                If you're aware of specific patents, list them here. We'll auto-fetch details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Existing Research Papers (Optional)</FormLabel>
          <div className="mt-3 space-y-2">
            {researchPapers.map((paper, index) => (
              <div key={index} className="flex gap-2">
                <Input value={paper} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setResearchPapers(papers => papers.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Input
              placeholder="Citation or DOI of relevant research paper"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    setResearchPapers([...researchPapers, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Academic papers or publications related to this technology
          </p>
        </div>

        <div>
          <FormLabel>Trade Publications (Optional)</FormLabel>
          <div className="mt-3 space-y-2">
            {publications.map((pub, index) => (
              <div key={index} className="flex gap-2">
                <Input value={pub} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPublications(pubs => pubs.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Input
              placeholder="Article title or URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    setPublications([...publications, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Industry articles or trade publications mentioning similar technologies
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
