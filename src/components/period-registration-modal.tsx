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
    if (!userProfile?.joinDate) {
      return [];
    }

    // Encontra a data mais antiga dos logs para permitir a navegação para trás.
    const logDates = dailyLogs.map((log) => new Date(log.date + 'T00:00:00'));

    // O calendário deve começar no início do ano da data de entrada da usuária,
    // ou no ano do seu primeiro log, o que vier primeiro.
    const earliestPossibleDate = min([
      new Date(userProfile.joinDate + 'T00:00:00'),
      ...logDates,
    ]);
    const calendarStartDate = startOfYear(earliestPossibleDate);

    // O calendário se estende por 10 anos no futuro a partir de hoje.
    const calendarEndDate = startOfMonth(addYears(new Date(), 10));

    const numMonths =
      differenceInMonths(calendarEndDate, calendarStartDate) + 1;
    if (numMonths <= 0) return [];

    return Array.from({ length: numMonths }).map((_, i) =>
      addMonths(calendarStartDate, i)
    );
  }, [userProfile?.joinDate, dailyLogs]);

  // O mês alvo para rolagem é o mês atual.
  const currentDisplayMonth = startOfMonth(new Date());

  // Obtém os dias de período atualmente selecionados diretamente do contexto.
  const periodDays = useMemo(() => {
    return dailyLogs
      .filter((log) => log.isPeriodDay)
      .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));
  }, [dailyLogs]);

  // Efeito para rolar para o mês atual quando o diálogo abre.
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
      // Se o dia já está selecionado, remove-o.
      newSelectedDays = periodDays.filter((d) => !isSameDay(d, dayStart));
    } else {
      // Se o dia não está selecionado, adiciona-o.
      newSelectedDays = [...periodDays, dayStart];
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
