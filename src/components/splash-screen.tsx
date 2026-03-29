'use client';

import { Moon } from 'lucide-react';

const Star = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
  </svg>
);

export function SplashScreen() {
  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-purple-900 via-purple-600 to-purple-400 text-white animate-background-pan bg-[length:400%_400%]">
      {/* Stars */}
      <Star className="absolute top-[15%] left-[15%] h-4 w-4 text-yellow-300/80 animate-twinkle" style={{ animationDelay: '0.5s' }} />
      <Star className="absolute top-[20%] right-[20%] h-6 w-6 text-yellow-300 animate-twinkle" style={{ animationDelay: '0.2s' }} />
      <Star className="absolute top-[50%] left-[25%] h-3 w-3 text-yellow-300/70 animate-twinkle" style={{ animationDelay: '1s' }} />
      <Star className="absolute bottom-[20%] right-[15%] h-5 w-5 text-yellow-300 animate-twinkle" style={{ animationDelay: '0.8s' }} />
      <Star className="absolute bottom-[10%] left-[30%] h-4 w-4 text-yellow-300/90 animate-twinkle" style={{ animationDelay: '1.2s' }} />
      <Star className="absolute top-[30%] left-[40%] h-4 w-4 text-yellow-300/80 animate-twinkle" style={{ animationDelay: '1.5s' }} />
      <Star className="absolute bottom-[40%] right-[35%] h-4 w-4 text-yellow-300/90 animate-twinkle" style={{ animationDelay: '1.8s' }} />

      <div className="relative flex flex-col items-center justify-center text-center">
        <div className="relative mb-8 flex items-center justify-center animate-moon-reveal opacity-0" style={{ animationDelay: '0.2s' }}>
          <div className="absolute h-48 w-48 animate-orbit" style={{ animationDelay: '0.2s' }}>
            {/* Planet */}
            <div className="absolute top-1 left-1/2 -ml-2.5 h-5 w-5 rounded-full bg-purple-300 shadow-lg animate-twinkle" style={{ animationDelay: '0.3s' }} />
          </div>
          
          <Moon className="h-40 w-40 text-purple-200/90 drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)]" />
        </div>
      
        <div>
          <h1 className="font-cursive text-7xl text-white opacity-0 drop-shadow-lg animate-text-reveal" style={{ animationDelay: '0.6s' }}>
            MoodLua
          </h1>
          <p className="mt-2 text-lg text-white/80 opacity-0 animate-slogan-fade" style={{ animationDelay: '1.0s' }}>
            Seu ciclo, seu astral.
          </p>
        </div>
      </div>
    </div>
  );
}
