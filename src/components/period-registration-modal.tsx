'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  isAfter,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface PeriodRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// A single month view for the multi-day selector
function MonthView({
  monthDate,
  selectedDays,
  onDayClick,
}: {
  monthDate: Date;
  selectedDays: Date[];
  onDayClick: (day: Date) => void;
}) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR, weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { locale: ptBR, weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-sm text-muted-foreground mb-2">
        {weekdays.map((weekday, i) => (
          <div key={i} className="font-medium">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((day) => {
          const isSelected = selectedDays.some((selectedDay) => isSameDay(day, selectedDay));
          const isFuture = isAfter(day, startOfDay(new Date()));

          return (
            <div key={day.toString()} className="flex items-center justify-center py-1">
              <button
                onClick={() => onDayClick(day)}
                disabled={!isSameMonth(day, monthDate) || isFuture}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  !isSameMonth(day, monthDate) && 'text-transparent cursor-default',
                   isFuture && 'text-muted-foreground/50 cursor-default',
                  isSameMonth(day, monthDate) && !isFuture && 'hover:bg-muted',
                  isSelected && 'bg-accent text-accent-foreground hover:bg-accent/90',
                )}
                aria-label={format(day, 'PPP', { locale: ptBR })}
              >
                <span>{format(day, 'd')}</span>
                {isSelected && <Check className="absolute h-4 w-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export function PeriodRegistrationModal({ open, onOpenChange }: PeriodRegistrationModalProps) {
  const { dailyLogs, addOrUpdateDailyLog, startNewCycle } = useCycleData();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [monthsToRender, setMonthsToRender] = useState<Date[]>([]);
  const { toast } = useToast();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (open) {
      // 1. Carrega os dias já registrados com fluxo menstrual
      const periodDays = dailyLogs
        .filter(log => log.flowIntensity && log.flowIntensity !== 'nenhum')
        .map(log => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(periodDays);
      
      // 2. Gera a lista de meses para exibir: 5 anos para o passado e 1 para o futuro
      const today = new Date();
      const allMonths: Date[] = [];
      const pastMonthsCount = 60; // 5 anos
      const futureMonthsCount = 12; // 1 ano
      const startDate = subMonths(startOfMonth(today), pastMonthsCount);
      const endDate = addMonths(startOfMonth(today), futureMonthsCount);

      let currentDate = startDate;
      while (currentDate <= endDate) {
          allMonths.push(currentDate);
          currentDate = addMonths(currentDate, 1);
      }
      setMonthsToRender(allMonths);
      
      // 3. Rola a visualização para o mês atual assim que o modal é aberto
      // O timeout garante que a interface tenha tempo de renderizar antes da rolagem.
      setTimeout(() => {
        if (currentMonthRef.current && scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if (viewport) {
            // Calcula a posição para centralizar o mês atual na tela
            const viewportHeight = viewport.clientHeight;
            const elementTop = currentMonthRef.current.offsetTop;
            const elementHeight = currentMonthRef.current.offsetHeight;

            const scrollToPosition = elementTop - (viewportHeight / 2) + (elementHeight / 2);
            viewport.scrollTo({ top: scrollToPosition, behavior: 'auto' });
          }
        }
      }, 100);
    }
  }, [open, dailyLogs]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    setSelectedDays((prev) => {
      if (prev.some((d) => isSameDay(d, dayStart))) {
        return prev.filter((d) => !isSameDay(d, dayStart));
      } else {
        return [...prev, dayStart].sort((a,b) => a.getTime() - b.getTime());
      }
    });
  };
  
  const handleSave = () => {
    const originallyLogged = dailyLogs
      .filter(log => log.flowIntensity && log.flowIntensity !== 'nenhum')
      .map(log => startOfDay(new Date(log.date + 'T00:00:00')));

    const allPotentiallyChangedDays = [
      ...new Set([...originallyLogged, ...selectedDays].map(d => d.getTime()))
    ].map(t => new Date(t));

    for (const day of allPotentiallyChangedDays) {
      const isNowSelected = selectedDays.some(d => isSameDay(d, day));
      const wasOriginallySelected = originallyLogged.some(d => isSameDay(d, day));

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
      <DialogContent className="max-w-md w-full h-dvh bg-background flex flex-col p-0 gap-0 sm:rounded-lg">
        <DialogHeader className="p-4 border-b flex-row flex justify-between items-center">
          <DialogTitle>Registrar Período</DialogTitle>
           <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="shrink-0">
             <X className="h-5 w-5"/>
           </Button>
        </DialogHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1">
            <div className="p-4 space-y-8">
              {monthsToRender.map((month) => {
                const isCurrentMonth = isSameMonth(month, startOfMonth(new Date()));
                return (
                    <div key={month.toISOString()} ref={isCurrentMonth ? currentMonthRef : null}>
                        <h3 className="text-lg font-semibold capitalize text-center mb-4">
                        {format(month, 'MMMM yyyy', { locale: ptBR })}
                        </h3>
                        <MonthView 
                            monthDate={month}
                            selectedDays={selectedDays}
                            onDayClick={handleDayClick}
                        />
                    </div>
                );
            })}
            </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-background flex-row justify-between sm:justify-between w-full">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
