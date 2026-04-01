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
  Trash2,
  CalendarClock,
  Repeat,
} from 'lucide-react';
import Link from 'next/link';
import { FlowIntensity } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { cycleHistory, userProfile, loading, dailyLogs, removeDailyLog } =
    useCycleData();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-2"></div>
        <div className="h-4 w-64 bg-muted rounded"></div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-24 w-full bg-muted rounded-xl"></div>
          <div className="h-24 w-full bg-muted rounded-xl"></div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-20 w-full bg-muted rounded-xl"></div>
          <div className="h-20 w-full bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

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
  const currentCycleDay = differenceInDays(today, lastMenstruationDate) + 1;

  // O ciclo atual é dinâmico e não faz parte do histórico salvo.
  const currentCycle = {
    startDate: userProfile.lastMenstruationDate,
    cycleLength: currentCycleDay,
    isCurrent: true,
  };

  // O histórico vem diretamente do contexto, já calculado.
  const allCycles = [currentCycle, ...cycleHistory].sort(
    (a, b) =>
      new Date(b.startDate + 'T00:00:00').getTime() -
      new Date(a.startDate + 'T00:00:00').getTime()
  );

  const averageCycleLength = userProfile.cycleLengthDays;
  const lastCompletedCycle = cycleHistory.length > 0 ? cycleHistory[0] : null;

  const sortedLogs = [...dailyLogs].sort(
    (a, b) =>
      new Date(b.date + 'T00:00:00').getTime() -
      new Date(a.date + 'T00:00:00').getTime()
  );

  const handleDeleteLog = (date: Date) => {
    removeDailyLog(date);
    toast({
      title: 'Registro excluído',
      description: 'As anotações para este dia foram removidas.',
    });
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-6 w-6 text-primary" />
          Meu Histórico
        </h1>
        <p className="text-muted-foreground">
          Acompanhe a duração e os padrões dos seus ciclos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="flex items-center justify-center gap-2 text-sm">
              <Repeat className="w-4 h-4" />
              Média do ciclo
            </CardDescription>
            <CardTitle className="text-3xl">{averageCycleLength}</CardTitle>
             <p className="text-sm text-muted-foreground -mt-1">dias</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="flex items-center justify-center gap-2 text-sm">
                <CalendarClock className="w-4 h-4" />
                Último ciclo
            </CardDescription>
            <CardTitle className="text-3xl">
              {lastCompletedCycle?.cycleLength ?? '--'}
            </CardTitle>
             <p className="text-sm text-muted-foreground -mt-1">dias</p>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Histórico de Ciclos</h2>
        {allCycles.map((cycle, index) => {
          const startDate = startOfDay(new Date(cycle.startDate + 'T00:00:00'));
          const endDate = addDays(startDate, cycle.cycleLength - 1);

          return (
            <Card
              key={index}
              className={cn('transition-all', cycle.isCurrent ? 'border-primary/80 border-2' : '')}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">
                    {format(startDate, "d MMM", { locale: ptBR })} -{' '}
                    {cycle.isCurrent
                      ? 'Hoje'
                      : format(endDate, "d MMM, yyyy", { locale: ptBR })}
                  </p>
                  {cycle.isCurrent && (
                    <p className="text-xs font-medium text-primary">
                      Ciclo Atual (Dia {currentCycleDay})
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

      {/* Seção de Histórico de Logs Diários */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
            <NotebookText className="h-5 w-5" />
            Registros Diários
        </h2>

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
              const hasData =
                mood ||
                (flow && flow.value !== 'nenhum') ||
                (symptoms && symptoms.length > 0);

              return (
                <Card key={log.date}>
                  <CardHeader className="pb-3 pt-4 flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {format(logDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </CardTitle>
                      <CardDescription className="text-xs">{format(logDate, "EEEE", { locale: ptBR })}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(logDate)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {!hasData ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma informação registrada para este dia.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {mood && (
                          <div className="flex items-center gap-3 text-sm p-3 bg-muted/50 rounded-lg">
                            <span className="text-2xl">{mood.emoji}</span>
                            <div>
                              <p className="font-medium text-muted-foreground text-xs">
                                Humor
                              </p>
                              <p className="font-semibold">{mood.label}</p>
                            </div>
                          </div>
                        )}
                        {flow && flow.value !== 'nenhum' && (
                          <div className="flex items-center gap-3 text-sm p-3 bg-muted/50 rounded-lg">
                            <flow.Icon className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-muted-foreground text-xs">
                                Fluxo
                              </p>
                              <p className="font-semibold">{flow.label}</p>
                            </div>
                          </div>
                        )}
                        {symptoms && symptoms.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-muted-foreground text-sm mb-2 px-1">
                              Sintomas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {symptoms.map(
                                (symptom) =>
                                  symptom && (
                                    <div
                                      key={symptom.id}
                                      className="flex items-center gap-1.5 text-sm bg-muted text-muted-foreground font-medium px-3 py-1.5 rounded-full"
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
