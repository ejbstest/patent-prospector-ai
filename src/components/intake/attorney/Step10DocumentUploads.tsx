import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { StepNavigation } from '../StepNavigation';
import { FileUploadZone } from '../FileUploadZone';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const documentUploadsSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

interface Step10DocumentUploadsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step10DocumentUploads({ onNext, onBack }: Step10DocumentUploadsProps) {
  const { formData, addFile, removeFile, updateFormData } = useIntakeFormStore();

  // Ensure uploadedFiles is always an array
  const uploadedFiles = Array.isArray(formData.uploadedFiles) ? formData.uploadedFiles : [];

  const form = useForm({
    resolver: zodResolver(documentUploadsSchema),
    defaultValues: {
      acceptTerms: formData.acceptTerms || false,
    },
  });

  const onSubmit = (data: z.infer<typeof documentUploadsSchema>) => {
    updateFormData({
      acceptTerms: data.acceptTerms,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="font-heading text-page-title mb-2">Supporting Documents</h2>
          <p className="text-muted-foreground">
            Upload any technical documentation that will help the analysis
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Confidentiality Notice:</strong> All uploaded documents are encrypted and stored securely. 
            We maintain strict confidentiality under attorney-client privilege. Documents are automatically 
            deleted 30 days after report delivery.
          </AlertDescription>
        </Alert>

        <div>
          <FormLabel>Technical Documentation (Optional)</FormLabel>
          <FileUploadZone
            files={uploadedFiles.map(uf => uf.file)}
            onFilesAdd={(files) => {
              files.forEach((file) => {
                addFile({ file, label: file.name });
              });
            }}
            onFileRemove={removeFile}
            maxFiles={20}
            className="mt-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Accepted formats: PDF, DOCX, TXT, PNG, JPG. Max 100MB total.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">Helpful documents to include:</p>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Technical specifications or white papers</li>
              <li>Existing patent applications or disclosures</li>
              <li>Product diagrams or flowcharts</li>
              <li>Research papers or academic publications</li>
              <li>Competitor product documentation</li>
              <li>Prior art references you've identified</li>
            </ul>
          </div>
        </div>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  I accept the terms and conditions *
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  By proceeding, I confirm that I have authority to request this analysis on behalf of my client, 
                  and I agree to the{' '}
                  <a href="/terms" className="underline hover:text-foreground">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </a>
                  .
                </p>
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
