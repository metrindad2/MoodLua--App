'use client';

import { Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // This timer will start the fade-out animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    // This timer will call the onFinished callback to unmount the component
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2700); // Duration should be exitTimer + transition duration

    // Cleanup function to clear timers if the component unmounts early
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#6d28d9] via-[#a855f7] to-[#ec4899] text-white transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="animate-fade-in-scale text-center">
        <Moon className="mx-auto h-24 w-24" />
        <h1
          className="mt-4 text-6xl font-bold"
          style={{ fontFamily: 'cursive' }}
        >
          MoodLua
        </h1>
        <p className="mt-2 text-lg tracking-wider">Seu ciclo, seu astral.</p>
      </div>
    </div>
  );
}
