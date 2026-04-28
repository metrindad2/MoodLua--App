'use client';

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DailyLog } from '@/lib/types';
import { CalendarProps } from './simple-calendar-logic';

export function SimpleCalendar({
  initialDate = new Date(),
  selectedDates,
  onDateClick,
  highlightedDates,
  previsionRanges,
  fertileWindows,
  ovulationDates,
  dailyLogs,
}: CalendarProps) {
  const monthStart = startOfMonth(initialDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR, weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { locale: ptBR, weekStartsOn: 0 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const isDayInPrevisionRange = (day: Date) => {
    if (!previsionRanges) return false;
    const current = startOfDay(day);
    return previsionRanges.some(
      (range) =>
        current >= startOfDay(range.from) && current <= startOfDay(range.to)
    );
  };

  const isDayInFertileWindow = (day: Date) => {
    if (!fertileWindows) return false;
    const current = startOfDay(day);
    return fertileWindows.some(
      (window) =>
        current >= startOfDay(window.from) && current <= startOfDay(window.to)
    );
  };

  const isDayHighlighted = (day: Date) => {
    if (!highlightedDates) return false;
    return highlightedDates.some((d) => isSameDay(d, day));
  };

  const hasLog = (day: Date): boolean => {
    if (!dailyLogs) return false;
    const log = dailyLogs.find((log) =>
      isSameDay(startOfDay(new Date(log.date + 'T00:00:00')), day)
    );
    if (!log) return false;

    // A log is considered meaningful if it has specific data.
    return !!(
      log.mood ||
      (log.symptoms && log.symptoms.length > 0) ||
      (log.sexoLibido && log.sexoLibido.length > 0) ||
      (log.flowIntensity && log.flowIntensity !== 'nenhum')
    );
  };

  return (
    <div className="text-card-foreground">
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {weekdays.map((weekday, index) => (
          <div key={index} className="py-2 font-medium">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date, i) => {
          const isDayInCurrentMonth = isSameMonth(date, monthStart);
          if (!isDayInCurrentMonth) {
            return <div key={i} className="h-12"></div>;
          }

          const isCurrentToday = isToday(date);
          const isHighlighted = isDayHighlighted(date);
          const isInPrevision = isDayInPrevisionRange(date);
          const isFertile = isDayInFertileWindow(date);
          const isOvulation = ovulationDates?.some((d) => isSameDay(date, d));
          const dayHasLog = hasLog(date);

          const dayClasses = cn(
            'relative flex h-12 w-full items-center justify-center transition-colors'
          );

          const numberClasses = cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
            // Ordem de prioridade de estilos (mais específico primeiro)
            isHighlighted
              ? 'bg-primary text-primary-foreground' // Menstruação registrada
              : isFertile
              ? 'bg-fertile text-fertile-foreground' // Janela fértil
              : isInPrevision
              ? 'bg-primary/20' // Previsão de menstruação
              : 'bg-transparent', // Dia normal
            isCurrentToday && !isHighlighted && 'ring-2 ring-primary' // Anel para o dia de hoje
          );

          return (
            <div
              key={i}
              className={dayClasses}
              aria-label={format(date, 'PPP', { locale: ptBR })}
            >
              <span className={numberClasses}>{format(date, 'd')}</span>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                {isOvulation && isFertile && !isHighlighted && (
                  <div className="h-1.5 w-1.5 rounded-full bg-fertile-foreground/80" />
                )}
                {dayHasLog && !isHighlighted && !isFertile && (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
