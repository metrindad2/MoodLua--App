'use client';
import { useCycleData } from '@/context/cycle-data-context';
import { DailyLog, Mood } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';

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
  
  // Ref para evitar que o useEffect de salvar seja executado na montagem inicial.
  const isInitialMount = useRef(true);
  
  // Carrega o log do dia ao iniciar o componente.
  useEffect(() => {
    const log = getLogForDate(today);
    setSelectedMood(log?.mood);
    setSelectedSymptoms(log?.symptoms || []);
    setSelectedFlow(log?.flowIntensity);
  }, [today, getLogForDate]);

  // useEffect para salvar automaticamente as alterações.
  // Ele é acionado sempre que um dos estados (fluxo, humor, sintomas) muda.
  useEffect(() => {
    // Se for a montagem inicial, não faz nada. Apenas marca que a montagem terminou.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Salva o log completo com os dados mais recentes do estado.
    addOrUpdateDailyLog({
        date: today,
        flowIntensity: selectedFlow,
        mood: selectedMood,
        symptoms: selectedSymptoms,
    });
    // As dependências garantem que o efeito rode sempre que um dado for alterado.
  }, [selectedFlow, selectedMood, selectedSymptoms, addOrUpdateDailyLog, today]);


  const handleFlowSelect = (flow: DailyLog['flowIntensity']) => {
    const newFlow = selectedFlow === flow ? undefined : flow;
    setSelectedFlow(newFlow);
    // Não chama mais handleSave aqui. O useEffect cuidará disso.
  };

  const handleMoodSelect = (mood: Mood) => {
    const newMood = selectedMood === mood ? undefined : mood;
    setSelectedMood(newMood);
     // Não chama mais handleSave aqui. O useEffect cuidará disso.
  };

  const handleSymptomSelect = (symptomId: string) => {
    const newSymptoms = selectedSymptoms.includes(symptomId)
      ? selectedSymptoms.filter((s) => s !== symptomId)
      : [...selectedSymptoms, symptomId];
    setSelectedSymptoms(newSymptoms);
     // Não chama mais handleSave aqui. O useEffect cuidará disso.
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
              {MOOD_OPTIONS.map((option) => (
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
              <div className="grid grid-cols-5 gap-2">
                {SYMPTOM_OPTIONS.map((option) => (
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
