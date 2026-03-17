'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { CycleProgress } from './cycle-progress';
import { PhaseTips } from './phase-tips';
import { DailyTracker } from './daily-tracker';
import { SimpleCalendar } from './simple-calendar';
import { addDays, subDays, startOfDay, isAfter, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';
import { Button } from './ui/button';
import { PeriodRegistrationModal } from './period-registration-modal';
import { Calendar, LineChart } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { userProfile, dailyLogs, cycleHistory } = useCycleData();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile);
  if (!cycleInfo) return null;

  const phase = cycleInfo.isMenstruating
    ? 'Menstruação'
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
      const logDate = startOfDay(new Date(log.date + 'T00:00:00'));
      return logDate >= cycleInfo.menstruationStartDate && log.flowIntensity && log.flowIntensity !== 'nenhum';
  });

  let lastLoggedFlowDate = null;
  if (periodLogs.length > 0) {
      lastLoggedFlowDate = periodLogs.reduce((latest, current) => {
          const latestDate = startOfDay(new Date(latest.date + 'T00:00:00'));
          const currentDate = startOfDay(new Date(current.date + 'T00:00:00'));
          return isAfter(currentDate, latestDate) ? current : latest;
      }).date;
  }
  
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

  const sortedHistory = [...cycleHistory]
    .sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime())
    .slice(0, 2);

  return (
    <div className="p-4 space-y-8">
      <CycleProgress
        currentDay={cycleInfo.currentCycleDay}
        cycleLength={userProfile.cycleLengthDays}
        phase={phase}
        daysUntilNext={cycleInfo.daysUntilNextPeriod}
      />
      
      <PhaseTips phase={phase} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Calendário</h2>
        <Card className="shadow-md shadow-primary/5">
          <CardContent className="p-2">
            <SimpleCalendar
              initialDate={new Date()}
              highlightedRange={highlightedRange}
              previsionRange={previsionRange}
            />
            <div className="flex items-center justify-between gap-6 p-2 text-sm border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Período</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                <span>Previsão</span>
              </div>
            </div>
            <div className="px-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsRegistrationOpen(true)}
              >
                Registrar ou Editar Período
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DailyTracker />

      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Histórico
            </h2>
            <Link href="/history">
                 <Button variant="link" className="text-primary">Ver tudo</Button>
            </Link>
        </div>
         {sortedHistory.map((cycle, index) => {
          const startDate = parseISO(cycle.startDate);
          const endDate = addDays(startDate, cycle.cycleLength - 1);
          return (
            <div
              key={index}
              className="flex justify-between items-center p-4 rounded-xl bg-secondary text-secondary-foreground"
            >
              <div className="flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-muted-foreground" />
                 <p className="font-bold text-sm">
                    {format(startDate, "d MMM", { locale: ptBR })} -{' '}
                    {format(endDate, "d MMM yy", { locale: ptBR })}
                 </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{cycle.cycleLength} dias</p>
                <p className="text-xs text-muted-foreground">Ciclo</p>
              </div>
            </div>
          );
        })}
         {sortedHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Seu histórico de ciclos aparecerá aqui.
            </p>
          )}
      </div>


      <PeriodRegistrationModal
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </div>
  );
}
