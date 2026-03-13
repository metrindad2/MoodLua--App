'use client';

import { useState } from 'react';
import { useCycleData } from '@/context/cycle-data-context';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { CycleProgress } from './cycle-progress';
import { PhaseTips } from './phase-tips';
import { DailyTracker } from './daily-tracker';
import { CycleHistory } from './cycle-history';
import { SimpleCalendar } from './simple-calendar';
import { addDays, subDays, format } from 'date-fns';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { userProfile, updateUserProfile } = useCycleData();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile);
  if (!cycleInfo) return null;

  const handleStartPeriod = () => {
    if (userProfile) {
      updateUserProfile({
        ...userProfile,
        lastMenstruationDate: format(new Date(), 'yyyy-MM-dd'),
      });
      toast({
        title: 'Novo ciclo iniciado!',
        description: 'As previsões do seu ciclo foram recalculadas.',
      });
      setIsConfirmOpen(false);
    }
  };

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

      <Card>
        <CardContent className="pt-6">
          {!cycleInfo.isMenstruating ? (
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Droplets className="mr-2" />
                  Registrar Início do Período
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Início da Menstruação?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso definirá hoje como o primeiro dia do seu novo ciclo menstrual e as previsões serão recalculadas a partir desta data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStartPeriod} className="bg-accent text-accent-foreground hover:bg-accent/90">Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-2">
              <p>Seu período menstrual está em andamento. Continue fazendo seus registros diários!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DailyTracker />
      <CycleHistory />
    </div>
  );
}
