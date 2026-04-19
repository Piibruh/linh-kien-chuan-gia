'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2">
      <div className="bg-destructive text-destructive-foreground rounded-lg p-2 min-w-[50px] text-center">
        <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-xs">Giờ</div>
      </div>
      <div className="text-2xl font-bold text-muted-foreground">:</div>
      <div className="bg-destructive text-destructive-foreground rounded-lg p-2 min-w-[50px] text-center">
        <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-xs">Phút</div>
      </div>
      <div className="text-2xl font-bold text-muted-foreground">:</div>
      <div className="bg-destructive text-destructive-foreground rounded-lg p-2 min-w-[50px] text-center">
        <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-xs">Giây</div>
      </div>
    </div>
  );
}
