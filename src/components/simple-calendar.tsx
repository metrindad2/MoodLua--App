'use client';

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  isAfter,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface SimpleCalendarProps {
  // A data inicial para exibir
  initialDate?: Date;
  // Opcional: um dia que deve ser marcado como 'selecionado'
  selectedDate?: Date | null;
  // Opcional: um array de dias que devem ser marcados como 'selecionados'
  selectedDates?: Date[];
  // Opcional: um callback para quando um dia é clicado
  onDateClick?: (date: Date) => void;
  // Opcional: um intervalo de dias para destacar (ex: período menstrual)
  highlightedRange?: {
    from: Date;
    to: Date;
  };
  // Opcional: um intervalo de dias para previsão
  previsionRange?: {
    from: Date;
    to: Date;
  };
  // Opcional: desabilita a seleção de datas futuras
  disableFutureDates?: boolean;
}

/**
 * Um componente de calendário mensal simples, construído do zero para ser
 * claro e fácil de modificar. Ele usa CSS Grid para o layout.
 */
export function SimpleCalendar({
  initialDate = new Date(),
  selectedDate,
  selectedDates,
  onDateClick,
  highlightedRange,
  previsionRange,
  disableFutureDates,
}: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialDate));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  // Garante que a semana comece no domingo (weekStartsOn: 0)
  const startDate = startOfWeek(monthStart, { locale: ptBR, weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { locale: ptBR, weekStartsOn: 0 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const isDayInRange = (day: Date) => {
    if (!highlightedRange) return false;
    const from = startOfDay(highlightedRange.from);
    const to = startOfDay(highlightedRange.to);
    const current = startOfDay(day);
    return current >= from && current <= to;
  };

  const isDayInPrevisionRange = (day: Date) => {
    if (!previsionRange) return false;
    const from = startOfDay(previsionRange.from);
    const to = startOfDay(previsionRange.to);
    const current = startOfDay(day);
    return current >= from && current <= to;
  };

  return (
    <div className="rounded-lg bg-card text-card-foreground">
      {/* Cabeçalho com o mês/ano e botões de navegação */}
      <div className="flex items-center justify-between mb-4 px-2">
        <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Mês anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold capitalize text-center">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Próximo mês">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Grid para os dias da semana */}
      <div className="grid grid-cols-7 text-center text-sm text-muted-foreground">
        {weekdays.map((weekday) => (
          <div key={weekday} className="py-2 font-medium">
            {weekday}
          </div>
        ))}
      </div>

      {/* Grid para os dias do mês */}
      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date, i) => {
          const isFuture = disableFutureDates && isAfter(startOfDay(date), startOfDay(new Date()));
          const isSelectedByDate = selectedDate && isSameDay(date, selectedDate);
          const isSelectedByDates = selectedDates?.some(d => isSameDay(d, date));

          return (
            <button
              key={i}
              onClick={() => onDateClick?.(date)}
              disabled={!isSameMonth(date, currentMonth) || isFuture}
              className={cn(
                'relative flex h-10 w-full items-center justify-center transition-colors rounded-full',
                // Desabilita dias de outros meses
                !isSameMonth(date, currentMonth) && 'text-muted-foreground/50 cursor-default',
                isFuture && 'text-muted-foreground/50 cursor-not-allowed',
                isSameMonth(date, currentMonth) && !isFuture && 'hover:bg-accent/20',
                // Destaca o dia de hoje com um anel
                isToday(date) && 'ring-1 ring-primary',
                // Destaca o intervalo (período menstrual)
                isDayInRange(date) && 'bg-primary text-primary-foreground',
                isDayInPrevisionRange(date) && 'bg-primary/30 text-primary-foreground',
                // Destaca o dia/dias selecionado(s)
                (isSelectedByDate || isSelectedByDates) && 'bg-accent text-accent-foreground'
              )}
              aria-label={format(date, 'PPP', { locale: ptBR })}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
