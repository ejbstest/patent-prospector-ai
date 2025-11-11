import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { StepNavigation } from '../StepNavigation';
import { BulletPointEditor } from '../BulletPointEditor';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const competitiveLandscapeSchema = z.object({
  directCompetitors: z.array(z.string()).min(3, 'At least 3 direct competitors required'),
  indirectCompetitors: z.array(z.string()).optional(),
  marketLeaders: z.array(z.string()).optional(),
});

interface Step7CompetitiveLandscapeProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step7CompetitiveLandscape({ onNext, onBack }: Step7CompetitiveLandscapeProps) {
  const { formData, updateFormData } = useIntakeFormStore();
  const [recentAcquisitions, setRecentAcquisitions] = useState<string[]>([]);
  const [dominantHolders, setDominantHolders] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(competitiveLandscapeSchema),
    defaultValues: {
      directCompetitors: formData.directCompetitors || [],
      indirectCompetitors: formData.indirectCompetitors || [],
      marketLeaders: formData.marketLeaders || [],
    },
  });

  const onSubmit = (data: z.infer<typeof competitiveLandscapeSchema>) => {
    updateFormData({
      directCompetitors: data.directCompetitors,
      indirectCompetitors: data.indirectCompetitors || [],
      marketLeaders: data.marketLeaders || [],
      recentAcquisitions,
      dominantPatentHolders: dominantHolders,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Competitive Landscape</h2>
          <p className="text-muted-foreground">
            Help us understand the competitive environment and key players
          </p>
        </div>

        <FormField
          control={form.control}
          name="directCompetitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direct Competitors *</FormLabel>
              <FormControl>
                <BulletPointEditor
                  points={field.value || []}
                  onChange={field.onChange}
                  placeholder="Company or product name"
                  minPoints={3}
                />
              </FormControl>
              <FormDescription>
                List at least 3 companies/products that compete directly in this space
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="indirectCompetitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indirect Competitors (Optional)</FormLabel>
              <FormControl>
                <BulletPointEditor
                  points={field.value || []}
                  onChange={field.onChange}
                  placeholder="Company or product solving the same problem differently"
                  minPoints={0}
                />
              </FormControl>
              <FormDescription>
                Alternative solutions or substitute products
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketLeaders"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market Leaders (Optional)</FormLabel>
              <FormControl>
                <BulletPointEditor
                  points={field.value || []}
                  onChange={field.onChange}
                  placeholder="Dominant company in this industry"
                  minPoints={0}
                />
              </FormControl>
              <FormDescription>
                Major players who might enter this space or acquire competitors
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="text-sm font-medium">Recent Acquisitions in This Space (Optional)</div>
          <div className="mt-3 space-y-2">
            {recentAcquisitions.map((acq, index) => (
              <div key={index} className="flex gap-2">
                <Input value={acq} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setRecentAcquisitions(acqs => acqs.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Input
              placeholder="e.g., BigCo acquired SmallTech for $500M (2024)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    setRecentAcquisitions([...recentAcquisitions, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Recent M&A activity signals high-value IP areas
          </p>
        </div>

        <div>
          <div className="text-sm font-medium">Dominant Patent Holders (Optional)</div>
          <div className="mt-3 space-y-2">
            {dominantHolders.map((holder, index) => (
              <div key={index} className="flex gap-2">
                <Input value={holder} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDominantHolders(holders => holders.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Input
              placeholder="Company name with large patent portfolio in this area"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    setDominantHolders([...dominantHolders, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Companies known for aggressive patent enforcement
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
