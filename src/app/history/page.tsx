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
import { History as HistoryIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { cycleHistory, userProfile, loading } = useCycleData();

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
          <Card><CardHeader><div className="h-16 w-full bg-muted rounded"></div></CardHeader></Card>
          <Card><CardHeader><div className="h-16 w-full bg-muted rounded"></div></CardHeader></Card>
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
        <Link href="/" className="text-primary hover:underline mt-2 inline-block">
          Ir para a página inicial
        </Link>
      </div>
    );
  }
  
  const today = startOfDay(new Date());
  const lastMenstruationDate = startOfDay(new Date(userProfile.lastMenstruationDate + 'T00:00:00'));
  const currentCycleLength = differenceInDays(today, lastMenstruationDate) + 1;

  const currentCycle = {
    startDate: userProfile.lastMenstruationDate,
    cycleLength: currentCycleLength,
    isCurrent: true,
  };

  const allCycles = [currentCycle, ...cycleHistory].sort(
    (a, b) => new Date(b.startDate + 'T00:00:00').getTime() - new Date(a.startDate + 'T00:00:00').getTime()
  );

  const completedCycles = cycleHistory.filter(c => c.cycleLength > 0);
  
  const sortedCompletedCycles = [...completedCycles].sort(
    (a, b) => new Date(b.startDate + 'T00:00:00').getTime() - new Date(a.startDate + 'T00:00:00').getTime()
  );

  const averageCycleLength =
    completedCycles.length > 0
      ? Math.round(
          completedCycles.reduce((acc, c) => acc + c.cycleLength, 0) /
            completedCycles.length
        )
      : userProfile.cycleLengthDays;
        
  const lastCycleLength = sortedCompletedCycles.length > 0 ? sortedCompletedCycles[0].cycleLength : null;

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
            <CardTitle className="text-2xl">{lastCycleLength ?? '--'} dias</CardTitle>
            <CardDescription>Duração do último ciclo</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <div className="!mt-6 rounded-lg bg-accent p-4">
        <h3 className="font-semibold flex items-center gap-2 text-accent-foreground">
          <Sparkles className="text-primary w-5 h-5" /> Assistente de
          Saúde
        </h3>
        <p className="text-xs text-accent-foreground/80 mt-1 mb-3">
          Use seus dados para gerar insights com nossa IA.
        </p>
        <Link href="/insights">
          <span className="text-sm font-semibold text-primary hover:underline">
            Gerar Insights →
          </span>
        </Link>
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
                     <p className="text-xs font-medium text-primary">Ciclo Atual</p>
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
    </div>
  );
}
