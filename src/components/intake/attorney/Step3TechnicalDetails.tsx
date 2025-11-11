import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StepNavigation } from '../StepNavigation';
import { RichTextEditor } from '../RichTextEditor';
import { BulletPointEditor } from '../BulletPointEditor';
import { FileUploadZone } from '../FileUploadZone';
import { useIntakeFormStore, UploadedFile } from '@/stores/intakeFormStore';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const technicalDetailsSchema = z.object({
  technicalDescription: z.string().min(500, 'Technical description must be at least 500 characters').max(3000),
  keyInnovations: z.array(z.string()).min(3, 'At least 3 key innovations are required').max(10),
});

interface Step3TechnicalDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step3TechnicalDetails({ onNext, onBack }: Step3TechnicalDetailsProps) {
  const { formData, updateFormData, addFile, removeFile } = useIntakeFormStore();
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  const form = useForm({
    resolver: zodResolver(technicalDetailsSchema),
    defaultValues: {
      technicalDescription: formData.technicalDescription || '',
      keyInnovations: formData.innovations || [],
    },
  });

  const handleFilesAdd = (files: UploadedFile[]) => {
    files.forEach((file) => addFile(file));
  };

  const onSubmit = (data: z.infer<typeof technicalDetailsSchema>) => {
    updateFormData({
      technicalDescription: data.technicalDescription,
      innovations: data.keyInnovations,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Technical Details</h2>
          <p className="text-muted-foreground">
            Provide detailed technical information about the invention
          </p>
        </div>

        <FormField
          control={form.control}
          name="technicalDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Technical Description *</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Describe the invention as if explaining to a patent examiner. Include all technical components, processes, algorithms, materials, etc. Be thorough and specific."
                  maxLength={3000}
                  minRows={12}
                />
              </FormControl>
              <FormDescription>
                500-3000 characters - This is the core of your FTO analysis. Include:
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>All technical components and how they interact</li>
                  <li>Step-by-step processes or methods</li>
                  <li>Algorithms, materials, or unique configurations</li>
                  <li>Performance metrics or specifications</li>
                </ul>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keyInnovations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Technical Innovations *</FormLabel>
              <FormControl>
                <BulletPointEditor
                  points={field.value}
                  onChange={field.onChange}
                  placeholder="What makes this invention unique or non-obvious?"
                  minPoints={3}
                />
              </FormControl>
              <FormDescription>
                List 3-10 specific innovations. What's new? What's different from prior art?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Technical Specifications (Optional)</FormLabel>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Specification name (e.g., 'Materials')" />
              <Input placeholder="Value (e.g., 'Carbon fiber composite')" />
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add structured specifications like materials, dimensions, performance metrics, etc.
          </p>
        </div>

        <div>
          <FormLabel>Diagrams & Schematics (Optional)</FormLabel>
          <FileUploadZone
            files={formData.uploadedFiles.map(uf => uf.file)}
            onFilesAdd={(files) => {
              files.forEach((file) => {
                addFile({ file, label: file.name });
              });
            }}
            onFileRemove={removeFile}
            maxFiles={10}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Upload technical diagrams, flowcharts, schematics, or prototype photos (PDF, PNG, JPG, max 10 files)
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
