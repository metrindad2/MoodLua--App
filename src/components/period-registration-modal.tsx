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

  // Generate a list of months from user's join date for 10 years.
  const monthsToDisplay = useMemo(() => {
    if (!userProfile?.joinDate) return [];
    // Start calendar from the beginning of the month the user joined
    const startDate = startOfMonth(new Date(userProfile.joinDate + 'T00:00:00'));
    // Generate months for 10 years into the future
    return Array.from({ length: 12 * 10 }).map((_, i) => addMonths(startDate, i));
  }, [userProfile?.joinDate]);


  // Initialize selected days when modal opens.
  useEffect(() => {
    if (open) {
      const initialPeriodDays = dailyLogs
        .filter((log) => log.isPeriodDay)
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(initialPeriodDays);
    }
  }, [open, dailyLogs]);

  // Scroll to current month effect.
  useEffect(() => {
    if (open) {
      const targetMonthKey = startOfMonth(new Date()).toISOString().slice(0, 7);
      const targetElement = monthRefs.current.get(targetMonthKey);
      
      setTimeout(() => {
        if (targetElement && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
            );
          if (viewport) {
            viewport.scrollTop = targetElement.offsetTop - (targetElement.clientHeight / 2);
          }
        }
      }, 150); // A short delay ensures elements are rendered.
    }
  }, [open]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const flowDuration = userProfile?.flowDurationDays ?? 5; // Get user's setting

    setSelectedDays((currentSelection) => {
        const isAlreadySelected = currentSelection.some((d) => isSameDay(d, dayStart));

        // Case 1: Day is already selected. User wants to remove it (manual adjustment).
        if (isAlreadySelected) {
            return currentSelection.filter((d) => !isSameDay(d, dayStart));
        }

        // Case 2: Day is not selected. Check for adjacency to extend a block.
        const isAdjacent = currentSelection.some(
            (selectedDay) => Math.abs(differenceInDays(selectedDay, dayStart)) === 1
        );

        if (isAdjacent) {
            // It's a manual extension. Just add the single day.
            const newSelection = [...currentSelection, dayStart];
            return newSelection.sort((a, b) => a.getTime() - b.getTime());
        }

        // Case 3: Not selected and not adjacent. This is a new period block suggestion.
        const newBlock = [];
        for (let i = 0; i < flowDuration; i++) {
            const dayInBlock = addDays(dayStart, i);
            // Don't add dates in the future
            if (!isAfter(dayInBlock, new Date())) {
                newBlock.push(dayInBlock);
            }
        }
        
        // Add the new block to the existing selection, avoiding duplicates.
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
