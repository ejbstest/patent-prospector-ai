import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  progressPercentage: number;
}

export function CountdownTimer({ progressPercentage }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const totalHours = 48;
      const elapsedHours = (progressPercentage / 100) * totalHours;
      const remainingHours = Math.max(0, totalHours - elapsedHours);
      
      const hours = Math.floor(remainingHours);
      const minutes = Math.floor((remainingHours - hours) * 60);
      
      return `${hours} hours ${minutes} minutes remaining`;
    };

    setTimeRemaining(calculateTimeRemaining());

    // Update every minute
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000);

    return () => clearInterval(interval);
  }, [progressPercentage]);

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span className="text-sm">{timeRemaining}</span>
    </div>
  );
}
