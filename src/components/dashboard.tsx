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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { userProfile, updateUserProfile } = useCycleData();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const { toast } = useToast();

  if (!userProfile) return null;

  const cycleInfo = calculateCycleInfo(userProfile);
  if (!cycleInfo) return null;

  const handleStartPeriod = (startDate: Date) => {
    if (userProfile) {
      updateUserProfile({
        ...userProfile,
        lastMenstruationDate: format(startDate, 'yyyy-MM-dd'),
      });
      toast({
        title: 'Novo ciclo iniciado!',
        description: 'As previsões do seu ciclo foram recalculadas.',
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
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setNewStartDate(new Date())}
                >
                  <Droplets className="mr-2" />
                  Registrar Início do Período
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quando seu período começou?</DialogTitle>
                  <DialogDescription>
                    Selecione a data de início da sua última menstruação para
                    recalcular as previsões do ciclo.
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
                    onClick={() => newStartDate && handleStartPeriod(newStartDate)}
                    disabled={!newStartDate}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Confirmar Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-2">
              <p>
                Seu período menstrual está em andamento. Continue fazendo seus
                registros diários!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <DailyTracker />
      <CycleHistory />
    </div>
  );
}
