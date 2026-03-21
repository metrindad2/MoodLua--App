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
    // Garante que as animações comecem após a montagem do componente.
    setIsRendered(true);

    // Este timer iniciará a animação de fade-out
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2800); // A animação principal dura ~2s, 2.8s é seguro.

    // Este timer chamará o callback onFinished para desmontar o componente
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3300); // Deve ser exitTimer + duração da transição (500ms)

    // Função de limpeza para limpar os timers se o componente for desmontado antes
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
        {/* Partículas de Estrelas de fundo */}
        <Star className="absolute top-[-20px] left-[-80px] h-4 w-4 text-yellow-300/80 animate-star-twinkle [animation-delay:0.2s]" />
        <Star className="absolute top-[50px] left-[-90px] h-3 w-3 text-yellow-300/60 animate-star-twinkle [animation-delay:0.8s]" />
        <Star className="absolute top-[0px] right-[-80px] h-5 w-5 text-yellow-300/90 animate-star-twinkle [animation-delay:0.5s]" />
        <Star className="absolute top-[60px] right-[-70px] h-2 w-2 text-yellow-300/50 animate-star-twinkle [animation-delay:1.2s]" />
        <Star className="absolute bottom-[-40px] left-[20px] h-3 w-3 text-yellow-300/70 animate-star-twinkle [animation-delay:1.5s]" />
        <Star className="absolute bottom-[-30px] right-[20px] h-4 w-4 text-yellow-300/80 animate-star-twinkle [animation-delay:1.8s]" />

        {/* Elemento central: Lua com um "planeta" orbitando */}
        <div className={cn('relative h-36 w-36 opacity-0', isRendered && 'animate-moon-bouncy-enter')}>
          {/* O container que rotaciona para criar a órbita */}
          <div className="absolute inset-0 animate-orbit">
            {/* O "planeta" (um ponto de luz) posicionado na borda do container */}
            <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-white animate-planet-glow" />
          </div>

          {/* A Lua no centro, que não rotaciona */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Moon
              className={cn(
                'h-24 w-24 text-white',
                '[filter:drop-shadow(0_0_10px_rgba(255,255,255,0.7))]'
              )}
            />
          </div>
        </div>

        {/* Textos que aparecem após a animação principal */}
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
