'use client';

import { useState } from 'react';
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
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface SimpleCalendarProps {
  initialDate?: Date;
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
  highlightedDates?: Date[];
  previsionRange?: {
    from: Date;
    to: Date;
  };
  fertileWindow?: {
    from: Date;
    to: Date;
  };
  disableFutureDates?: boolean;
}

export function SimpleCalendar({
  initialDate = new Date(),
  selectedDates,
  onDateClick,
  highlightedDates,
  previsionRange,
  fertileWindow,
  disableFutureDates,
}: SimpleCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(initialDate));

  const currentMonth = onDateClick ? startOfMonth(initialDate) : displayMonth;

  const monthStart = startOfMonth(currentMonth);
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
    if (!previsionRange) return false;
    const from = startOfDay(previsionRange.from);
    const to = startOfDay(previsionRange.to);
    const current = startOfDay(day);
    return current >= from && current <= to;
  };

  const isDayInFertileWindow = (day: Date) => {
    if (!fertileWindow) return false;
    const from = startOfDay(fertileWindow.from);
    const to = startOfDay(fertileWindow.to);
    const current = startOfDay(day);
    return current >= from && current <= to;
  };

  const isDayHighlighted = (day: Date) => {
    if (!highlightedDates) return false;
    return highlightedDates.some((d) => isSameDay(d, day));
  };

  const goToNextMonth = () => setDisplayMonth(addMonths(displayMonth, 1));
  const goToPreviousMonth = () => setDisplayMonth(subMonths(displayMonth, 1));

  // A modal de registro não usa o `highlightedRange`, apenas o calendário do dashboard.
  // Se o onDateClick for fornecido, estamos no modo de seleção (modal).
  if (onDateClick) {
    return (
      <div className="text-card-foreground">
        <h2 className="text-xl font-semibold capitalize text-center mb-4">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <div className="grid grid-cols-7 text-center text-sm text-muted-foreground">
          {weekdays.map((weekday, index) => (
            <div key={index} className="py-2 font-medium">
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center text-sm">
          {days.map((date, i) => {
            const isDayInCurrentMonth = isSameMonth(date, currentMonth);

            if (!isDayInCurrentMonth) {
              return <div key={i} className="h-12" />;
            }

            const isFuture =
              disableFutureDates &&
              isAfter(startOfDay(date), startOfDay(new Date()));
            const isSelected = selectedDates?.some((d) => isSameDay(d, date));
            const isCurrentToday = isToday(date);

            return (
              <div
                key={i}
                className="flex flex-col items-center justify-start h-12 pt-1"
              >
                <button
                  onClick={() => onDateClick?.(date)}
                  disabled={isFuture}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-50',
                    // Default empty circle
                    'border border-muted-foreground',
                    // Selected style (filled)
                    isSelected && 'bg-primary text-primary-foreground border-primary'
                  )}
                  aria-label={format(date, 'PPP', { locale: ptBR })}
                >
                  <span
                    className={cn(
                      isCurrentToday && !isSelected && 'text-primary font-bold'
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                </button>
                {isCurrentToday && (
                  <span className="text-[9px] font-bold text-primary mt-1 select-none">
                    HOJE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Calendário do Dashboard ---
  return (
    <div className="rounded-lg bg-card text-card-foreground">
      <div className="flex items-center justify-between mb-4 px-2">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold capitalize text-center">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm text-muted-foreground">
        {weekdays.map((weekday, i) => (
          <div key={i} className="py-2 font-medium">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date, i) => {
          const isHighlighted = isDayHighlighted(date);
          const isInPrevision = isDayInPrevisionRange(date);
          const isFertile = isDayInFertileWindow(date);

          return (
            <div
              key={i}
              className={cn(
                'relative flex h-10 w-full items-center justify-center rounded-full',
                !isSameMonth(date, currentMonth) && 'text-muted-foreground/50',
                isToday(date) &&
                  !isHighlighted &&
                  'ring-2 ring-primary',
                // Style precedence: 1. Period, 2. Fertile, 3. Prevision
                isFertile && !isHighlighted && !isHighlighted && 'bg-fertile', // Fertile background
                // This is the important change from previous fix
                isHighlighted && 'bg-primary text-primary-foreground', // Menstruation (overrides fertile bg)
                // borders on top
                isInPrevision &&
                  !isHighlighted &&
                  'border-2 border-dashed border-secondary' // Prevision
              )}
              aria-label={format(date, 'PPP', { locale: ptBR })}
            >
              {format(date, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
