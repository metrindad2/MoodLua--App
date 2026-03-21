'use client';

import { Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Garante que as animações comecem após a montagem do componente.
    setIsRendered(true);

    // Este timer iniciará a animação de fade-out
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500); // Um pouco mais de tempo para apreciar a animação

    // Este timer chamará o callback onFinished para desmontar o componente
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3000); // Duração deve ser exitTimer + duração da transição

    // Função de limpeza para limpar os timers se o componente for desmontado antes
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
      <div className="text-center">
        <Moon
          className={cn(
            'mx-auto h-24 w-24 animate-moon-pulse transition-opacity duration-1000',
            isRendered ? 'opacity-100' : 'opacity-0'
          )}
        />
        <h1
          className={cn(
            'mt-4 text-6xl font-bold transition-all duration-700',
            isRendered
              ? 'opacity-100 translate-y-0 delay-300'
              : 'opacity-0 translate-y-4'
          )}
          style={{ fontFamily: 'cursive' }}
        >
          MoodLua
        </h1>
        <p
          className={cn(
            'mt-2 text-lg tracking-wider transition-all duration-700',
            isRendered
              ? 'opacity-100 translate-y-0 delay-500'
              : 'opacity-0 translate-y-4'
          )}
        >
          Seu ciclo, seu astral.
        </p>
      </div>
    </div>
  );
}
