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
import { isSameDay } from 'date-fns';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { SimpleCalendar } from './simple-calendar';
import { startOfDay } from 'date-fns';

interface PeriodRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PeriodRegistrationModal({ open, onOpenChange }: PeriodRegistrationModalProps) {
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
      const wasOriginallySelected = originallyLogged.some((d) => isSameDay(d, day));

      if (isNowSelected !== wasOriginallySelected) {
        addOrUpdateDailyLog({ date: day, flowIntensity: isNowSelected ? 'médio' : 'nenhum' });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Período</DialogTitle>
        </DialogHeader>

        <div>
          <SimpleCalendar
            selectedDates={selectedDays}
            onDateClick={handleDayClick}
            disableFutureDates
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
