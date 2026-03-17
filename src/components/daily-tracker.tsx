'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { Mood, FlowIntensity } from '@/lib/types';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';
import { CircleSlash, Droplet, Droplets, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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

export function DailyTracker() {
  const { getLogForDate, addOrUpdateDailyLog, startNewCycle } = useCycleData();

  const [selectedDate] = useState(new Date());

  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | undefined>();

  useEffect(() => {
    const log = getLogForDate(selectedDate);
    setSelectedMood(log?.mood);
    setSelectedSymptoms(log?.symptoms || []);
    setSelectedFlow(log?.flowIntensity);
  }, [selectedDate, getLogForDate]);

  const handleMoodSelect = (mood: Mood) => {
    const newMood = selectedMood === mood ? undefined : mood;
    setSelectedMood(newMood);
    addOrUpdateDailyLog({ date: selectedDate, mood: newMood });
  };

  const handleSymptomSelect = (symptomId: string) => {
    const newSymptoms = selectedSymptoms.includes(symptomId)
      ? selectedSymptoms.filter((s) => s !== symptomId)
      : [...selectedSymptoms, symptomId];
    setSelectedSymptoms(newSymptoms);
    addOrUpdateDailyLog({ date: selectedDate, symptoms: newSymptoms });
  };

  const handleFlowSelect = (flow: FlowIntensity) => {
    const newFlow = selectedFlow === flow ? undefined : flow;
    const isStartingPeriod =
      (!selectedFlow || selectedFlow === 'nenhum') &&
      newFlow &&
      newFlow !== 'nenhum';

    setSelectedFlow(newFlow);
    addOrUpdateDailyLog({ date: selectedDate, flowIntensity: newFlow });

    if (isStartingPeriod) {
      startNewCycle(selectedDate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Registros de Hoje</CardTitle>
        <p className="text-sm text-muted-foreground !-mt-1">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">Humor</h3>
          <div className="grid grid-cols-3 gap-2">
            {MOOD_OPTIONS.map((option) => {
              return (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors text-sm font-medium',
                    selectedMood === option.value
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-transparent border-input hover:bg-accent'
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">Fluxo</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {FLOW_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFlowSelect(option.value)}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 transition-colors text-sm font-medium',
                  selectedFlow === option.value
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-transparent border-input hover:bg-accent'
                )}
              >
                <option.Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">
            Sintomas
          </h3>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((option) => {
              return (
                <button
                  key={option.id}
                  onClick={() => handleSymptomSelect(option.id)}
                  className={cn(
                    'flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 transition-colors text-sm font-medium',
                    selectedSymptoms.includes(option.id)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-transparent border-input hover:bg-accent'
                  )}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
