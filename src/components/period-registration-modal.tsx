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
import {
  isSameDay,
  subMonths,
  startOfMonth,
  startOfDay,
  addDays,
  differenceInDays,
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
  const { dailyLogs, addOrUpdateDailyLog, startNewCycle, userProfile, cycleHistory } = useCycleData();
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
    const flowDuration = userProfile?.flowDurationDays || 5;

    const isAlreadySelected = selectedDays.some((d) =>
      isSameDay(d, dayStart)
    );

    let newSelectedDays;

    // Logica Hibrida:
    // 1. Se nenhum dia estiver selecionado, ou se o clique for longe de uma seleção existente,
    //    cria um novo bloco automático.
    // 2. Se o clique for para adicionar/remover dias perto de um bloco, permite edição manual.
    if (!isAlreadySelected) {
      const isStartingNewBlock = selectedDays.length === 0 || !selectedDays.some(d => Math.abs(differenceInDays(d, dayStart)) < 15);
      
      if (isStartingNewBlock) {
        // Cria um novo bloco de seleção
        const newBlock = Array.from({ length: flowDuration }).map((_, i) =>
          addDays(dayStart, i)
        );
        newSelectedDays = [...selectedDays, ...newBlock];

      } else {
        // Adiciona manualmente ao bloco existente
         newSelectedDays = [...selectedDays, dayStart];
      }
    } else {
      // Remove o dia clicado
      newSelectedDays = selectedDays.filter((d) => !isSameDay(d, dayStart));
    }
    
    // Remove duplicados e ordena
    const uniqueDays = Array.from(new Set(newSelectedDays.map(d => d.getTime()))).map(t => new Date(t));
    setSelectedDays(uniqueDays.sort((a, b) => a.getTime() - b.getTime()));
  };

  const handleSave = () => {
    const originallyLogged = dailyLogs
      .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));

    const allPotentiallyChangedDays = [
      ...new Set([...originallyLogged, ...selectedDays].map((d) => d.getTime())),
    ].map((t) => new Date(t));

    // Find the earliest new selected day to see if we need to start a new cycle.
    const newPeriodStartDays = selectedDays.filter(d => !originallyLogged.some(o => isSameDay(o, d)));
    const earliestNewDay = newPeriodStartDays.length > 0 
      ? newPeriodStartDays.sort((a,b) => a.getTime() - b.getTime())[0]
      : null;

    // A new cycle starts if the user adds a flow day and that day is before any other logged flow day in its new block.
    if (earliestNewDay) {
        const isNewCycle = !cycleHistory.some(c => isSameDay(new Date(c.startDate + 'T00:00:00'), earliestNewDay));
        if (isNewCycle) {
            startNewCycle(earliestNewDay);
        }
    }

    for (const day of allPotentiallyChangedDays) {
      const isNowSelected = selectedDays.some((d) => isSameDay(d, day));
      const wasOriginallySelected = originallyLogged.some((d) =>
        isSameDay(d, day)
      );

      // Only update if the state has changed
      if (isNowSelected !== wasOriginallySelected) {
        addOrUpdateDailyLog({
          date: day,
          flowIntensity: isNowSelected ? 'médio' : 'nenhum',
        });
      }
    }

    toast({
      title: 'Período registrado!',
      description: `Seu calendário e ciclo foram atualizados.`,
    });

    onOpenChange(false);
  };

  // Cria um calendário de 100 anos (1200 meses) para simular rolagem "infinita"
  const monthsToDisplay = Array.from({ length: 1200 }).map((_, i) =>
    startOfMonth(subMonths(new Date(), 240 - i)) // 20 anos para trás, 80 para frente
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
