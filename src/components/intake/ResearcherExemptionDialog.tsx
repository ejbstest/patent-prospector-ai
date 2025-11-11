import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface ResearcherExemptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeValidated: () => void;
}

export function ResearcherExemptionDialog({ 
  open, 
  onOpenChange, 
  onCodeValidated 
}: ResearcherExemptionDialogProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      // Validate code (case-sensitive)
      if (code === 'CURIOUSFELLOW') {
        onCodeValidated();
        onOpenChange(false);
      } else {
        setError('Invalid exemption code. Please check and try again.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Researcher Exemption</DialogTitle>
          <DialogDescription>
            Enter your exemption code to access complimentary analysis for non-commercial research purposes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter exemption code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isValidating}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Code is case-sensitive
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!code || isValidating}
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Code
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Researcher Exemption Policy:</strong> This exemption is for educational and 
            non-commercial research purposes only. The complimentary report includes all features 
            available to paying customers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
