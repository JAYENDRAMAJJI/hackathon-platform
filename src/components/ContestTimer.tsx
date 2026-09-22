import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContestTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
}

export function ContestTimer({ initialSeconds, onExpire }: ContestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  // Warning state if less than 10 minutes remaining
  const isWarning = timeLeft <= 600; 
  // Critical state if less than 2 minutes
  const isCritical = timeLeft <= 120;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 font-mono text-lg px-3 py-1 rounded-md transition-colors border",
        isCritical 
          ? "bg-red-900/50 text-red-400 border-red-800 animate-pulse" 
          : isWarning 
            ? "bg-yellow-900/50 text-yellow-400 border-yellow-800"
            : "bg-slate-800 text-slate-300 border-slate-700"
      )}
    >
      <Clock className="w-5 h-5" />
      {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
    </div>
  );
}
