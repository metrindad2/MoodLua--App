'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { SimpleCalendar } from './simple-calendar';
import { DailyTracker } from './daily-tracker';
import {
  addDays,
  subMonths,
  startOfMonth,
  format,
  startOfDay,
  addMonths,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { PeriodRegistrationModal } from './period-registration-modal';
import {
  History,
  ChevronLeft,
  ChevronRight,
  Repeat,
  CalendarDays,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { CycleProgress } from './cycle-progress';
import { CalendarLegend } from './calendar-legend';

function CycleSummary() {
  const { userProfile, dailyLogs } = useCycleData();
  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile, dailyLogs);
  if (!cycleInfo) return null;

  const phase = cycleInfo.isDelayed
    ? 'Atrasada'
    : cycleInfo.isMenstruating
    ? 'Menstruação'
    : cycleInfo.isFertile
    ? 'Fase Fértil'
    : cycleInfo.isPms
    ? 'Fase Lútea (TPM)'
    : 'Fase Folicular';

  const fertilityProbability = cycleInfo.isFertile ? 'Alta' : 'Baixa';

  const summaryData = [
    {
      title: 'Fase Atual',
      value: phase,
      description: `Dia ${cycleInfo.currentCycleDay} do seu ciclo`,
      icon: Repeat,
    },
    {
      title: 'Próxima Menstruação',
      value: format(cycleInfo.nextPeriodStartDate, "dd 'de' MMM", {
        locale: ptBR,
      }),
      description: `Em ${cycleInfo.daysUntilNextPeriod} dias`,
      icon: CalendarDays,
    },
    {
      title: 'Probabilidade Fértil',
      value: fertilityProbability,
      description: cycleInfo.isFertile
        ? 'Janela fértil ativa'
        : 'Fora da janela fértil',
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {summaryData.map((item) => (
        <Card key={item.title} className="text-center">
          <CardHeader className="p-3 pb-1">
            <div className="flex justify-center mb-1">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-lg font-bold text-foreground">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { userProfile, dailyLogs, cycleHistory, savePeriodDays } = useCycleData();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  // State to manage the currently displayed month
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile, dailyLogs);
  if (!cycleInfo) return null;

  const phase = cycleInfo.isDelayed
    ? 'Menstruação Atrasada'
    : cycleInfo.isMenstruating
    ? 'Menstruação'
    : cycleInfo.isFertile
    ? 'Fase Fértil'
    : cycleInfo.isPms
    ? 'Fase Lútea (TPM)'
    : 'Fase Folicular';

  // Calculate predictions dynamically for the calendar based on the current month
  const predictions = useMemo(() => {
    if (!userProfile)
      return { previsionRanges: [], fertileWindows: [], ovulationDates: [] };

    const {
      lastMenstruationDate: lmpString,
      cycleLengthDays,
      flowDurationDays,
    } = userProfile;
    const lastPeriodDate = startOfDay(new Date(lmpString + 'T00:00:00'));

    const previsionRanges: { from: Date; to: Date }[] = [];
    const fertileWindows: { from: Date; to: Date }[] = [];
    const ovulationDates: Date[] = [];

    // Start projecting from a point before the displayed month to catch overlaps
    let periodStart = lastPeriodDate;
    while (
      addDays(periodStart, cycleLengthDays) <
      startOfMonth(subMonths(currentMonth, 1))
    ) {
      periodStart = addDays(periodStart, cycleLengthDays);
    }

    // Generate predictions for a few cycles to cover the screen
    for (let i = 0; i < 4; i++) {
      const nextPeriod = addDays(periodStart, cycleLengthDays * i);

      previsionRanges.push({
        from: nextPeriod,
        to: addDays(nextPeriod, flowDurationDays - 1),
      });

      const ovulationDate = subDays(nextPeriod, 14);
      ovulationDates.push(ovulationDate);
      fertileWindows.push({
        from: subDays(ovulationDate, 5),
        to: addDays(ovulationDate, 1),
      });
    }

    return { previsionRanges, fertileWindows, ovulationDates };
  }, [currentMonth, userProfile]);

  const highlightedDays = dailyLogs
    .filter((log) => log.isPeriodDay) // Alterado para usar a nova flag
    .map((log) => startOfDay(new Date(log.date + 'T00:00:00')));

  const sortedHistory = [...cycleHistory]
    .sort(
      (a, b) =>
        new Date(b.startDate + 'T00:00:00').getTime() -
        new Date(a.startDate + 'T00:00:00').getTime()
    )
    .slice(0, 1);

  // Functions to navigate between months
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <>
      <div className="p-4 space-y-6">
        <CycleProgress
          currentDay={cycleInfo.currentCycleDay}
          cycleLength={userProfile.cycleLengthDays}
          phase={phase}
          daysUntilNext={cycleInfo.daysUntilNextPeriod}
        />
        
        <CycleSummary />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <h2 className="font-semibold capitalize text-lg">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <SimpleCalendar
              initialDate={currentMonth}
              highlightedDates={highlightedDays}
              previsionRanges={predictions.previsionRanges}
              fertileWindows={predictions.fertileWindows}
              ovulationDates={predictions.ovulationDates}
              dailyLogs={dailyLogs}
            />
          </CardContent>
          <CalendarLegend />
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsRegistrationOpen(true)}
        >
          Registrar / Editar Menstruação
        </Button>

        <DailyTracker />

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-secondary" />
              Último Ciclo
            </h2>
            <Link
              href="/history"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todo histórico
            </Link>
          </div>
          {sortedHistory.length > 0 ? (
            sortedHistory.map((cycle, index) => {
              const startDate = startOfDay(
                new Date(cycle.startDate + 'T00:00:00')
              );
              const endDate = addDays(startDate, cycle.cycleLength - 1);
              return (
                <Card key={index}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <p className="font-semibold text-sm">
                      {format(startDate, "d 'de' MMM", { locale: ptBR })} -{' '}
                      {format(endDate, "d 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                    <p className="font-bold text-lg text-primary">
                      {cycle.cycleLength} dias
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
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
          onSave={savePeriodDays}
        />
      </div>
    </>
  );
}
