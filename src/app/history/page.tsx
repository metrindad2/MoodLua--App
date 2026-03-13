'use client';

import { useCycleData } from '@/context/cycle-data-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DailyLog, Mood } from '@/lib/types';
import { MOOD_MAP } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';
import {
  History,
  Droplets,
  Smile,
  Activity,
  CalendarDays,
  BookOpenText,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const { dailyLogs, cycleHistory, loading } = useCycleData();

  // Ordena os logs por data, do mais recente para o mais antigo
  const sortedLogs = [...dailyLogs].sort(
    (a, b) =>
      new Date(b.date + 'T00:00:00').getTime() -
      new Date(a.date + 'T00:00:00').getTime()
  );

  // 1. Dados para o Gráfico de Humor
  const moodToValue = (mood: Mood | undefined) =>
    mood ? MOOD_MAP.get(mood)?.score ?? null : null;
  const moodChartData = [...dailyLogs]
    .filter((log) => log.mood)
    .sort(
      (a, b) =>
        new Date(a.date + 'T00:00:00').getTime() -
        new Date(b.date + 'T00:00:00').getTime()
    )
    .map((log) => ({
      date: format(new Date(log.date + 'T00:00:00'), 'dd/MMM', {
        locale: ptBR,
      }),
      humor: moodToValue(log.mood),
    }));

  // 2. Dados de Frequência de Sintomas
  const symptomCounts = new Map<string, number>();
  dailyLogs.forEach((log) => {
    log.symptoms?.forEach((symptomId) => {
      symptomCounts.set(symptomId, (symptomCounts.get(symptomId) || 0) + 1);
    });
  });
  const symptomFrequencyData = Array.from(symptomCounts.entries())
    .map(([id, count]) => ({
      id,
      count,
      label: SYMPTOM_OPTIONS.find((s) => s.id === id)?.label || id,
      icon: SYMPTOM_OPTIONS.find((s) => s.id === id)?.icon,
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Dados para o Histórico de Fluxo
  const flowIntensityMap: Record<string, number> = {
    leve: 1,
    médio: 2,
    intenso: 3,
  };
  const flowChartData = [...dailyLogs]
    .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
    .sort(
      (a, b) =>
        new Date(a.date + 'T00:00:00').getTime() -
        new Date(b.date + 'T00:00:00').getTime()
    )
    .map((log) => ({
      date: format(new Date(log.date + 'T00:00:00'), 'dd/MMM', {
        locale: ptBR,
      }),
      intensidade: flowIntensityMap[log.flowIntensity!],
    }));

  // 4. Histórico de Ciclos Menstruais
  const sortedHistory = [...cycleHistory].sort(
    (a, b) =>
      new Date(b.startDate + 'T00:00:00').getTime() -
      new Date(a.startDate + 'T00:00:00').getTime()
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <History className="h-6 w-6" />
            Seu Histórico Completo
          </CardTitle>
          <CardDescription>
            Visualize seus ciclos, humor, sintomas e registros diários.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Histórico de Ciclos Menstruais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="text-primary" /> Histórico de Ciclos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length > 0 ? (
            <ul className="space-y-3">
              {sortedHistory.map((cycle, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    Início em{' '}
                    {format(
                      new Date(cycle.startDate + 'T00:00:00'),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                  </span>
                  <span className="font-semibold text-primary">
                    {cycle.cycleLength} dias
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum ciclo completo registrado ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Humor */}
      {moodChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smile className="text-accent" /> Gráfico de Humor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis
                  domain={[0, 5.5]}
                  ticks={[1, 3, 5]}
                  tickFormatter={(v) => {
                    if (v === 1) return 'Baixo';
                    if (v === 3) return 'Normal';
                    if (v === 5) return 'Alto';
                    return '';
                  }}
                  fontSize={12}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="humor"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Frequência de Sintomas */}
      {symptomFrequencyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="text-secondary" /> Frequência de Sintomas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {symptomFrequencyData.map((symptom) => (
                <div
                  key={symptom.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    {symptom.icon} {symptom.label}
                  </span>
                  <span className="text-muted-foreground">
                    {symptom.count} {symptom.count > 1 ? 'vezes' : 'vez'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Fluxo */}
      {flowChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="text-primary" /> Histórico de Fluxo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={flowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis
                  domain={[0, 4]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v) => {
                    if (v === 1) return 'Leve';
                    if (v === 2) return 'Médio';
                    if (v === 3) return 'Intenso';
                    return '';
                  }}
                  fontSize={12}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="intensidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Lista de Registros Diários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpenText className="text-muted-foreground" /> Registros Diários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
              {sortedLogs.map((log: DailyLog) => {
                const mood = log.mood ? MOOD_MAP.get(log.mood) : null;
                const symptoms = log.symptoms
                  ?.map(
                    (sId) => SYMPTOM_OPTIONS.find((so) => so.id === sId)?.label
                  )
                  .filter(Boolean);

                return (
                  <div key={log.date} className="p-3 rounded-lg border">
                    <p className="font-semibold">
                      {format(
                        new Date(log.date + 'T00:00:00'),
                        "dd 'de' MMMM, yyyy",
                        { locale: ptBR }
                      )}
                    </p>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      {log.flowIntensity && log.flowIntensity !== 'nenhum' && (
                        <p>
                          <span className="font-medium text-foreground">Fluxo:</span>{' '}
                          {log.flowIntensity}
                        </p>
                      )}
                      {mood && (
                        <p>
                          <span className="font-medium text-foreground">Humor:</span>{' '}
                          {mood.icon} {mood.label}
                        </p>
                      )}
                      {symptoms && symptoms.length > 0 && (
                        <p>
                          <span className="font-medium text-foreground">Sintomas:</span>{' '}
                          {symptoms.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum registro diário encontrado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
