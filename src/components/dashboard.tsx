'use client';

import { useState } from 'react';
import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { CycleProgress } from './cycle-progress';
import { PhaseTips } from './phase-tips';
import { DailyTracker } from './daily-tracker';
import { CycleHistory } from './cycle-history';
import { SimpleCalendar } from './simple-calendar';
import { addDays, subDays, format, startOfDay, isAfter } from 'date-fns';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { userProfile, dailyLogs, startNewCycle } = useCycleData();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const { toast } = useToast();

  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile);
  if (!cycleInfo) return null;

  const handleConfirmNewPeriod = (startDate: Date) => {
    if (userProfile && startNewCycle) {
      startNewCycle(startDate);
      
      toast({
        title: 'Novo ciclo iniciado!',
        description: `Sua menstruação foi registrada automaticamente por ${userProfile.flowDurationDays} dias.`,
      });
      setIsConfirmOpen(false);
      setNewStartDate(null);
    }
  };

  const phase = cycleInfo.isMenstruating
    ? 'Menstrual'
    : cycleInfo.isFertile
    ? 'Fértil'
    : cycleInfo.isPms
    ? 'TPM / Lútea'
    : 'Folicular';

  // --- Lógica de Destaque Dinâmico ---
  // A data final prevista é baseada no que foi inserido no login.
  const predictedEndDate = subDays(cycleInfo.menstruationEndDate, 1);

  // Filtra os registros para pegar apenas os dias com fluxo menstrual desde o início do período atual.
  const periodLogs = dailyLogs.filter(log => {
      // Correção: Adicionar 'T00:00:00' para garantir que a data seja lida no fuso horário local.
      const logDate = startOfDay(new Date(log.date + 'T00:00:00'));
      return logDate >= cycleInfo.menstruationStartDate && log.flowIntensity && log.flowIntensity !== 'nenhum';
  });

  let lastLoggedFlowDate = null;
  if (periodLogs.length > 0) {
      // Encontra a data mais recente entre os dias registrados com fluxo.
      lastLoggedFlowDate = periodLogs.reduce((latest, current) => {
          // Correção: Adicionar 'T00:00:00' para garantir que a data seja lida no fuso horário local.
          const latestDate = startOfDay(new Date(latest.date + 'T00:00:00'));
          const currentDate = startOfDay(new Date(current.date + 'T00:00:00'));
          return isAfter(currentDate, latestDate) ? current : latest;
      }).date;
  }
  
  // A data final do destaque será a data mais tardia entre a previsão e o último dia registrado.
  // Isso garante que o destaque se estenda se o período for mais longo, mas não encurte se a usuária esquecer de registrar.
  const highlightEndDate = lastLoggedFlowDate && isAfter(startOfDay(new Date(lastLoggedFlowDate + 'T00:00:00')), predictedEndDate) 
      ? startOfDay(new Date(lastLoggedFlowDate + 'T00:00:00')) 
      : predictedEndDate;

  const highlightedRange = {
    from: cycleInfo.menstruationStartDate,
    to: highlightEndDate,
  };
  // --- Fim da Lógica de Destaque Dinâmico ---


  const previsionRange = {
    from: cycleInfo.nextPeriodStartDate,
    to: addDays(
      cycleInfo.nextPeriodStartDate,
      userProfile.flowDurationDays - 1
    ),
  };

  return (
    <div className="p-4 space-y-6">
      <CycleProgress
        currentDay={cycleInfo.currentCycleDay}
        cycleLength={userProfile.cycleLengthDays}
        phase={phase}
        daysUntilNext={cycleInfo.daysUntilNextPeriod}
      />
      <PhaseTips phase={phase} />

      <div>
        <h2 className="text-lg font-semibold mb-2">Calendário</h2>
        <Card>
          <CardContent className="p-2">
            <SimpleCalendar
              initialDate={new Date()}
              highlightedRange={highlightedRange}
              previsionRange={previsionRange}
            />
            <div className="flex items-center gap-6 p-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Período</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                <span>Previsão</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                onClick={() => setNewStartDate(new Date())}
              >
                Registrar menstruação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar menstruação</DialogTitle>
                <DialogDescription>
                  Selecione o dia em que seu período começou para registrar e recalcular as previsões.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <SimpleCalendar
                  initialDate={newStartDate || new Date()}
                  selectedDate={newStartDate}
                  onDateClick={(date) => setNewStartDate(date)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    setNewStartDate(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => newStartDate && handleConfirmNewPeriod(newStartDate)}
                  disabled={!newStartDate}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <DailyTracker />
      <CycleHistory />
    </div>
  );
}
