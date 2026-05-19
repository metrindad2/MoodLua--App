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
  isSameMonth,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCycleData } from '@/context/cycle-data-context';
import { X, Save } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
  const { dailyLogs, userProfile } = useCycleData();
  const { toast } = useToast();

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Gera uma lista de 6000 meses (500 anos) começando de Janeiro de 2024
  // Isso cobre até o ano 2524, garantindo navegação de altíssimo longo prazo.
  const monthsToDisplay = React.useMemo(() => {
    const start = startOfMonth(new Date(2024, 0, 1));
    return Array.from({ length: 6000 }).map((_, i) => addMonths(start, i));
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
    const flowDuration = userProfile?.flowDurationDays || 5;
    const today = startOfDay(new Date());

    setSelectedDays((currentSelection) => {
      const isAlreadySelected = currentSelection.some((d) =>
        isSameDay(d, dayStart)
      );

      if (isAlreadySelected) {
        return currentSelection.filter((d) => !isSameDay(d, dayStart));
      } else {
        const newBlock: Date[] = [];
        for (let i = 0; i < flowDuration; i++) {
          const dateInBlock = addDays(dayStart, i);
          // Permite registrar no futuro se necessário para ajustes de ciclo.
          if (!isAfter(dateInBlock, today)) {
             newBlock.push(dateInBlock);
          }
        }

        const selectionTimeSet = new Set(currentSelection.map(d => d.getTime()));
        newBlock.forEach(d => selectionTimeSet.add(d.getTime()));

        const newSelection = Array.from(selectionTimeSet).map(time => new Date(time));
        
        return newSelection.sort((a, b) => a.getTime() - b.getTime());
      }
    });
  }, [userProfile?.flowDurationDays]);

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
        isSameMonth(d, month)
      );
      const nextInMonth = selectedDays.filter((d) =>
        isSameMonth(d, nextProps.month)
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
          <div className="w-10" />
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
        
        <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
            <h3 className="text-sm font-semibold mb-2 text-foreground">Legenda</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary" />
                    <span>Menstruação</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full ring-2 ring-primary" />
                    <span>Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border border-border" />
                    <span>Dia selecionável</span>
                </div>
            </div>
        </div>

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
          const dayIsToday = isToday(date);

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
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-accent',
                   dayIsToday && !isSelected && 'ring-2 ring-primary'
                )}
                aria-label={format(date, 'PPP', { locale: ptBR })}
              >
                <span className={cn(isSelected ? 'font-bold text-primary-foreground' : dayIsToday ? 'font-bold' : '')}>
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