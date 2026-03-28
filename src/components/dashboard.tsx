'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { CycleProgress } from './cycle-progress';
import { PhaseTips } from './phase-tips';
import { DailyTracker } from './daily-tracker';
import { SimpleCalendar } from './simple-calendar';
import { addDays, subMonths, startOfMonth, format, startOfDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from './ui/card';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { PeriodRegistrationModal } from './period-registration-modal';
import { History } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

export default function Dashboard() {
  const { userProfile, dailyLogs, cycleHistory } = useCycleData();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Refs para a funcionalidade de auto-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rola a visualização do calendário para o mês atual na montagem do componente.
    if (currentMonthRef.current && scrollContainerRef.current) {
      const viewport = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const offsetTop = currentMonthRef.current.offsetTop;
        const containerHeight = viewport.clientHeight;
        // Centraliza o mês atual na área de rolagem.
        viewport.scrollTop = offsetTop - (containerHeight / 2) + (currentMonthRef.current.clientHeight / 2);
      }
    }
  }, []); // Executa apenas uma vez.

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

  const fertileWindow = {
    from: cycleInfo.fertileWindowStartDate,
    to: cycleInfo.fertileWindowEndDate,
  };

  const sortedHistory = [...cycleHistory]
    .sort((a, b) => new Date(b.startDate + 'T00:00:00').getTime() - new Date(a.startDate + 'T00:00:00').getTime())
    .slice(0, 1);

  // Gera uma lista de meses para a rolagem "infinita" (100 anos).
  const monthsToDisplay = Array.from({ length: 1200 }).map((_, i) =>
    startOfMonth(subMonths(new Date(), 240 - i))
  );
  
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
          <CardContent className="p-0">
            <ScrollArea ref={scrollContainerRef} className="h-[450px] w-full">
              <div className="p-4 space-y-6">
                {monthsToDisplay.map((month) => {
                  const isCurrentMonth = isSameMonth(month, new Date());
                  return (
                    <div key={month.toISOString()} ref={isCurrentMonth ? currentMonthRef : null}>
                       <SimpleCalendar
                        initialDate={month}
                        highlightedDates={highlightedDays}
                        previsionRange={previsionRange}
                        fertileWindow={fertileWindow}
                        ovulationDate={cycleInfo.ovulationDate}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-4 border-t space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Período</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-dashed border-secondary"></div>
                  <span>Previsão</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-fertile"></div>
                  <span>Fértil</span>
                </div>
                 <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mr-1"></div>
                  <span>Ovulação</span>
                </div>
              </div>
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
