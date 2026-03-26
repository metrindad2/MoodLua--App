'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { isSameDay, subMonths, startOfMonth, startOfDay } from 'date-fns';
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
  const { dailyLogs, addOrUpdateDailyLog, startNewCycle } = useCycleData();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      // Carrega os dias já registrados com fluxo menstrual
      const periodDays = dailyLogs
        .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(periodDays);
    }
  }, [open, dailyLogs]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    setSelectedDays((prev) => {
      if (prev.some((d) => isSameDay(d, dayStart))) {
        return prev.filter((d) => !isSameDay(d, dayStart));
      } else {
        return [...prev, dayStart].sort((a, b) => a.getTime() - b.getTime());
      }
    });
  };

  const handleSave = () => {
    const originallyLogged = dailyLogs
      .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));

    const allPotentiallyChangedDays = [
      ...new Set([...originallyLogged, ...selectedDays].map((d) => d.getTime())),
    ].map((t) => new Date(t));

    for (const day of allPotentiallyChangedDays) {
      const isNowSelected = selectedDays.some((d) => isSameDay(d, day));
      const wasOriginallySelected = originallyLogged.some((d) =>
        isSameDay(d, day)
      );

      if (isNowSelected !== wasOriginallySelected) {
        addOrUpdateDailyLog({
          date: day,
          flowIntensity: isNowSelected ? 'médio' : 'nenhum',
        });
      }
    }

    if (selectedDays.length > 0) {
      const newStartDate = selectedDays[0];
      startNewCycle(newStartDate);
    }

    toast({
      title: 'Período registrado!',
      description: `Seu calendário e ciclo foram atualizados.`,
    });

    onOpenChange(false);
  };

  const monthsToDisplay = Array.from({ length: 6 }).map((_, i) =>
    startOfMonth(subMonths(new Date(), 3 - i))
  );

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
              Registrar Período
            </DialogTitle>
          </div>
          <div className="h-10 w-10" /> {/* Spacer */}
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 pb-4">
            {monthsToDisplay.map((month) => (
              <SimpleCalendar
                key={month.toISOString()}
                initialDate={month}
                selectedDates={selectedDays}
                onDateClick={handleDayClick}
                disableFutureDates
                previsionRange={previsionRange}
              />
            ))}
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
