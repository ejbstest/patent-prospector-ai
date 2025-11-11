import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const jurisdictions = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'EP', name: 'European Union', flag: '🇪🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
];

interface JurisdictionSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function JurisdictionSelect({ selected, onChange, className }: JurisdictionSelectProps) {
  const toggleJurisdiction = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', className)}>
      {jurisdictions.map((jurisdiction) => {
        const isSelected = selected.includes(jurisdiction.code);
        
        return (
          <label
            key={jurisdiction.code}
            className={cn(
              'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleJurisdiction(jurisdiction.code)}
            />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{jurisdiction.flag}</span>
              <div>
                <div className="text-sm font-medium">{jurisdiction.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {jurisdiction.code}
                </div>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
