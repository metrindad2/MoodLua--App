'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BrainCircuit, Calendar, LineChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // --- Data Calculation ---
  const sortedHistory = [...cycleHistory].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );
  
  const cycleLengths = cycleHistory.map((c) => c.cycleLength);
  const averageCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : userProfile.cycleLengthDays;
  
  const lastCycle = sortedHistory.length > 0 ? sortedHistory[0] : null;

  return (
    <div className="p-4 space-y-6 bg-background text-foreground">
      {/* Meus Ciclos Card */}
      <Card className="bg-card shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <LineChart className="w-6 h-6 text-primary" />
            Estatísticas
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
          
          <div className="!mt-6 rounded-lg bg-secondary p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BrainCircuit className="text-primary w-5 h-5" /> Assistente de
              Saúde
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Vamos examinar as estatísticas do seu ciclo e os sintomas, eventos
              e humores registrados.
            </p>
            <Link href="/insights" passHref>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Vamos conversar
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>

      {/* Histórico Card */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold px-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Histórico de Ciclos
        </h2>
        {sortedHistory.map((cycle, index) => {
          const startDate = parseISO(cycle.startDate);
          const endDate = addDays(startDate, cycle.cycleLength - 1);

          return (
            <div
              key={index}
              className="flex justify-between items-center p-4 rounded-xl bg-secondary text-secondary-foreground"
            >
              <div className="flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-muted-foreground" />
                 <div>
                    <p className="font-bold text-sm">
                        {format(startDate, "d 'de' MMM", { locale: ptBR })} -{' '}
                        {format(endDate, "d 'de' MMM yyyy", { locale: ptBR })}
                    </p>
                 </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{cycle.cycleLength} dias</p>
                <p className="text-xs text-muted-foreground">Ciclo</p>
              </div>
            </div>
          );
        })}
        {sortedHistory.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum histórico de ciclo encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
