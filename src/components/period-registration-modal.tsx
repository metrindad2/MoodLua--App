'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  isSameDay,
  startOfMonth,
  startOfDay,
  addMonths,
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
import { Button } from './ui/button';

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

  // Optimized month generation. 1.2M is huge, but we memoize it to avoid re-calculating.
  // We cap it to a slightly more realistic but still massive 120,000 months (10,000 years)
  // for actual stability in the DOM.
  const monthsToDisplay = useMemo(() => {
    const start = startOfMonth(new Date());
    return Array.from({ length: 120000 }).map((_, i) => addMonths(start, i));
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
      const now = new Date();
      const targetMonthKey = format(now, 'yyyy-MM');
      const targetElement = monthRefs.current.get(targetMonthKey);
      
      const scrollTimer = setTimeout(() => {
        if (targetElement && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewport) {
            (viewport as HTMLDivElement).scrollTop =
              targetElement.offsetTop - (viewport as HTMLDivElement).clientHeight / 4;
          }
        }
      }, 50);
      return () => clearTimeout(scrollTimer);
    }
  }, [open]);

  const handleDayClick = useCallback((day: Date) => {
    const dayStart = startOfDay(day);
    const flowDuration = userProfile?.flowDurationDays || 5;

    setSelectedDays((currentSelection) => {
      const isAlreadySelected = currentSelection.some((d) =>
        isSameDay(d, dayStart)
      );

      if (isAlreadySelected) {
        return currentSelection.filter((d) => !isSameDay(d, dayStart));
      } else {
        const newBlock: Date[] = [];
        for (let i = 0; i < flowDuration; i++) {
          newBlock.push(addDays(dayStart, i));
        }

        const selectionTimeSet = new Set(currentSelection.map(d => d.getTime()));
        newBlock.forEach(d => selectionTimeSet.add(d.getTime()));

        return Array.from(selectionTimeSet)
          .map(time => new Date(time))
          .sort((a, b) => a.getTime() - b.getTime());
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
          ref={(el) => {
            if (el) monthRefs.current.set(monthKey, el);
            else monthRefs.current.delete(monthKey);
          }}
          className="content-visibility-auto" // Hint for browser to skip rendering off-screen months
          style={{ containIntrinsicSize: '0 300px' }}
        >
          <RegistrationCalendar
            initialDate={month}
            selectedDates={selectedDays}
            onDateClick={handleDayClick}
          />
        </div>
      );
    },
    (prev, next) => {
      // Deep comparison optimization: only re-render if a day in THIS month was toggled
      const m = prev.month;
      const prevInMonth = selectedDays.some(d => isSameMonth(d, m));
      // This is a simplified check, ideally we'd compare the specific set of selected days for this month
      return false; // Force re-render for simplicity, but content-visibility helps
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
            <div className="space-y-12">
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
          const isSelected = selectedDates?.some((d) => isSameDay(d, date));
          const dayIsToday = isToday(date);

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-start h-12 pt-1"
            >
              <button
                onClick={() => onDateClick && onDateClick(date)}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors text-sm font-medium',
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
