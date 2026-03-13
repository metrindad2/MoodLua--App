'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { CycleProgress } from './cycle-progress';
import { PhaseTips } from './phase-tips';
import { DailyTracker } from './daily-tracker';
import { CycleHistory } from './cycle-history';
import { SimpleCalendar } from './simple-calendar';
import { addDays, subDays } from 'date-fns';
import { Card, CardContent } from './ui/card';

export default function Dashboard() {
  const { userProfile } = useCycleData();

  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile);
  if (!cycleInfo) return null;

  const phase = cycleInfo.isMenstruating
    ? 'Menstrual'
    : cycleInfo.isFertile
    ? 'Fértil'
    : cycleInfo.isPms
    ? 'TPM / Lútea'
    : 'Folicular';

  const highlightedRange = {
    from: cycleInfo.menstruationStartDate,
    to: subDays(cycleInfo.menstruationEndDate, 1),
  };

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

      <DailyTracker />
      <CycleHistory />
    </div>
  );
}
