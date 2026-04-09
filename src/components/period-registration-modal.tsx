'use client';

import { useState, useEffect, useRef } from 'react';
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
  isSameMonth,
  addDays,
  differenceInDays,
  isAfter,
  endOfMonth,
} from 'date-fns';
import { useCycleData } from '@/context/cycle-data-context';
import { SimpleCalendar } from './simple-calendar';
import { X, Save } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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
  previsionRange,
}: PeriodRegistrationModalProps) {
  const { dailyLogs, savePeriodDays, userProfile, loading } = useCycleData();
  const { toast } = useToast();

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(
    startOfMonth(new Date())
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Generate a list of months from 2026 for 200 years.
  const monthsToDisplay = useMemo(() => {
    const startDate = startOfMonth(new Date('2026-01-01T00:00:00'));
    // A large number of months to feel "infinite"
    return Array.from({ length: 200 * 12 }).map((_, i) =>
      addMonths(startDate, i)
    );
  }, []);

  // The month for which the calendar should scroll to when opened.
  const targetScrollMonth = startOfMonth(new Date('2026-01-01T00:00:00'));

  // Initialize selected days when modal opens.
  useEffect(() => {
    if (open) {
      const initialPeriodDays = dailyLogs
        .filter((log) => log.isPeriodDay)
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(initialPeriodDays);
    }
  }, [open, dailyLogs]);

  // Scroll to target month effect.
  useEffect(() => {
    if (open) {
      setCurrentDisplayMonth(startOfMonth(new Date('2026-01-01T00:00:00')));
      const targetMonthKey = targetScrollMonth.toISOString().slice(0, 7);
      const targetElement = monthRefs.current.get(targetMonthKey);

      setTimeout(() => {
        if (targetElement && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewport) {
            viewport.scrollTop = targetElement.offsetTop;
          }
        }
      }, 100); // A short delay ensures elements are rendered.
    }
  }, [open, targetScrollMonth]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const flowDuration = userProfile?.flowDurationDays ?? 5;

    setSelectedDays((prevSelectedDays) => {
      const newSelection = [...prevSelectedDays];
      const isAlreadySelected = newSelection.some((d) => isSameDay(d, dayStart));

      // Case 1: If the day is already selected, remove it.
      if (isAlreadySelected) {
        return newSelection.filter((d) => !isSameDay(d, dayStart));
      }
      
      // Case 2: The day is not selected.
      // Check if it's adjacent to any existing selection to decide if it's a manual adjustment or a new block.
      const isAdjacent = newSelection.some(d => Math.abs(differenceInDays(d, dayStart)) <= 1);

      if (isAdjacent) {
        // Manual adjustment: Add a single day because it's next to an existing one.
        newSelection.push(dayStart);
      } else {
        // New block suggestion: The click is "far" from other selections.
        // Add a new block of days based on flow duration.
        for (let i = 0; i < flowDuration; i++) {
          const futureDay = addDays(dayStart, i);
          // Ensure we don't add future dates or duplicates
          if (!isAfter(futureDay, new Date()) && !newSelection.some(d => isSameDay(d, futureDay))) {
            newSelection.push(futureDay);
          }
        }
      }
      
      // Always return a sorted array.
      return newSelection.sort((a, b) => a.getTime() - b.getTime());
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
                      previsionRange={previsionRange}
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
