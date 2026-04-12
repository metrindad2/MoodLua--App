
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  differenceInDays,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCycleData } from '@/context/cycle-data-context';
import { X, Save, Check } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PeriodRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previsionRange?: {
    from: Date;
    to: Date;
  };
}

export function PeriodRegistrationModal({
  open,
  onOpenChange,
}: PeriodRegistrationModalProps) {
  const { dailyLogs, savePeriodDays, userProfile } = useCycleData();
  const { toast } = useToast();

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Generate a list of months from 2026 for a long period to feel "infinite".
  const monthsToDisplay = useMemo(() => {
    const startDate = startOfMonth(new Date('2026-01-01T00:00:00'));
    // A large number of months to feel "infinite"
    return Array.from({ length: 200 * 12 }).map((_, i) => addMonths(startDate, i));
  }, []);

  // Initialize selected days when modal opens.
  useEffect(() => {
    if (open) {
      const initialPeriodDays = dailyLogs
        .filter((log) => log.isPeriodDay)
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(initialPeriodDays);
    }
  }, [open, dailyLogs]);

  // Scroll to January 2026 effect.
  useEffect(() => {
    if (open) {
      const targetMonthKey = '2026-01'; // Directly set the key for Jan 2026
      const targetElement = monthRefs.current.get(targetMonthKey);
      
      setTimeout(() => {
        if (targetElement && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
            );
          if (viewport) {
            // Scroll to the top of the target element.
            viewport.scrollTop = targetElement.offsetTop;
          }
        }
      }, 150); // A short delay ensures elements are rendered.
    }
  }, [open]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const flowDuration = userProfile?.flowDurationDays ?? 5;

    setSelectedDays((currentSelection) => {
      const isAlreadySelected = currentSelection.some((d) =>
        isSameDay(d, dayStart)
      );

      // If the day is already selected, remove it.
      if (isAlreadySelected) {
        return currentSelection.filter((d) => !isSameDay(d, dayStart));
      }

      // If the day is adjacent to an existing block, just add the single day.
      const isAdjacent = currentSelection.some(
        (selectedDay) => Math.abs(differenceInDays(selectedDay, dayStart)) === 1
      );

      if (isAdjacent) {
        const newSelection = [...currentSelection, dayStart];
        return newSelection.sort((a, b) => a.getTime() - b.getTime());
      }
      
      // If it's a new, non-adjacent day, suggest a new block.
      // This new block is ADDED to the existing selection, not replacing it.
      const newBlock = Array.from({ length: flowDuration }, (_, i) => addDays(dayStart, i))
        .filter(d => !isAfter(d, new Date())); // Don't select future dates

      const combined = [...currentSelection];
      newBlock.forEach(dayInBlock => {
        if (!combined.some(d => isSameDay(d, dayInBlock))) {
          combined.push(dayInBlock);
        }
      });
      
      return combined.sort((a, b) => a.getTime() - b.getTime());
    });
  };


  const handleSave = () => {
    savePeriodDays(selectedDays);
    toast({
      title: 'Registros salvos!',
      description: 'Seu ciclo menstrual foi atualizado.',
    });
    onOpenChange(false);
  };

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
              {monthsToDisplay.map((month) => {
                const monthKey = month.toISOString().slice(0, 7);
                return (
                  <div
                    key={monthKey}
                    ref={(el) => {
                      if (el) monthRefs.current.set(monthKey, el);
                      else monthRefs.current.delete(monthKey);
                    }}
                  >
                    <SimpleCalendar
                      initialDate={month}
                      selectedDates={selectedDays}
                      onDateClick={handleDayClick}
                    />
                  </div>
                );
              })}
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

// Overwrite the original SimpleCalendar to use the new design for this modal only
const SimpleCalendar = ({
  initialDate = new Date(),
  selectedDates,
  onDateClick,
}: {
  initialDate: Date;
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
}) => {
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
            <div key={i} className="flex flex-col items-center justify-start h-12 pt-1">
              <button
                onClick={() => onDateClick && onDateClick(date)}
                disabled={isFuture}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-30',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-accent'
                )}
                aria-label={format(date, 'PPP', { locale: ptBR })}
              >
                {isSelected ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  format(date, 'd')
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
