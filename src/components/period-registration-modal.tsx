'use client';

import { useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  endOfMonth,
} from 'date-fns';
import { useCycleData } from '@/context/cycle-data-context';
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
  const { userProfile, dailyLogs, savePeriodDays } = useCycleData();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetMonthRef = useRef<HTMLDivElement>(null);

  const monthsToDisplay = useMemo(() => {
    if (!userProfile?.joinDate) return [];

    const startDate = startOfMonth(
      new Date(userProfile.joinDate + 'T00:00:00')
    );
    const endDate = addMonths(new Date(), 120); // 10 years into the future

    const numMonths = differenceInDays(endOfMonth(endDate), startDate) / 28;
    return Array.from({ length: numMonths }).map((_, i) =>
      addMonths(startDate, i)
    );
  }, [userProfile?.joinDate]);

  const currentDisplayMonth = startOfMonth(new Date());

  useEffect(() => {
    if (open && monthsToDisplay.length > 0) {
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
  }, [open, monthsToDisplay]);

  const periodDays = useMemo(() => {
    return dailyLogs
      .filter((log) => log.isPeriodDay)
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
  }, [dailyLogs]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const isAlreadySelected = periodDays.some((d) => isSameDay(d, dayStart));

    let newSelectedDays;

    // Check if the clicked day is adjacent to any already selected day
    const isAdjacent = periodDays.some(
      (d) => Math.abs(differenceInDays(dayStart, d)) === 1
    );

    if (isAlreadySelected) {
      // If the day is already selected, remove it.
      newSelectedDays = periodDays.filter((d) => !isSameDay(d, dayStart));
    } else if (isAdjacent) {
      // If it's adjacent, just add this single day to the selection.
      newSelectedDays = [...periodDays, dayStart];
    } else {
      // If it's not adjacent and not selected, start a new period block.
      const flowDuration = userProfile?.flowDurationDays || 5;
      newSelectedDays = Array.from({ length: flowDuration }).map((_, i) =>
        addDays(dayStart, i)
      );
    }
    
    // Chama a função do contexto para salvar tudo automaticamente.
    savePeriodDays(newSelectedDays);
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
          <div className="h-10 w-10" /> {/* Espaçador */}
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
                    selectedDates={periodDays}
                    onDateClick={handleDayClick}
                    previsionRange={previsionRange}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
