import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cleanPatentNumber, formatPatentNumber } from '@/lib/utils/formHelpers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PatentNumberInputProps {
  patents: string[];
  onChange: (patents: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function PatentNumberInput({
  patents,
  onChange,
  placeholder = 'Enter patent number (e.g., US1234567A)',
  className,
}: PatentNumberInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const addPatent = () => {
    const cleaned = cleanPatentNumber(inputValue);
    
    if (!cleaned) {
      toast({
        title: 'Invalid patent number',
        description: 'Please enter a valid patent number (e.g., US1234567A, EP1234567A1)',
        variant: 'destructive',
      });
      return;
    }

    if (patents.includes(cleaned)) {
      toast({
        title: 'Duplicate patent',
        description: 'This patent number has already been added.',
        variant: 'destructive',
      });
      return;
    }

    onChange([...patents, cleaned]);
    setInputValue('');
  };

  const removePatent = (patent: string) => {
    onChange(patents.filter((p) => p !== patent));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPatent();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 font-mono"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addPatent}
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {patents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {patents.map((patent) => (
            <Badge key={patent} variant="secondary" className="gap-1 pl-3 pr-1 font-mono">
              {formatPatentNumber(patent)}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removePatent(patent)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
