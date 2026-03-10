'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCycleData } from '@/context/cycle-data-context';
import { personalizedCycleInsights, PersonalizedCycleInsightsOutput } from '@/ai/flows/personalized-cycle-insights';
import { BrainCircuit, Lightbulb, Zap, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateCycleInfo, prepareDataForAI } from '@/lib/cycle-utils';
import { Mood } from '@/lib/types';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Página de Insights com IA.
 *
 * Permite que a usuária gere análises personalizadas sobre seu ciclo
 * usando a inteligência artificial (Genkit).
 */
export default function InsightsPage() {
  const { userProfile, dailyLogs, loading: dataLoading } = useCycleData();
  const [insights, setInsights] = useState<PersonalizedCycleInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleGenerateInsights = async () => {
    if (!userProfile) {
      toast({
        title: 'Perfil não encontrado',
        description: 'Configure seu perfil na página inicial para gerar insights.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setInsights(null);

    try {
      const cycleInfo = calculateCycleInfo(userProfile);
      if (!cycleInfo) throw new Error("Não foi possível calcular as informações do ciclo.");

      const aiData = prepareDataForAI(userProfile, dailyLogs, cycleInfo);
      
      const result = await personalizedCycleInsights(aiData);
      setInsights(result);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      toast({
        title: 'Erro ao gerar insights',
        description: 'Não foi possível se conectar com a IA. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const moodToValue = (mood: Mood | undefined) => {
    const mapping: Record<Mood, number> = {
      'feliz': 5,
      'energizada': 4,
      'neutra': 3,
      'cansada': 2,
      'ansiosa': 2,
      'triste': 1,
      'irritada': 1,
    };
    return mood ? mapping[mood] : null;
  }
  
  const moodChartData = dailyLogs
    .filter(log => log.mood)
    .map(log => ({
      date: format(new Date(log.date), 'dd/MMM', { locale: ptBR }),
      humor: moodToValue(log.mood),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-6 w-6" />
            Insights com IA
          </CardTitle>
          <CardDescription>
            Receba análises e sugestões personalizadas sobre seu ciclo com base nos seus registros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateInsights} disabled={loading || dataLoading} className="w-full">
            {loading ? 'Analisando seu ciclo...' : 'Gerar Insights Agora'}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
            <BrainCircuit className="h-8 w-8 animate-pulse" />
            <p>Nossa IA está analisando seus dados... Isso pode levar um momento.</p>
        </div>
      )}

      {insights && (
        <div className="space-y-4 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-500"/> Insights Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {insights.insights.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>

          {dailyLogs.some(log => log.mood) && (
          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Humor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moodChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={[0, 5]} tickFormatter={(v) => ['Ruim', '', 'Ok', '', 'Bom'][v-1]} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="humor" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="text-blue-500" /> Possíveis Correlações</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {insights.correlations.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Leaf className="text-green-500" /> Sugestões de Bem-Estar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {insights.wellnessSuggestions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
