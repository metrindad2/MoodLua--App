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
  isSameMonth,
  startOfYear,
  addYears,
  differenceInMonths,
  min,
} from 'date-fns';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { SimpleCalendar } from './simple-calendar';
import { X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

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
  const { userProfile, dailyLogs, addOrUpdateDailyLog, startNewCycle } = useCycleData();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const { toast } = useToast();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetMonthRef = useRef<HTMLDivElement>(null);

  // The logic for generating the months to display is now memoized for performance.
  const monthsToDisplay = useMemo(() => {
    if (!userProfile?.joinDate) {
      return [];
    }

    // Find the earliest date from logs to allow backward navigation.
    const logDates = dailyLogs.map((log) => new Date(log.date + 'T00:00:00'));

    // The calendar should start from the beginning of the year of the user's join date,
    // or the year of their earliest log, whichever is first.
    const earliestPossibleDate = min([
      new Date(userProfile.joinDate + 'T00:00:00'),
      ...logDates,
    ]);
    const calendarStartDate = startOfYear(earliestPossibleDate);

    // The calendar extends 10 years into the future from today.
    const calendarEndDate = startOfMonth(addYears(new Date(), 10));

    const numMonths = differenceInMonths(calendarEndDate, calendarStartDate) + 1;
    if (numMonths <= 0) return [];

    return Array.from({ length: numMonths }).map((_, i) =>
      addMonths(calendarStartDate, i)
    );
  }, [userProfile?.joinDate, dailyLogs]);

  // The target month for scrolling is the current month.
  const currentDisplayMonth = startOfMonth(new Date());

  useEffect(() => {
    if (open) {
      const periodDays = dailyLogs
        .filter((log) => log.isPeriodDay)
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(periodDays);

      // Scroll to the current month when the dialog opens.
      setTimeout(() => {
        if (targetMonthRef.current && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewport) {
            const offsetTop = targetMonthRef.current.offsetTop;
            const containerHeight = viewport.clientHeight;
            viewport.scrollTop =
              offsetTop -
              containerHeight / 2 +
              targetMonthRef.current.clientHeight / 2;
          }
        }
      }, 100);
    }
  }, [open, dailyLogs, monthsToDisplay]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const isAlreadySelected = selectedDays.some((d) => isSameDay(d, dayStart));

    let newSelectedDays;

    if (isAlreadySelected) {
      // If the day is already selected, remove it.
      newSelectedDays = selectedDays.filter((d) => !isSameDay(d, dayStart));
    } else {
      // If the day is not selected, add it.
      newSelectedDays = [...selectedDays, dayStart];
    }

    // Sort the selected days.
    setSelectedDays(newSelectedDays.sort((a, b) => a.getTime() - b.getTime()));
  };

  const handleSave = () => {
    if (!userProfile) return;

    const originalPeriodDays = dailyLogs
      .filter((log) => log.isPeriodDay)
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));

    // Find the earliest day in the new selection to determine the cycle start.
    const newFirstDay = selectedDays.length > 0 ? min(selectedDays) : null;
    const currentLmpDate = startOfDay(new Date(userProfile.lastMenstruationDate + 'T00:00:00'));

    // If the new first day is different from the current cycle start, start a new cycle.
    if (newFirstDay && !isSameDay(newFirstDay, currentLmpDate)) {
        startNewCycle(newFirstDay);
    }
    
    // Union of old and new days to check for changes.
    const allPotentiallyChangedDays = [...new Set([...originalPeriodDays, ...selectedDays].map(d => d.getTime()))].map(t => new Date(t));

    for (const day of allPotentiallyChangedDays) {
      const isNowSelected = selectedDays.some((d) => isSameDay(d, day));
      const wasOriginallySelected = originalPeriodDays.some((d) =>
        isSameDay(d, day)
      );

      // Update only if the state changed.
      if (isNowSelected !== wasOriginallySelected) {
        addOrUpdateDailyLog({
          date: day,
          isPeriodDay: isNowSelected,
        });
      }
    }

    toast({
      title: 'Menstruação registrada!',
      description: `Seu calendário e ciclo foram atualizados.`,
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
          <div className="h-10 w-10" /> {/* Spacer */}
        </DialogHeader>

        <ScrollArea ref={scrollContainerRef} className="flex-1">
          <div className="space-y-6 p-4">
            {monthsToDisplay.map((month) => {
              const isTargetMonth = isSameMonth(month, currentDisplayMonth);
              return (
                 <div
                  key={month.toISOString()}
                  ref={isTargetMonth ? targetMonthRef : null}
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
        </ScrollArea>

        <DialogFooter className="p-4 border-t flex-row justify-between bg-background shrink-0">
          <DialogClose asChild>
            <Button variant="link" className="text-base text-primary">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSave} className="text-base font-bold">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
