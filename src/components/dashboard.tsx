'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { CycleProgress } from './cycle-progress';
import { PhaseTips } from './phase-tips';
import { DailyTracker } from './daily-tracker';
import { SimpleCalendar } from './simple-calendar';
import { addDays, subDays, startOfDay, isAfter, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';
import { Button } from './ui/button';
import { PeriodRegistrationModal } from './period-registration-modal';
import { History } from 'lucide-react';
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

  const previsionRange = {
    from: cycleInfo.nextPeriodStartDate,
    to: addDays(
      cycleInfo.nextPeriodStartDate,
      userProfile.flowDurationDays - 1
    ),
  };
  
  const highlightedDays = dailyLogs
    .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
    .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));

  const sortedHistory = [...cycleHistory]
    .sort((a, b) => new Date(b.startDate + 'T00:00:00').getTime() - new Date(a.startDate + 'T00:00:00').getTime())
    .slice(0, 1);

  return (
    <>
      <div className="p-4 space-y-8">
        <CycleProgress
          currentDay={cycleInfo.currentCycleDay}
          cycleLength={userProfile.cycleLengthDays}
          phase={phase}
          daysUntilNext={cycleInfo.daysUntilNextPeriod}
        />
        
        <PhaseTips phase={phase} />
        
        <Card>
            <CardContent className="p-2 pt-4">
              <SimpleCalendar
                initialDate={new Date()}
                highlightedDates={highlightedDays}
                previsionRange={previsionRange}
              />
              <div className="flex items-center justify-between gap-6 px-2 text-sm border-b pb-4 mb-4">
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

        <DailyTracker />

        <div>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-secondary" />
                  Histórico de Ciclos
              </h2>
              <Link href="/history" className="text-sm font-medium text-primary hover:underline">
                Ver tudo
              </Link>
          </div>
           {sortedHistory.length > 0 ? sortedHistory.map((cycle, index) => {
            const startDate = startOfDay(new Date(cycle.startDate + 'T00:00:00'));
            const endDate = addDays(startDate, cycle.cycleLength - 1);
            return (
               <Card key={index}>
                  <CardContent className="p-4 flex justify-between items-center">
                      <p className="font-semibold text-sm">
                          {format(startDate, "d 'de' MMM", { locale: ptBR })} -{' '}
                          {format(endDate, "d 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                      <p className="font-bold text-lg text-primary">{cycle.cycleLength} dias</p>
                  </CardContent>
               </Card>
            );
          }) : (
              <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground text-center">
                    Seu histórico de ciclos aparecerá aqui.
                  </CardContent>
              </Card>
          )}
        </div>

        <PeriodRegistrationModal
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          previsionRange={previsionRange}
        />
      </div>
    </>
  );
}
