import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface StepConfirmationProps {
  analysisId: string;
}

export function StepConfirmation({ analysisId }: StepConfirmationProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Simple confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      // Simple confetti effect (could be enhanced with a library)
      const particleCount = 2;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = randomInRange(0, window.innerWidth) + 'px';
        particle.style.top = '-10px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = `hsl(${randomInRange(0, 360)}, 70%, 60%)`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        document.body.appendChild(particle);

        const animation = particle.animate(
          [
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(720deg)`, opacity: 0 },
          ],
          {
            duration: randomInRange(2000, 4000),
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }
        );

        animation.onfinish = () => particle.remove();
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
        <CheckCircle className="w-12 h-12 text-success" />
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-2">Analysis Request Submitted!</h2>
        <p className="text-muted-foreground text-lg">
          We've received your IP risk analysis request
        </p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Analysis ID</div>
            <div className="font-mono text-lg font-medium">{analysisId}</div>
          </div>
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground mb-1">Expected Completion</div>
            <div className="text-lg font-medium">Within 48 hours</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You'll receive an email confirmation shortly. We'll notify you when your analysis is ready.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => navigate(`/dashboard/analyses/${analysisId}`)}
            size="lg"
          >
            View Progress
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            size="lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
