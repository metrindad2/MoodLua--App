'use client';

import { Calendar } from '@/components/ui/calendar';
import type { DailyLog } from '@/lib/types';
import type { CycleInfo } from '@/lib/cycle-utils';
import { subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CycleCalendarProps {
  cycleInfo: CycleInfo | null;
  dailyLogs: DailyLog[];
}

/**
 * Calendário do Ciclo.
 *
 * Este componente é responsável por renderizar o calendário e destacar os dias
 * importantes com base nas previsões e nos dados registrados pela usuária.
 *
 * Como funciona:
 * - Ele recebe `cycleInfo` (as previsões) e `dailyLogs` (os registros) como propriedades.
 * - Usa o recurso `modifiers` do componente `Calendar` (que vem do `react-day-picker`)
 *   para definir quais dias devem ter um estilo especial.
 * - Por exemplo, o modificador `fertile` verifica se uma data está dentro da janela fértil
 *   prevista.
 * - O `modifiersClassNames` associa cada modificador a uma classe CSS para aplicar a cor.
 *   As classes (ex: `bg-green-500/20`) usam Tailwind CSS para estilizar os dias.
 */
export default function CycleCalendar({ cycleInfo, dailyLogs }: CycleCalendarProps) {
  if (!cycleInfo) return null;

  // O objeto `modifiers` define as regras lógicas para colorir os dias.
  const modifiers = {
    fertile: {
      from: cycleInfo.fertileWindowStartDate,
      to: cycleInfo.fertileWindowEndDate,
    },
    ovulation: cycleInfo.ovulationDate,
    menstruation: {
      from: cycleInfo.menstruationStartDate,
      to: subDays(cycleInfo.menstruationEndDate, 1), // react-day-picker `to` is inclusive
    },
    // Adicione aqui outros modificadores se necessário (ex: dias com logs)
  };

  // `modifiersClassNames` associa os modificadores a classes de estilo.
  const modifiersClassNames = {
    fertile: 'bg-green-500/20 text-green-800',
    ovulation: 'bg-green-500/80 !text-white rounded-full',
    menstruation: 'bg-red-500/20 text-red-800',
    today: 'bg-secondary text-secondary-foreground rounded-full',
  };

  return (
    <Calendar
      mode="single"
      selected={startOfDay(new Date())}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      className="rounded-md border"
      locale={ptBR}
      weekStartsOn={0}
      showOutsideDays
    />
  );
}
