'use client';

const LegendItem = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex h-5 w-5 items-center justify-center">{children}</div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export function CalendarLegend() {
  return (
    <div className="border-t p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Legenda</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <LegendItem label="Menstruação">
          <div className="h-full w-full rounded-full bg-primary" />
        </LegendItem>
        <LegendItem label="Período Fértil">
          <div className="h-full w-full rounded-full bg-fertile" />
        </LegendItem>
        <LegendItem label="Previsão">
          <div className="h-full w-full rounded-full bg-primary/20" />
        </LegendItem>
        <LegendItem label="Hoje">
          <div className="h-full w-full rounded-full ring-2 ring-primary" />
        </LegendItem>
        <LegendItem label="Ovulação">
            <div className="relative flex h-full w-full items-center justify-center">
                <div className="h-full w-full rounded-full bg-fertile" />
                <div className="absolute h-1.5 w-1.5 rounded-full bg-fertile-foreground/80" />
            </div>
        </LegendItem>
        <LegendItem label="Dia com registro">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
        </LegendItem>
      </div>
    </div>
  );
}
