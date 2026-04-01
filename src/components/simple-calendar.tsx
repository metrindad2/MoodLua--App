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

interface SimpleCalendarProps {
  initialDate?: Date;
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
  highlightedDates?: Date[];
  previsionRange?: { from: Date; to: Date };
  fertileWindow?: { from: Date; to: Date };
  ovulationDate?: Date;
  disableFutureDates?: boolean;
  dailyLogs?: DailyLog[];
}

export function SimpleCalendar({
  initialDate = new Date(),
  selectedDates,
  onDateClick,
  highlightedDates,
  previsionRange,
  fertileWindow,
  ovulationDate,
  disableFutureDates,
  dailyLogs,
}: SimpleCalendarProps) {
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
  const isRegistrationMode = !!onDateClick;

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

  return (
    <div className="text-card-foreground">
      <h2
        className={cn(
          'font-semibold capitalize text-center mb-4',
          isRegistrationMode ? 'text-xl' : 'text-lg'
        )}
      >
        {format(monthStart, 'MMMM yyyy', { locale: ptBR })}
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
          const isDayInCurrentMonth = isSameMonth(date, monthStart);
          const isCurrentToday = isToday(date);

          // Modo de Registro: Lógica para seleção de dias.
          if (isRegistrationMode) {
            if (!isDayInCurrentMonth) {
              return <div key={i} className="h-12" />;
            }
            const isFuture =
              disableFutureDates &&
              isAfter(startOfDay(date), startOfDay(new Date()));
            const isSelected = selectedDates?.some((d) => isSameDay(d, date));

            return (
              <div
                key={i}
                className="flex flex-col items-center justify-start h-12 pt-1"
              >
                <button
                  onClick={() => onDateClick(date)}
                  disabled={isFuture}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-50',
                    'border border-input',
                     isSelected && 'bg-primary text-primary-foreground border-primary'
                  )}
                  aria-label={format(date, 'PPP', { locale: ptBR })}
                >
                  <span
                    className={cn(
                      isSelected ? 'text-primary-foreground' : 'text-foreground',
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
          }
          
          // Modo de Dashboard: Lógica para exibir informações.
          const isHighlighted = isDayHighlighted(date);
          const isInPrevision = isDayInPrevisionRange(date);
          const isFertile = isDayInFertileWindow(date);
          const isOvulation = ovulationDate && isSameDay(date, ovulationDate);
          
          const logForDay = dailyLogs?.find(log => isSameDay(startOfDay(new Date(log.date + 'T00:00:00')), date));
          const hasLogData = logForDay && (logForDay.mood || (logForDay.symptoms && logForDay.symptoms.length > 0));


          const dayClasses = cn(
            'relative flex h-10 w-full items-center justify-center rounded-full',
            // Ordem de prioridade visual:
            // 1. Fundo para período fértil (pode ser combinado com outros)
            isFertile && !isHighlighted && 'bg-fertile',
            // 2. Borda para previsão
            isInPrevision && !isHighlighted && 'border-2 border-dashed border-secondary',
            // 3. Destaque máximo para período registrado (sobrescreve outros)
            isHighlighted && 'bg-primary text-primary-foreground'
          );

          const numberClasses = cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm', // Círculo para o número
            !isDayInCurrentMonth && 'text-muted-foreground/50',
            // Destaque para o dia atual (círculo preenchido), se não for um dia de menstruação.
            isCurrentToday && !isHighlighted && 'bg-accent font-bold text-accent-foreground',
            // Garante que o texto do dia da menstruação seja da cor correta.
            isHighlighted && 'text-primary-foreground'
          );

          return (
            <div key={i} className={dayClasses} aria-label={format(date, 'PPP', { locale: ptBR })}>
              <span className={numberClasses}>
                {format(date, 'd')}
              </span>
              {/* Indicador de ovulação e logs */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                {isOvulation && !isHighlighted && (
                  <div className="h-1.5 w-1.5 rounded-full bg-fertile-foreground/80" />
                )}
                {hasLogData && !isHighlighted && (
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
