import { Card, CardContent } from './ui/card';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCycleData } from '@/context/cycle-data-context';
import { History } from 'lucide-react';

export function CycleHistory() {
  const { cycleHistory } = useCycleData();

  if (!cycleHistory || cycleHistory.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold my-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Histórico de Ciclos
        </h2>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Nenhum ciclo anterior registrado ainda.</p>
            <p className="text-xs mt-1">
              Seu histórico aparecerá aqui após o primeiro ciclo completo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ordena o histórico do mais recente para o mais antigo
  const sortedHistory = [...cycleHistory].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );

  return (
    <div>
      <h2 className="text-lg font-semibold my-4 flex items-center gap-2">
        <History className="w-5 h-5 text-primary" /> Histórico de Ciclos
      </h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {sortedHistory.map((cycle, index) => {
            const startDate = parseISO(cycle.startDate + 'T00:00:00');

            return (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium">
                    Início em {format(startDate, 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {cycle.cycleLength} dias
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
