'use client';

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
  // Calculate progress, ensuring it doesn't exceed 100%
  const progress = Math.min((currentDay / cycleLength) * 100, 100);

  const ringColor = 'hsl(var(--primary))';
  const ringBgColor = 'hsl(var(--muted))';

  return (
    <div className="flex justify-center p-4">
      {/* Círculo de progresso */}
      <div
        className="relative flex h-60 w-60 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${progress}%, ${ringBgColor} ${progress}%)`,
        }}
      >
        {/* Adiciona um efeito de sombra interna sutil para dar profundidade */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)]"></div>

        {/* Círculo interno para criar o efeito de anel */}
        <div className="absolute flex h-[86%] w-[86%] items-center justify-center rounded-full bg-background">
          <div className="text-center">
            {/* Fase do ciclo */}
            <p className="text-base font-semibold text-primary">{phase}</p>

            {/* Dia do ciclo (número grande) */}
            <p className="text-8xl font-bold tracking-tight text-foreground">
              {currentDay}
            </p>

            {/* Rótulo "Dia do Ciclo" */}
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground -mt-1">
              Dia do Ciclo
            </p>

            {/* Linha separadora */}
            <hr className="mx-auto my-2 w-1/3 border-border" />

            {/* Dias para a próxima menstruação */}
            <p className="text-sm font-medium text-muted-foreground">
              {daysUntilNext > 1
                ? `${daysUntilNext} dias p/ menstruação`
                : daysUntilNext === 1
                ? `${daysUntilNext} dia p/ menstruação`
                : daysUntilNext === 0
                ? 'Menstruação prevista para hoje'
                : 'Menstruação atrasada'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
