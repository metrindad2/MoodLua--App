import { Card, CardContent } from './ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CycleHistory() {
  // Dados de exemplo, já que não temos um histórico real ainda.
  const lastCycle = {
    start: new Date(2026, 1, 23), // Fevereiro
    end: new Date(2026, 2, 3), // Março
    length: 9,
  };

  return (
    <div>
      <h2 className="text-lg font-semibold my-4">Histórico</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {format(lastCycle.start, 'dd MMM', { locale: ptBR })} -{' '}
                {format(lastCycle.end, 'dd MMM', { locale: ptBR })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Período de {lastCycle.length} dias
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
