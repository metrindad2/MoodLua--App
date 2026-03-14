'use client';

import { useState, useEffect } from 'react';
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
  
  // This effect loads the currently logged period days when the modal opens
  // and generates the list of months to display.
  useEffect(() => {
    if (open) {
      // Load selected days
      const periodDays = dailyLogs
        .filter(log => log.flowIntensity && log.flowIntensity !== 'nenhum')
        .map(log => startOfDay(new Date(log.date + 'T00:00:00')));
      setSelectedDays(periodDays);
      
      // Generate months for scrolling view
      const today = new Date();
      const initialMonths: Date[] = [];
      // We'll render the last 12 months, including the current one.
      for (let i = 11; i >= 0; i--) { 
          initialMonths.push(subMonths(startOfMonth(today), i));
      }
      setMonthsToRender(initialMonths);
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
    // Determine which days were originally logged
    const originallyLogged = dailyLogs
      .filter(log => log.flowIntensity && log.flowIntensity !== 'nenhum')
      .map(log => startOfDay(new Date(log.date + 'T00:00:00')));

    // Union of original and new selections to know which days to process
    const allPotentiallyChangedDays = [
      ...new Set([...originallyLogged, ...selectedDays].map(d => d.getTime()))
    ].map(t => new Date(t));

    // Update logs
    for (const day of allPotentiallyChangedDays) {
      const isNowSelected = selectedDays.some(d => isSameDay(d, day));
      const wasOriginallySelected = originallyLogged.some(d => isSameDay(d, day));

      // If status changed, update log
      if (isNowSelected !== wasOriginallySelected) {
        addOrUpdateDailyLog({ date: day, flowIntensity: isNowSelected ? 'médio' : 'nenhum' });
      }
    }
    
    // If there are any selected days, find the earliest one and start a new cycle.
    if (selectedDays.length > 0) {
      const newStartDate = selectedDays[0]; // Already sorted
      startNewCycle(newStartDate);
    } else {
        // If all days were deselected, we might need to find the new latest cycle start
        // a more complex logic might be needed, but for now we let startNewCycle handle it
        // by passing a date that will trigger a recalculation.
        // For simplicity, we can assume deselecting all requires manual fix via profile.
        // A better approach would be to find the last known start date from history.
        // For now, we just rely on the user to select at least one day if they had a period.
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
        
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-8">
              {monthsToRender.map((month) => (
                <div key={month.toISOString()}>
                  <h3 className="text-lg font-semibold capitalize text-center mb-4">
                    {format(month, 'MMMM yyyy', { locale: ptBR })}
                  </h3>
                  <MonthView 
                      monthDate={month}
                      selectedDays={selectedDays}
                      onDayClick={handleDayClick}
                  />
                </div>
              ))}
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
