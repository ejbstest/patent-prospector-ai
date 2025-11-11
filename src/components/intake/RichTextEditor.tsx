import { Textarea } from '@/components/ui/textarea';
import { getCharacterCountColor } from '@/lib/utils/formHelpers';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  minRows?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  minRows = 8,
  className,
}: RichTextEditorProps) {
  const characterCount = value.length;
  const colorClass = getCharacterCountColor(characterCount, maxLength);

  return (
    <div className={cn('space-y-2', className)}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={minRows}
        className="resize-y font-sans"
      />
      <div className="flex justify-end">
        <span className={cn('text-xs', colorClass)}>
          {characterCount} / {maxLength}
        </span>
      </div>
    </div>
  );
}
