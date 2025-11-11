import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { searchCPCCodes } from '@/lib/utils/formHelpers';
import { cn } from '@/lib/utils';

interface CPCAutocompleteProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function CPCAutocomplete({
  selectedCodes,
  onChange,
  placeholder = 'Search CPC/IPC codes...',
  className,
}: CPCAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchCPCCodes>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      setSuggestions(searchCPCCodes(query));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const addCode = (code: string) => {
    if (!selectedCodes.includes(code)) {
      onChange([...selectedCodes, code]);
    }
    setQuery('');
    setShowSuggestions(false);
  };

  const removeCode = (code: string) => {
    onChange(selectedCodes.filter((c) => c !== code));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-9"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((item) => (
              <button
                key={item.code}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                onClick={() => addCode(item.code)}
              >
                <div className="font-mono text-sm font-medium">{item.code}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCodes.map((code) => (
            <Badge key={code} variant="secondary" className="gap-1 pl-3 pr-1">
              <span className="font-mono text-xs">{code}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeCode(code)}
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
