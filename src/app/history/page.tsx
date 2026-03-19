
'use client';

import { useCycleData } from '@/context/cycle-data-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  History as HistoryIcon,
  NotebookText,
  CircleSlash,
  Droplet,
  Droplets,
  Waves,
} from 'lucide-react';
import Link from 'next/link';
import { FlowIntensity } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';

const FLOW_OPTIONS: {
  value: FlowIntensity;
  label: string;
  Icon: React.ElementType;
}[] = [
  { value: 'nenhum', label: 'Nenhum', Icon: CircleSlash },
  { value: 'leve', label: 'Leve', Icon: Droplet },
  { value: 'médio', label: 'Médio', Icon: Droplets },
  { value: 'intenso', label: 'Intenso', Icon: Waves },
];

export default function HistoryPage() {
  const { cycleHistory, userProfile, loading, dailyLogs } = useCycleData();

  // On first render, loading is true and userProfile is null.
  // We need to handle this loading state to prevent errors.
  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-4 w-64 bg-muted rounded mt-2"></div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="h-16 w-full bg-muted rounded"></div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-16 w-full bg-muted rounded"></div>
            </CardHeader>
          </Card>
        </div>
        <div className="space-y-3">
          <div className="h-16 w-full bg-muted rounded-lg"></div>
          <div className="h-16 w-full bg-muted rounded-lg"></div>
          <div className="h-16 w-full bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  // After loading, if there's still no profile, show a message.
  if (!userProfile) {
    return (
      <div className="p-4 text-center">
        <p>Complete seu perfil para visualizar o histórico.</p>
        <Link
          href="/"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Ir para a página inicial
        </Link>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const lastMenstruationDate = startOfDay(
    new Date(userProfile.lastMenstruationDate + 'T00:00:00')
  );
  const currentCycleLength = differenceInDays(today, lastMenstruationDate) + 1;

  const currentCycle = {
    startDate: userProfile.lastMenstruationDate,
    cycleLength: currentCycleLength,
    isCurrent: true,
  };

  const allCycles = [currentCycle, ...cycleHistory].sort(
    (a, b) =>
      new Date(b.startDate + 'T00:00:00').getTime() -
      new Date(a.startDate + 'T00:00:00').getTime()
  );

  const completedCycles = cycleHistory.filter((c) => c.cycleLength > 0);

  const sortedCompletedCycles = [...completedCycles].sort(
    (a, b) =>
      new Date(b.startDate + 'T00:00:00').getTime() -
      new Date(a.startDate + 'T00:00:00').getTime()
  );

  const averageCycleLength =
    completedCycles.length > 0
      ? Math.round(
          completedCycles.reduce((acc, c) => acc + c.cycleLength, 0) /
            completedCycles.length
        )
      : userProfile.cycleLengthDays;

  const lastCycleLength =
    sortedCompletedCycles.length > 0
      ? sortedCompletedCycles[0].cycleLength
      : null;

  const sortedLogs = [...dailyLogs].sort(
    (a, b) =>
      new Date(b.date + 'T00:00:00').getTime() -
      new Date(a.date + 'T00:00:00').getTime()
  );

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Histórico de Ciclos
          </CardTitle>
          <CardDescription>
            Acompanhe a duração e os padrões dos seus ciclos menstruais.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{averageCycleLength} dias</CardTitle>
            <CardDescription>Média do ciclo</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {lastCycleLength ?? '--'} dias
            </CardTitle>
            <CardDescription>Duração do último ciclo</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        {allCycles.map((cycle, index) => {
          const startDate = startOfDay(new Date(cycle.startDate + 'T00:00:00'));
          const endDate = addDays(startDate, cycle.cycleLength - 1);

          return (
            <Card
              key={index}
              className={cycle.isCurrent ? 'border-primary' : ''}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">
                    {format(startDate, "d 'de' MMM", { locale: ptBR })} -{' '}
                    {cycle.isCurrent
                      ? 'Presente'
                      : format(endDate, "d 'de' MMM, yyyy", { locale: ptBR })}
                  </p>
                  {cycle.isCurrent && (
                    <p className="text-xs font-medium text-primary">
                      Ciclo Atual
                    </p>
                  )}
                </div>
                <p className="font-bold text-lg text-primary">
                  {cycle.cycleLength} dias
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Daily Log History Section */}
      <div className="space-y-3 pt-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="flex items-center gap-2">
            <NotebookText className="h-6 w-6 text-primary" />
            Registros Diários
          </CardTitle>
          <CardDescription>
            Visualize os detalhes que você salvou a cada dia.
          </CardDescription>
        </CardHeader>

        {sortedLogs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Nenhum registro diário salvo ainda.</p>
              <p className="text-xs mt-1">
                Use a tela inicial para registrar seu humor, sintomas e fluxo.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map((log) => {
              const logDate = startOfDay(new Date(log.date + 'T00:00:00'));
              const mood = MOOD_OPTIONS.find((m) => m.value === log.mood);
              const symptoms = log.symptoms
                ?.map((sId) => SYMPTOM_OPTIONS.find((s) => s.id === sId))
                .filter(Boolean) as { id: string; label: string; emoji: string }[];
              const flow = FLOW_OPTIONS.find(
                (f) => f.value === log.flowIntensity
              );
              const hasData = mood || (flow && flow.value !== 'nenhum') || (symptoms && symptoms.length > 0);

              return (
                <Card key={log.date}>
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-base font-semibold">
                      {format(logDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {!hasData ? (
                       <p className="text-sm text-muted-foreground">Nenhuma informação registrada para este dia.</p>
                    ): (
                        <div className="space-y-3">
                        {mood && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">{mood.emoji}</span>
                            <div>
                                <p className="font-medium text-muted-foreground">Humor</p>
                                <p className="font-semibold">{mood.label}</p>
                            </div>
                        </div>
                        )}
                        {flow && flow.value !== 'nenhum' && (
                        <div className="flex items-center gap-2 text-sm">
                            <flow.Icon className="h-5 w-5 text-primary" />
                             <div>
                                <p className="font-medium text-muted-foreground">Fluxo</p>
                                <p className="font-semibold">{flow.label}</p>
                            </div>
                        </div>
                        )}
                        {symptoms && symptoms.length > 0 && (
                        <div>
                            <h4 className="font-medium text-muted-foreground text-sm mb-2">Sintomas</h4>
                            <div className="flex flex-wrap gap-2">
                            {symptoms.map(
                                (symptom) =>
                                symptom && (
                                    <div
                                    key={symptom.id}
                                    className="flex items-center gap-1.5 text-sm bg-muted text-muted-foreground font-medium p-2 rounded-md"
                                    >
                                    <span>{symptom.emoji}</span>
                                    <span>{symptom.label}</span>
                                    </div>
                                )
                            )}
                            </div>
                        </div>
                        )}
                        </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
