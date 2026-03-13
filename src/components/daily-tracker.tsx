'use client';
import { useCycleData } from '@/context/cycle-data-context';
import { DailyLog, Mood } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';

const moodOptions: { value: Mood; label: string; icon: string }[] = [
  { value: 'feliz', label: 'Feliz', icon: '😊' },
  { value: 'calma', label: 'Calma', icon: '😌' },
  { value: 'triste', label: 'Triste', icon: '😔' },
  { value: 'irritada', label: 'Irritada', icon: '😠' },
  { value: 'ansiosa', label: 'Ansiosa', icon: '😟' },
  { value: 'cansada', label: 'Cansada', icon: '😩' },
  { value: 'carinhosa', label: 'Carinhosa', icon: '🥰' },
  { value: 'neutra', label: 'Neutra', icon: '😐' },
];

const symptomsOptions = [
  { id: 'dor_de_cabeca', label: 'Dor de cabeça', icon: '🤕' },
  { id: 'colica', label: 'Cólica', icon: '😖' },
  { id: 'inchaco', label: 'Inchaço', icon: '🎈' },
  { id: 'desejo_por_doce', label: 'Desejo por doce', icon: '🍫' },
  { id: 'dor_nas_costas', label: 'Dor nas costas', icon: '🚶‍♀️' },
  { id: 'nausea', label: 'Náusea', icon: '🤢' },
  { id: 'insonia', label: 'Insônia', icon: ' sleepless' },
  { id: 'seios_sensiveis', label: 'Seios sensíveis', icon: '🍈' },
  { id: 'tontura', label: 'Tontura', icon: '😵' },
  { id: 'mais_apetite', label: 'Mais apetite', icon: '🍔' },
];

const flowOptions: { value: DailyLog['flowIntensity']; label: string }[] = [
    { value: 'nenhum', label: 'Nenhum' },
    { value: 'leve', label: 'Leve' },
    { value: 'médio', label: 'Médio' },
    { value: 'intenso', label: 'Intenso' },
];


export function DailyTracker() {
  const { getLogForDate, addOrUpdateDailyLog } = useCycleData();
  
  const [today] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<DailyLog['flowIntensity']>();
  
  useEffect(() => {
    const log = getLogForDate(today);
    setSelectedMood(log?.mood);
    setSelectedSymptoms(log?.symptoms || []);
    setSelectedFlow(log?.flowIntensity);
  }, [today, getLogForDate]);

  const handleSave = useCallback((data: Partial<Omit<DailyLog, 'date'>>) => {
      addOrUpdateDailyLog({
          date: today,
          flowIntensity: selectedFlow,
          mood: selectedMood,
          symptoms: selectedSymptoms,
          ...data,
      });
  }, [today, addOrUpdateDailyLog, selectedFlow, selectedMood, selectedSymptoms]);

  const handleFlowSelect = (flow: DailyLog['flowIntensity']) => {
    const newFlow = selectedFlow === flow ? undefined : flow;
    setSelectedFlow(newFlow);
    handleSave({ flowIntensity: newFlow });
  };

  const handleMoodSelect = (mood: Mood) => {
    const newMood = selectedMood === mood ? undefined : mood;
    setSelectedMood(newMood);
    handleSave({ mood: newMood });
  };

  const handleSymptomSelect = (symptomId: string) => {
    const newSymptoms = selectedSymptoms.includes(symptomId)
      ? selectedSymptoms.filter((s) => s !== symptomId)
      : [...selectedSymptoms, symptomId];
    setSelectedSymptoms(newSymptoms);
    handleSave({ symptoms: newSymptoms });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Como você está hoje?</h2>
            <span className="text-sm text-muted-foreground">
                {format(today, "dd 'de' MMMM", { locale: ptBR })}
            </span>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" /> Fluxo Menstrual
            </p>
            <div className="grid grid-cols-4 gap-2">
                {flowOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleFlowSelect(option.value)}
                        className={cn(
                            'flex items-center justify-center p-2 rounded-lg border-2 transition-colors text-sm h-12',
                            selectedFlow === option.value
                                ? 'bg-primary/20 border-primary font-semibold'
                                : 'bg-transparent border-transparent hover:bg-primary/10'
                        )}
                    >
                       {option.label}
                    </button>
                ))}
            </div>

            <p className="text-sm font-medium mt-6 mb-4">Humor</p>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={cn(
                      'flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors',
                      selectedMood === option.value
                        ? 'bg-accent/20 border-accent'
                        : 'bg-transparent border-transparent hover:bg-accent/10'
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-xs text-center">{option.label}</span>
                </button>
              ))}
            </div>
             <p className="text-sm font-medium mt-6 mb-4">Sintomas</p>
              <div className="grid grid-cols-4 gap-2">
                {symptomsOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSymptomSelect(option.id)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-colors',
                      selectedSymptoms.includes(option.id)
                        ? 'bg-accent/20 border-accent'
                        : 'bg-transparent border-transparent hover:bg-accent/10'
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-xs text-center">{option.label}</span>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
