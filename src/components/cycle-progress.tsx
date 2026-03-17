'use client';
import { Leaf } from 'lucide-react';

interface CycleProgressProps {
  currentDay: number;
  cycleLength: number;
  phase: string;
  daysUntilNext: number;
}

export function CycleProgress({
  currentDay,
  cycleLength,
  phase,
  daysUntilNext,
}: CycleProgressProps) {
  const progress = Math.min((currentDay / cycleLength) * 100, 100);

  return (
    <div className="flex justify-center py-4">
      <div
        className="relative flex h-48 w-48 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%)`,
        }}
      >
        <div className="absolute flex h-[85%] w-[85%] items-center justify-center rounded-full bg-background">
          <div className="text-center">
            <Leaf className="w-8 h-8 text-primary mx-auto mb-1" />
            <div className="text-4xl font-bold">Dia {currentDay}</div>
            <div className="text-muted-foreground">{phase}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {daysUntilNext >= 0
                ? `${daysUntilNext} dias para a próxima`
                : 'Período atrasado'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
