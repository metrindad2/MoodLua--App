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
  startOfYear,
  addYears,
  differenceInMonths,
  min,
  addDays,
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

  // A lógica para gerar os meses a serem exibidos agora é memoizada para performance.
  const monthsToDisplay = useMemo(() => {
    // Ano inicial é 2000, e vai até 2200
    const calendarStartDate = new Date(2000, 0, 1);
    const calendarEndDate = new Date(2200, 0, 1);

    const numMonths =
      differenceInMonths(calendarEndDate, calendarStartDate) + 1;
    if (numMonths <= 0) return [];

    return Array.from({ length: numMonths }).map((_, i) =>
      addMonths(calendarStartDate, i)
    );
  }, []);

  // O mês alvo para rolagem é o início de 2026.
  const targetScrollDate = new Date(2026, 0, 1);
  const currentDisplayMonth = startOfMonth(targetScrollDate);

  // Obtém os dias de período atualmente selecionados diretamente do contexto.
  const periodDays = useMemo(() => {
    return dailyLogs
      .filter((log) => log.isPeriodDay)
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
  }, [dailyLogs]);

  // Efeito para rolar para o mês alvo quando o diálogo abre.
  useEffect(() => {
    if (open) {
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

  // Lida com o clique em um dia. Salva as alterações automaticamente.
  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    const isAlreadySelected = periodDays.some((d) => isSameDay(d, dayStart));

    let newSelectedDays;

    if (isAlreadySelected) {
      // Se o dia já está selecionado, remove-o para permitir o ajuste manual.
      newSelectedDays = periodDays.filter((d) => !isSameDay(d, dayStart));
    } else {
      // Se um novo dia é selecionado, adiciona um intervalo de dias
      // com base na duração do fluxo configurada pela usuária.
      const flowDuration = userProfile?.flowDurationDays || 5; // Usa 5 dias como padrão.
      const newPeriodRange = Array.from({ length: flowDuration }).map((_, i) =>
        addDays(dayStart, i)
      );

      // Combina os dias existentes com o novo intervalo, removendo duplicatas
      // para permitir que a usuária adicione múltiplos blocos de período.
      const combinedDayTimestamps = new Set([
        ...periodDays.map((d) => d.getTime()),
        ...newPeriodRange.map((d) => d.getTime()),
      ]);

      newSelectedDays = Array.from(combinedDayTimestamps).map(
        (t) => new Date(t)
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
