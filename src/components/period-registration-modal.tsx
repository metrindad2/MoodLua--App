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
  const { dailyLogs, addOrUpdateDailyLog, userProfile } = useCycleData();
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

    // Se o dia clicado NÃO estiver selecionado...
    if (!isAlreadySelected) {
      // E se NENHUM dia estiver selecionado, aciona a seleção automática em bloco.
      if (selectedDays.length === 0) {
        const newBlock = Array.from({ length: flowDuration }).map((_, i) =>
          addDays(dayStart, i)
        );
        setSelectedDays(newBlock);
      } else {
        // Se já houver dias selecionados, apenas adiciona o novo dia (edição manual).
        const newDays = [...selectedDays, dayStart];
        setSelectedDays(newDays.sort((a, b) => a.getTime() - b.getTime()));
      }
    } else {
      // Se o dia clicado JÁ estiver selecionado, apenas o remove (edição manual).
      setSelectedDays(
        selectedDays.filter((d) => !isSameDay(d, dayStart))
      );
    }
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

    toast({
      title: 'Período registrado!',
      description: `Seu calendário e ciclo foram atualizados.`,
    });

    onOpenChange(false);
  };

  // Cria um calendário de 10 anos (120 meses) para simular rolagem "infinita"
  const monthsToDisplay = Array.from({ length: 120 }).map((_, i) =>
    startOfMonth(subMonths(new Date(), 60 - i))
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
