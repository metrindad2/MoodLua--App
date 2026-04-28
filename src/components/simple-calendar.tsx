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
  isAfter,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DailyLog } from '@/lib/types';
import { Check } from 'lucide-react';
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

          const logForDay = dailyLogs?.find((log) =>
            isSameDay(startOfDay(new Date(log.date + 'T00:00:00')), date)
          );
          const hasLogData =
            logForDay &&
            (logForDay.mood ||
              (logForDay.symptoms && logForDay.symptoms.length > 0));

          const dayClasses = cn(
            'relative flex h-12 w-full items-center justify-center transition-colors'
          );

          const numberClasses = cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
            isHighlighted &&
              'bg-primary text-primary-foreground border-transparent ring-0',
            isFertile && !isHighlighted && 'bg-fertile text-fertile-foreground',
            isCurrentToday && !isHighlighted && 'ring-2 ring-primary',
            isInPrevision &&
              !isHighlighted &&
              'border border-dashed border-primary/80'
          );

          return (
            <div
              key={i}
              className={dayClasses}
              aria-label={format(date, 'PPP', { locale: ptBR })}
            >
              <span className={numberClasses}>{format(date, 'd')}</span>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                {isOvulation && !isHighlighted && (
                  <div className="h-1.5 w-1.5 rounded-full bg-fertile-foreground/80" />
                )}
                {hasLogData && !isHighlighted && (
                  <div className="h-1 w-1 rounded-full bg-secondary" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
