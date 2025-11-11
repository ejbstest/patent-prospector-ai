import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulletPointEditorProps {
  points: string[];
  onChange: (points: string[]) => void;
  placeholder?: string;
  minPoints?: number;
  className?: string;
}

export function BulletPointEditor({
  points,
  onChange,
  placeholder = 'Enter a point...',
  minPoints = 0,
  className,
}: BulletPointEditorProps) {
  const safePoints = Array.isArray(points) ? points : [];
  const [inputValue, setInputValue] = useState('');

  const addPoint = () => {
    if (inputValue.trim()) {
      onChange([...points, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removePoint = (index: number) => {
    onChange(points.filter((_, i) => i !== index));
  };

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...points];
    newPoints[index] = value;
    onChange(newPoints);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPoint();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        {points.map((point, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-shrink-0 w-6 h-10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <Input
              value={point}
              onChange={(e) => updatePoint(index, e.target.value)}
              className="flex-1"
              placeholder={`Point ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removePoint(index)}
              className="flex-shrink-0"
              disabled={points.length <= minPoints}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addPoint}
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {minPoints > 0 && points.length < minPoints && (
        <p className="text-sm text-muted-foreground">
          At least {minPoints} point{minPoints !== 1 ? 's' : ''} required
        </p>
      )}
    </div>
  );
}
