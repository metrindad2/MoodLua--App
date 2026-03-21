'use client';

import { Moon, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Ensures animations start after component mount for smooth transitions.
    setIsRendered(true);

    // This timer will trigger the fade-out animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3300); // Main animation is ~2.8s, this gives a moment before fading out.

    // This timer will call the onFinished callback to unmount the component
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3800); // Must be exitTimer + transition duration (500ms)

    // Cleanup function to clear timers if the component unmounts early
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#6d28d9] via-[#a855f7] to-[#ec4899] text-white transition-opacity duration-500 bg-[length:200%_200%] animate-background-pan overflow-hidden',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Background Star Particles */}
        <Star className="absolute top-[-20px] left-[-80px] h-4 w-4 text-yellow-300/80 animate-star-twinkle [animation-delay:0.2s]" />
        <Star className="absolute top-[50px] left-[-90px] h-3 w-3 text-yellow-300/60 animate-star-twinkle [animation-delay:0.8s]" />
        <Star className="absolute top-[0px] right-[-80px] h-5 w-5 text-yellow-300/90 animate-star-twinkle [animation-delay:0.5s]" />
        <Star className="absolute top-[60px] right-[-70px] h-2 w-2 text-yellow-300/50 animate-star-twinkle [animation-delay:1.2s]" />
        <Star className="absolute bottom-[-40px] left-[20px] h-3 w-3 text-yellow-300/70 animate-star-twinkle [animation-delay:1.5s]" />
        <Star className="absolute bottom-[-30px] right-[20px] h-4 w-4 text-yellow-300/80 animate-star-twinkle [animation-delay:1.8s]" />

        {/* Central Element: Moon with an orbiting "planet" */}
        <div className={cn('relative h-36 w-36 opacity-0', isRendered && 'animate-moon-bouncy-enter')}>
          {/* The container that rotates to create the orbit */}
          <div className="absolute inset-0 animate-orbit" style={{ animationDelay: '1s' }}>
            {/* The "planet" (a light point) positioned on the edge of the container */}
            <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-white animate-planet-glow" />
          </div>

          {/* The Moon in the center, which doesn't rotate */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Moon
              className={cn(
                'h-24 w-24 text-white',
                '[filter:drop-shadow(0_0_10px_rgba(255,255,255,0.7))]'
              )}
            />
          </div>
        </div>

        {/* Texts that appear after the main animation */}
        <h1
          className={cn(
            'mt-4 text-6xl font-bold opacity-0',
            isRendered && 'animate-text-reveal'
          )}
          style={{ fontFamily: 'cursive' }}
        >
          MoodLua
        </h1>
        <p
          className={cn(
            'mt-2 text-lg tracking-wider opacity-0',
            isRendered && 'animate-slogan-fade-in'
          )}
        >
          Seu ciclo, seu astral.
        </p>
      </div>
    </div>
  );
}
