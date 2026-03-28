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
  subMonths,
  startOfMonth,
  startOfDay,
  addDays,
  differenceInDays,
  isSameMonth,
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
  const { dailyLogs, addOrUpdateDailyLog, startNewCycle, userProfile } =
    useCycleData();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const { toast } = useToast();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const periodDays = dailyLogs
        .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
        .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(periodDays);

      // Atraso para garantir que a DOM esteja pronta antes de rolar.
      setTimeout(() => {
        if (currentMonthRef.current && scrollContainerRef.current) {
          const viewport = scrollContainerRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewport) {
            const offsetTop = currentMonthRef.current.offsetTop;
            const containerHeight = viewport.clientHeight;
            viewport.scrollTop =
              offsetTop - containerHeight / 2 + currentMonthRef.current.clientHeight / 2;
          }
        }
      }, 100);
    }
  }, [open, dailyLogs]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const flowDuration = userProfile?.flowDurationDays || 5;

    const isAlreadySelected = selectedDays.some((d) => isSameDay(d, dayStart));

    let newSelectedDays;

    if (!isAlreadySelected) {
      // Se nenhum dia estiver selecionado, ou se o clique for longe de uma seleção existente (>15 dias),
      // cria um novo bloco automático. Isso facilita iniciar o registro de um novo ciclo.
      const isStartingNewBlock =
        selectedDays.length === 0 ||
        !selectedDays.some(
          (d) => Math.abs(differenceInDays(d, dayStart)) < 15
        );

      if (isStartingNewBlock) {
        // Cria um novo bloco de seleção automático
        const newBlock = Array.from({ length: flowDuration }).map((_, i) =>
          addDays(dayStart, i)
        );
        // Combina com seleções existentes se houver, removendo duplicados.
        newSelectedDays = [...selectedDays, ...newBlock];
      } else {
        // Se o clique for próximo a um bloco existente, permite a edição manual adicionando um único dia.
        newSelectedDays = [...selectedDays, dayStart];
      }
    } else {
      // Remove o dia clicado se ele já estiver selecionado.
      newSelectedDays = selectedDays.filter((d) => !isSameDay(d, dayStart));
    }

    // Remove duplicados e ordena os dias para manter a consistência.
    const uniqueDays = Array.from(
      new Set(newSelectedDays.map((d) => d.getTime()))
    ).map((t) => new Date(t));
    setSelectedDays(uniqueDays.sort((a, b) => a.getTime() - b.getTime()));
  };

  const handleSave = () => {
    const originallyLogged = dailyLogs
      .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));

    const allPotentiallyChangedDays = [
      ...new Set([...originallyLogged, ...selectedDays].map((d) => d.getTime())),
    ].map((t) => new Date(t));
    
    // Processa cada dia que pode ter sido alterado
    for (const day of allPotentiallyChangedDays) {
      const isNowSelected = selectedDays.some((d) => isSameDay(d, day));
      const wasOriginallySelected = originallyLogged.some((d) =>
        isSameDay(d, day)
      );
      // Apenas atualiza o log se o estado do dia (selecionado/não selecionado) mudou.
      if (isNowSelected !== wasOriginallySelected) {
        addOrUpdateDailyLog({
          date: day,
          // Define a intensidade como 'médio' para novos registros, e 'nenhum' para remoções.
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

  // Cria um calendário de 100 anos (20 para o passado, 80 para o futuro)
  const monthsToDisplay = Array.from({ length: 1200 }).map((_, i) =>
    startOfMonth(subMonths(new Date(), 240 - i))
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

        <ScrollArea ref={scrollContainerRef} className="flex-1 p-4">
          <div className="space-y-6 pb-4">
            {monthsToDisplay.map((month) => {
              const isCurrentMonth = isSameMonth(month, new Date());
              return (
                 <div
                  key={month.toISOString()}
                  ref={isCurrentMonth ? currentMonthRef : null}
                >
                  <SimpleCalendar
                    initialDate={month}
                    selectedDates={selectedDays}
                    onDateClick={handleDayClick}
                    disableFutureDates
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
