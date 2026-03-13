'use client';

import { useCycleData } from '@/context/cycle-data-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BrainCircuit, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Component to render the cycle dots visualization
const CycleDots = ({
  totalDays,
  flowDays,
  maxDots = 42,
}: {
  totalDays: number;
  flowDays: number;
  maxDots?: number;
}) => {
  const displayDots = Math.min(totalDays, maxDots);
  const displayFlowDots = Math.min(flowDays, displayDots);

  if (totalDays <= 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {Array.from({ length: displayDots }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i < displayFlowDots ? 'bg-accent' : 'bg-chart-2'
          )}
        />
      ))}
    </div>
  );
};

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

  const currentCycleInfo = calculateCycleInfo(userProfile);

  // --- Data Calculation ---
  const sortedHistory = [...cycleHistory].sort((a, b) =>
    parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );
  const lastCycle = sortedHistory.length > 0 ? sortedHistory[0] : null;

  const cycleLengths = cycleHistory.map((c) => c.cycleLength);
  const cycleVariation =
    cycleLengths.length > 1
      ? { min: Math.min(...cycleLengths), max: Math.max(...cycleLengths) }
      : { min: userProfile.cycleLengthDays, max: userProfile.cycleLengthDays };

  return (
    <div className="p-4 space-y-6 bg-background text-foreground">
      {/* Meus Ciclos Card */}
      <Card className="bg-card shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Meus Ciclos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3 px-1">
            {lastCycle ? (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Duração do ciclo anterior
                </span>
                <span className="font-bold">{lastCycle.cycleLength} dias</span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Duração média do ciclo
                </span>
                <span className="font-bold">
                  {userProfile.cycleLengthDays} dias
                </span>
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
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Variação na duração do ciclo
              </span>
              <span className="font-bold">
                {cycleVariation.min === cycleVariation.max
                  ? `${cycleVariation.min}`
                  : `${cycleVariation.min}-${cycleVariation.max}`}{' '}
                dias
              </span>
            </div>
          </div>

          <div className="!mt-6 rounded-lg bg-muted/50 p-4">
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
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Current Cycle */}
          {currentCycleInfo && (
            <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">
                    Ciclo atual: {currentCycleInfo.currentCycleDay} dias
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Começou em{' '}
                    {format(
                      currentCycleInfo.menstruationStartDate,
                      "d 'de' MMMM",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <CycleDots
                totalDays={currentCycleInfo.currentCycleDay}
                flowDays={userProfile.flowDurationDays}
              />
            </div>
          )}

          {/* Past Cycles */}
          {sortedHistory.map((cycle, index) => {
            const startDate = parseISO(cycle.startDate);
            const endDate = addDays(startDate, cycle.cycleLength - 1);

            return (
              <div
                key={index}
                className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{cycle.cycleLength} dias</p>
                    <p className="text-xs text-muted-foreground">
                      {format(startDate, 'd MMM', { locale: ptBR })} -{' '}
                      {format(endDate, 'd MMM yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <CycleDots
                  totalDays={cycle.cycleLength}
                  flowDays={userProfile.flowDurationDays}
                />
              </div>
            );
          })}
          {sortedHistory.length === 0 && !currentCycleInfo && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum histórico de ciclo encontrado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
