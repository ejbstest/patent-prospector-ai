import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { FileUploadZone } from '../FileUploadZone';
import { StepNavigation } from '../StepNavigation';
import { noviceStep6Schema } from '@/lib/schemas/intakeFormSchemas';
import { useIntakeFormStore } from '@/stores/intakeFormStore';

interface Step6FilesProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step6Files({ onNext, onBack }: Step6FilesProps) {
  const { formData, addFile, removeFile } = useIntakeFormStore();

  const form = useForm({
    resolver: zodResolver(noviceStep6Schema),
    defaultValues: {
      uploadedFiles: formData.uploadedFiles || [],
    },
  });

  const files = formData.uploadedFiles.map(f => f.file);

  const handleFilesAdd = (newFiles: File[]) => {
    newFiles.forEach(file => addFile({ file }));
  };

  const onSubmit = () => {
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upload any supporting documents</h2>
          <p className="text-muted-foreground">
            Optional: Product specs, sketches, presentations, or any relevant files
          </p>
        </div>

        <FormField
          control={form.control}
          name="uploadedFiles"
          render={() => (
            <FormItem>
              <FormLabel>Supporting Documents</FormLabel>
              <FormDescription>
                PDF, DOCX, or TXT files • Max 50MB total
              </FormDescription>
              <FormControl>
                <FileUploadZone
                  files={files}
                  onFilesAdd={handleFilesAdd}
                  onFileRemove={removeFile}
                />
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
