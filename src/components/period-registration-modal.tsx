'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  const { dailyLogs, savePeriodDays, userProfile } = useCycleData();
  const { toast } = useToast();

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetMonthRef = useRef<HTMLDivElement>(null);

  const monthsToDisplay = useMemo(() => {
    // Calendário começa em Janeiro de 2026 e dura 100 anos (1200 meses) para um efeito "infinito".
    const startDate = startOfMonth(new Date('2026-01-01T00:00:00'));
    const numMonths = 1200;
    return Array.from({ length: numMonths }).map((_, i) =>
      addMonths(startDate, i)
    );
  }, []);

  // O mês para o qual o calendário deve rolar ao abrir.
  const targetScrollMonth = useMemo(
    () => startOfMonth(new Date('2026-01-01T00:00:00')),
    []
  );

  // Initialize selected days when modal opens
  useEffect(() => {
    if (open) {
      const initialPeriodDays = dailyLogs
        .filter((log) => log.isPeriodDay)
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(initialPeriodDays);
    }
  }, [open, dailyLogs]);

  // Scroll to target month effect
  useEffect(() => {
    if (open && monthsToDisplay.length > 0) {
      setTimeout(() => {
        if (targetMonthRef.current && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewport) {
            // Rola para o topo do mês alvo (Jan 2026).
            viewport.scrollTop = targetMonthRef.current.offsetTop;
          }
        }
      }, 100);
    }
  }, [open, monthsToDisplay]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const flowDuration = userProfile?.flowDurationDays ?? 5; // Default to 5

    setSelectedDays((prevSelectedDays) => {
      const isAlreadySelected = prevSelectedDays.some((d) =>
        isSameDay(d, dayStart)
      );

      if (isAlreadySelected) {
        // User is clicking a selected day -> remove it (manual adjustment to shorten)
        return prevSelectedDays.filter((d) => !isSameDay(d, dayStart));
      } else {
        // User is clicking an unselected day.
        // Check if it's "touching" the current selection.
        const isAdjacent = prevSelectedDays.some(
          (d) => Math.abs(differenceInDays(d, dayStart)) === 1
        );

        if (isAdjacent && prevSelectedDays.length > 0) {
          // It's adjacent, so just add this single day (manual adjustment to lengthen)
          const newSelection = [...prevSelectedDays, dayStart];
          // Keep it sorted for easier logic later
          return newSelection.sort((a, b) => a.getTime() - b.getTime());
        } else {
          // It's not adjacent, or the selection is empty.
          // This is the trigger for a new automatic selection.
          const newSelection = [];
          for (let i = 0; i < flowDuration; i++) {
            newSelection.push(addDays(dayStart, i));
          }
          return newSelection;
        }
      }
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
          <div className="space-y-6 p-4">
            {monthsToDisplay.map((month) => {
              const isTargetMonth = isSameMonth(month, targetScrollMonth);
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
