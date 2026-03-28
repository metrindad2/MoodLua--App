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
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface SimpleCalendarProps {
  initialDate?: Date;
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
  highlightedRange?: {
    from: Date;
    to: Date;
  };
  previsionRange?: {
    from: Date;
    to: Date;
  };
  disableFutureDates?: boolean;
}

export function SimpleCalendar({
  initialDate = new Date(),
  selectedDates,
  onDateClick,
  highlightedRange,
  previsionRange,
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

  const isDayHighlighted = (day: Date) => {
    if (!highlightedRange) return false;
    const from = startOfDay(highlightedRange.from);
    const to = startOfDay(highlightedRange.to);
    const current = startOfDay(day);
    return current >= from && current <= to;
  };

  const goToNextMonth = () => setDisplayMonth(addMonths(displayMonth, 1));
  const goToPreviousMonth = () => setDisplayMonth(subMonths(displayMonth, 1));

  // A modal de registro não usa o `highlightedRange`, apenas o calendário do dashboard.
  // Se o onDateClick for fornecido, estamos no modo de seleção (modal).
  if (onDateClick) {
    return (
      <div className="text-card-foreground">
        <h2 className="text-xl font-semibold capitalize text-center mb-4">
          {format(currentMonth, 'MMMM', { locale: ptBR })}
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
              disableFutureDates && isAfter(startOfDay(date), startOfDay(new Date()));
            const isSelected = selectedDates?.some((d) => isSameDay(d, date));
            const isInPrevision = isDayInPrevisionRange(date);
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
                    // Dotted for prevision
                    isInPrevision &&
                      !isSelected &&
                      'border-dashed border-primary',
                    // Selected style (filled with checkmark)
                    isSelected &&
                      'bg-primary text-primary-foreground border-primary'
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
                  {isSelected && <Check className="h-4 w-4" />}
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
          return (
            <div
              key={i}
              className={cn(
                'relative flex h-10 w-full items-center justify-center rounded-full',
                !isSameMonth(date, currentMonth) && 'text-muted-foreground/50',
                isToday(date) && 'ring-1 ring-primary',
                isDayHighlighted(date) && 'bg-primary text-primary-foreground',
                isDayInPrevisionRange(date) &&
                  'bg-primary/30 text-primary-foreground'
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
