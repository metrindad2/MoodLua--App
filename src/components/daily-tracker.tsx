'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { DailyLog, Mood } from '@/lib/types';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';
import type { LucideIcon as LucideIconType } from 'lucide-react';
import {
  Smile, Leaf, Angry, CloudRain, Frown, BatteryLow,
  Waves, BrainCircuit, Expand, GitCommitHorizontal, Dot, PowerOff, Cake, Moon, Pizza, Bone, Snail
} from 'lucide-react';

const iconMap: Record<string, LucideIconType> = {
  Smile, Leaf, Angry, CloudRain, Frown, BatteryLow,
  Waves, BrainCircuit, Expand, GitCommitHorizontal, Dot, PowerOff, Cake, Moon, Pizza, Bone, Snail
};


export function DailyTracker() {
  const { getLogForDate, addOrUpdateDailyLog } = useCycleData();

  // Simplificado para monitorar apenas a data atual
  const [selectedDate] = useState(new Date());

  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const log = getLogForDate(selectedDate);
    setSelectedMood(log?.mood);
    setSelectedSymptoms(log?.symptoms || []);
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Como você está hoje?</h2>
        <span className="text-sm text-muted-foreground">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3 text-foreground">
          Humor
        </h3>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((option) => {
            const Icon = iconMap[option.icon];
            return (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 transition-colors text-sm font-medium',
                  selectedMood === option.value
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-transparent border-input hover:bg-accent/50'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3 text-foreground">
          Sintomas
        </h3>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((option) => {
            const Icon = iconMap[option.icon];
            return (
              <button
                key={option.id}
                onClick={() => handleSymptomSelect(option.id)}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 transition-colors text-sm font-medium',
                  selectedSymptoms.includes(option.id)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-transparent border-input hover:bg-accent/50'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
