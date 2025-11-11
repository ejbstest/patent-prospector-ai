import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatFileSize, getFileExtension } from '@/lib/utils/formHelpers';
import { validateFileType, validateTotalFileSize } from '@/lib/schemas/intakeFormSchemas';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUploadZone({
  files,
  onFilesAdd,
  onFileRemove,
  maxFiles = 10,
  className,
}: FileUploadZoneProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Validate file types
      const invalidFiles = acceptedFiles.filter(file => !validateFileType(file));
      if (invalidFiles.length > 0) {
        toast({
          title: 'Invalid file type',
          description: 'Only PDF, DOCX, and TXT files are allowed.',
          variant: 'destructive',
        });
        return;
      }

      // Validate total size
      const allFiles = [...files, ...acceptedFiles];
      if (!validateTotalFileSize(allFiles)) {
        toast({
          title: 'File size limit exceeded',
          description: 'Total file size must not exceed 50MB.',
          variant: 'destructive',
        });
        return;
      }

      // Check max files
      if (allFiles.length > maxFiles) {
        toast({
          title: 'Too many files',
          description: `You can upload a maximum of ${maxFiles} files.`,
          variant: 'destructive',
        });
        return;
      }

      onFilesAdd(acceptedFiles);
    },
    [files, maxFiles, onFilesAdd, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, TXT • Max 50MB total • Up to {maxFiles} files
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </span>
            <span className="text-muted-foreground">
              {formatFileSize(totalSize)} / 50MB
            </span>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {getFileExtension(file.name).toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onFileRemove(index)}
                  className="flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
