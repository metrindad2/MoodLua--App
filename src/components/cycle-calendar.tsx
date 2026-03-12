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
 *   As classes usam Tailwind CSS para estilizar os dias.
 */
export default function CycleCalendar({ cycleInfo, dailyLogs }: CycleCalendarProps) {
  if (!cycleInfo) return null;

  // O objeto `modifiers` define as regras lógicas para colorir os dias.
  // A imagem de referência mostra "Previsão" que corresponderá à janela fértil.
  const modifiers = {
    // "Previsão" na imagem
    fertile: {
      from: cycleInfo.fertileWindowStartDate,
      to: cycleInfo.fertileWindowEndDate,
    },
    // "Período" na imagem
    menstruation: {
      from: cycleInfo.menstruationStartDate,
      to: subDays(cycleInfo.menstruationEndDate, 1), // react-day-picker `to` is inclusive
    },
    // O dia de hoje é destacado de forma especial
    today: startOfDay(new Date()),
  };

  // `modifiersClassNames` associa os modificadores a classes de estilo para corresponder à imagem.
  const modifiersClassNames = {
    fertile: 'bg-secondary text-secondary-foreground rounded-full',
    menstruation: 'bg-primary text-primary-foreground rounded-full',
    // Estilo para hoje: um círculo com borda, sem preenchimento de fundo.
    today: 'bg-transparent text-foreground border border-primary rounded-full',
  };

  return (
    <Calendar
      mode="single"
      // Não queremos um dia "selecionado" com fundo sólido, o modificador `today` cuida do estilo.
      selected={undefined} 
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      className="rounded-md border"
      locale={ptBR}
      // A semana começa no Domingo, como na imagem de referência.
      weekStartsOn={0}
      showOutsideDays
    />
  );
}
