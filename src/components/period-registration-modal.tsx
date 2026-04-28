'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  isSameDay,
  startOfMonth,
  startOfDay,
  addMonths,
  isAfter,
  addDays,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  subMonths,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCycleData } from '@/context/cycle-data-context';
import { X, Save } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SimpleCalendar } from './simple-calendar';
import { CalendarProps, calendarCompare } from './simple-calendar-logic';

interface PeriodRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (days: Date[]) => void;
}

export function PeriodRegistrationModal({
  open,
  onOpenChange,
  onSave,
}: PeriodRegistrationModalProps) {
  const { dailyLogs } = useCycleData();
  const { toast } = useToast();

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const monthsToDisplay = React.useMemo(() => {
    const start = startOfMonth(subMonths(new Date(), 6));
    return Array.from({ length: 18 }).map((_, i) => addMonths(start, i));
  }, []);

  useEffect(() => {
    if (open) {
      const initialPeriodDays = dailyLogs
        .filter((log) => log.isPeriodDay)
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(initialPeriodDays);
    }
  }, [open, dailyLogs]);

  useEffect(() => {
    if (open) {
      const targetMonthKey = format(new Date(), 'yyyy-MM');
      const targetElement = monthRefs.current.get(targetMonthKey);
      setTimeout(() => {
        if (targetElement && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewport) {
            viewport.scrollTop =
              targetElement.offsetTop - viewport.clientHeight / 2;
          }
        }
      }, 150);
    }
  }, [open]);

  const handleDayClick = useCallback((day: Date) => {
    const dayStart = startOfDay(day);
    setSelectedDays((currentSelection) => {
      const isAlreadySelected = currentSelection.some((d) =>
        isSameDay(d, dayStart)
      );
      if (isAlreadySelected) {
        return currentSelection.filter((d) => !isSameDay(d, dayStart));
      } else {
        return [...currentSelection, dayStart].sort(
          (a, b) => a.getTime() - b.getTime()
        );
      }
    });
  }, []);

  const handleSave = () => {
    onSave(selectedDays);
    toast({
      title: 'Registros salvos!',
      description: 'Seu ciclo menstrual foi atualizado.',
    });
    onOpenChange(false);
  };

  const MemoizedCalendar = React.memo(
    ({ month }: { month: Date }) => {
      const monthKey = format(month, 'yyyy-MM');
      return (
        <div
          key={monthKey}
          ref={(el) => {
            if (el) monthRefs.current.set(monthKey, el);
            else monthRefs.current.delete(monthKey);
          }}
        >
          <RegistrationCalendar
            initialDate={month}
            selectedDates={selectedDays}
            onDateClick={handleDayClick}
          />
        </div>
      );
    },
    (prevProps, nextProps) => {
      const month = prevProps.month;
      const prevInMonth = selectedDays.filter((d) =>
        isSameDay(d, month)
      );
      const nextInMonth = selectedDays.filter((d) =>
        isSameDay(d, nextProps.month)
      );
      return prevInMonth.length === nextInMonth.length;
    }
  );
  MemoizedCalendar.displayName = 'MemoizedCalendar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-dvh max-h-dvh w-screen max-w-full flex flex-col p-0 gap-0 border-0 sm:rounded-none bg-background">
        <DialogHeader className="p-2 flex flex-row items-center border-b shrink-0">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
          <div className="flex-1 text-center">
            <DialogTitle className="text-lg font-semibold">
              Registrar Menstruação
            </DialogTitle>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </DialogHeader>

        <ScrollArea ref={scrollContainerRef} className="flex-1">
          <div className="p-4">
            <div className="space-y-6">
              {monthsToDisplay.map((month) => (
                <MemoizedCalendar key={format(month, 'yyyy-MM')} month={month} />
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-2 border-t shrink-0">
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const RegistrationCalendar = React.memo((props: CalendarProps) => {
  const {
    initialDate = new Date(),
    selectedDates,
    onDateClick,
  } = props;
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

  return (
    <div className="text-card-foreground">
      <h2 className="font-semibold capitalize text-center mb-4 text-lg">
        {format(monthStart, 'MMMM yyyy', { locale: ptBR })}
      </h2>

      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {weekdays.map((weekday, index) => (
          <div key={index} className="py-2 font-medium">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date, i) => {
          if (!isSameMonth(date, monthStart)) {
            return <div key={i} className="h-12" />;
          }
          const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
          const isSelected = selectedDates?.some((d) => isSameDay(d, date));

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-start h-12 pt-1"
            >
              <button
                onClick={() => onDateClick && onDateClick(date)}
                disabled={isFuture}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-30',
                   isSelected
                      ? 'border border-dashed border-primary/80'
                      : 'border border-border hover:bg-accent'
                )}
                aria-label={format(date, 'PPP', { locale: ptBR })}
              >
                <span className={cn(isSelected && 'font-bold text-primary')}>
                  {format(date, 'd')}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}, calendarCompare);
RegistrationCalendar.displayName = 'RegistrationCalendar';
