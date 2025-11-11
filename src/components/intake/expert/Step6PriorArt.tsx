import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepNavigation } from '../StepNavigation';
import { expertStep6Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step6PriorArtProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step6PriorArt({ onNext, onBack }: Step6PriorArtProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [patentNumber, setPatentNumber] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [relevanceNotes, setRelevanceNotes] = useState('');

  const form = useForm({
    resolver: zodResolver(expertStep6Schema),
    defaultValues: {
      priorArtReferences: formData.priorArtReferences || [],
    },
  });

  const references = form.watch('priorArtReferences') || [];

  const addReference = () => {
    if (patentNumber.trim()) {
      const newRef = {
        patentNumber: patentNumber.trim(),
        publicationDate: publicationDate || undefined,
        relevanceNotes: relevanceNotes || undefined,
      };
      form.setValue('priorArtReferences', [...references, newRef]);
      setPatentNumber('');
      setPublicationDate('');
      setRelevanceNotes('');
    }
  };

  const removeReference = (index: number) => {
    form.setValue('priorArtReferences', references.filter((_, i) => i !== index));
  };

  const onSubmit = (data: { priorArtReferences?: any[] }) => {
    updateFormData({ priorArtReferences: data.priorArtReferences || [] });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Prior art references</h2>
          <p className="text-muted-foreground">
            Optional: Provide known prior art with detailed reference information
          </p>
        </div>

        <FormField
          control={form.control}
          name="priorArtReferences"
          render={() => (
            <FormItem>
              <FormLabel>Prior Art</FormLabel>
              <FormDescription>
                Add structured references to known prior art patents
              </FormDescription>
              <FormControl>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Add Reference</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Patent number (e.g., US1234567A)"
                        value={patentNumber}
                        onChange={(e) => setPatentNumber(e.target.value)}
                        className="font-mono"
                      />
                      <Input
                        type="date"
                        placeholder="Publication date"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                      />
                      <Input
                        placeholder="Relevance notes (optional)"
                        value={relevanceNotes}
                        onChange={(e) => setRelevanceNotes(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addReference}
                        disabled={!patentNumber.trim()}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reference
                      </Button>
                    </CardContent>
                  </Card>

                  {references.length > 0 && (
                    <div className="space-y-2">
                      {references.map((ref, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="font-mono font-medium">{ref.patentNumber}</div>
                                {ref.publicationDate && (
                                  <div className="text-sm text-muted-foreground">
                                    Published: {ref.publicationDate}
                                  </div>
                                )}
                                {ref.relevanceNotes && (
                                  <div className="text-sm">{ref.relevanceNotes}</div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeReference(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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
