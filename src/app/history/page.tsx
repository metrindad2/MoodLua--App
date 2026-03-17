'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BrainCircuit, Calendar, History as HistoryIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { userProfile, cycleHistory, loading } = useCycleData();

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Por favor, configure seu perfil para ver o histórico.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedHistory = [...cycleHistory].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );
  
  const cycleLengths = cycleHistory.map((c) => c.cycleLength);
  const averageCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : userProfile.cycleLengthDays;
  
  const lastCycle = sortedHistory.length > 0 ? sortedHistory[0] : null;

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-secondary" />
            Estatísticas do Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Duração média do ciclo
              </span>
              <span className="font-bold">{averageCycleLength} dias</span>
            </div>
             {lastCycle && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Duração do ciclo anterior
                </span>
                <span className="font-bold">{lastCycle.cycleLength} dias</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Duração da menstruação (média)
              </span>
              <span className="font-bold">
                {userProfile.flowDurationDays} dias
              </span>
            </div>
          </div>
          
          <div className="!mt-6 rounded-lg bg-accent p-4">
            <h3 className="font-semibold flex items-center gap-2 text-accent-foreground">
              <Sparkles className="text-primary w-5 h-5" /> Assistente de
              Saúde
            </h3>
            <p className="text-xs text-accent-foreground/80 mt-1 mb-3">
              Receba insights personalizados sobre seu ciclo e bem-estar com nossa IA.
            </p>
            <Link href="/insights" passHref>
              <Button className="w-full">
                Gerar Insights
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold px-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-secondary" />
            Histórico de Ciclos
        </h2>
        {sortedHistory.length === 0 && (
           <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground text-center">
                Nenhum histórico de ciclo encontrado.
            </CardContent>
           </Card>
        )}
        {sortedHistory.map((cycle, index) => {
        const startDate = parseISO(cycle.startDate);
        const endDate = addDays(startDate, cycle.cycleLength - 1);

        return (
            <Card key={index}>
                <CardContent className="p-4 flex justify-between items-center">
                <div>
                    <p className="font-semibold text-sm">
                        {format(startDate, "d 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(endDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
                <p className="font-bold text-lg text-primary">{cycle.cycleLength} dias</p>
                </CardContent>
            </Card>
        );
        })}
      </div>
    </div>
  );
}
