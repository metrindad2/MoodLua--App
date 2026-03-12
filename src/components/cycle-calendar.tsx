'use client';

import { Calendar } from '@/components/ui/calendar';
import type { DailyLog } from '@/lib/types';
import type { CycleInfo } from '@/lib/cycle-utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CycleCalendarProps {
  cycleInfo: CycleInfo | null;
  dailyLogs: DailyLog[];
}

/**
 * Calendário do Ciclo.
 *
 * Este componente renderiza o calendário e destaca os dias do período menstrual
 * usando o estilo padrão do aplicativo.
 */
export default function CycleCalendar({ cycleInfo, dailyLogs }: CycleCalendarProps) {
  if (!cycleInfo) return null;

  // Define os dias da menstruação para serem estilizados como "selecionados".
  const modifiers = {
    selected: {
      from: cycleInfo.menstruationStartDate,
      to: subDays(cycleInfo.menstruationEndDate, 1), // react-day-picker `to` is inclusive
    },
  };

  return (
    <Calendar
      mode="single"
      selected={undefined} // Desativa a seleção interativa
      defaultMonth={cycleInfo.menstruationStartDate}
      modifiers={modifiers}
      // A classe para 'selected' já é definida globalmente em ui/calendar.tsx
      // então não precisamos de modifiersClassNames aqui.
      className="rounded-md border bg-card"
      locale={ptBR}
      weekStartsOn={0} // Força o início da semana no Domingo
      showOutsideDays
    />
  );
}
