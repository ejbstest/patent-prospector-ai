import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface StepConfirmationProps {
  analysisId: string;
  isExemption?: boolean;
}

export function StepConfirmation({ analysisId, isExemption = false }: StepConfirmationProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate(`/dashboard/analysis/${analysisId}`);
    }
  }, [countdown, analysisId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center">
      {/* Success Animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary to-primary/60 rounded-full p-8">
          <CheckCircle className="h-20 w-20 text-primary-foreground animate-in zoom-in duration-500" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3 max-w-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {isExemption ? 'Complimentary Research Analysis Approved!' : 'Analysis Submitted Successfully!'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isExemption 
            ? 'Your complimentary research report—no payment required. Full analysis with all features included.'
            : 'Your IP risk analysis is now being processed by our AI system'
          }
        </p>
      </div>

      {/* Analysis Details Card */}
      <Card className="w-full max-w-md p-6 space-y-4 border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Analysis ID</span>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {analysisId.slice(0, 8)}...
          </code>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Generating Preview</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated Time</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">~5 minutes</span>
          </div>
        </div>

        {isExemption && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">Researcher Exemption Applied</span>
            </div>
          </div>
        )}
      </Card>

      {/* What Happens Next */}
      <div className="text-left max-w-xl space-y-3 bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">1.</span>
            <span>Our AI searches patent databases for relevant prior art</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">2.</span>
            <span>We generate a {isExemption ? <strong className="text-foreground">FULL complimentary analysis</strong> : <strong className="text-foreground">FREE preliminary risk assessment</strong>}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">3.</span>
            <span>You will see {isExemption ? 'comprehensive claim charts, white space opportunities, and design-around strategies' : 'top potential conflicts and overall risk score'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">4.</span>
            <span>{isExemption ? 'Export the full white-labeled PDF report when complete' : 'Upgrade anytime for expert review & detailed claim analysis'}</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        <Button 
          size="lg"
          onClick={() => navigate(`/dashboard/analysis/${analysisId}`)}
          className="group"
        >
          View Progress
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button 
          size="lg"
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Auto-redirect countdown */}
      <p className="text-xs text-muted-foreground">
        Redirecting to progress page in {countdown} seconds...
      </p>
    </div>
  );
}
