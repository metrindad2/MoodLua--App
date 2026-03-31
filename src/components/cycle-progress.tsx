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

  // A cor do anel de progresso
  const ringColor = 'hsl(var(--primary))';
  // A cor de fundo do anel (a parte não preenchida)
  const ringBgColor = 'hsl(var(--muted))';

  return (
    <div className="flex justify-center p-4">
      {/* Círculo externo que serve como container e tem o gradiente */}
      <div
        className="relative flex h-56 w-56 items-center justify-center rounded-full shadow-lg"
        style={{
          background: `conic-gradient(${ringColor} ${progress}%, ${ringBgColor} ${progress}%)`,
        }}
      >
        {/* Círculo interno que cria o efeito de "anel" e contém o texto */}
        <div className="absolute flex h-[88%] w-[88%] items-center justify-center rounded-full bg-background">
          <div className="text-center">
            {/* Texto principal: dia do ciclo */}
            <p className="text-sm font-medium text-primary">{phase}</p>
            <p className="text-7xl font-bold tracking-tight text-foreground">
              {currentDay}
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Dia do Ciclo
            </p>

            {/* Linha separadora sutil */}
            <hr className="mx-auto my-2 w-1/2 border-border" />

            {/* Texto secundário: dias para a próxima menstruação */}
            <p className="text-sm font-medium text-muted-foreground">
              {daysUntilNext >= 0
                ? `${daysUntilNext} dias p/ menstruação`
                : 'Menstruação atrasada'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
