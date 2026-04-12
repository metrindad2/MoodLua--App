
'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { Mood, FlowIntensity, DailyLog } from '@/lib/types';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';
import { SEXO_LIBIDO_OPTIONS } from '@/lib/sexo-libido';
import {
  CircleSlash,
  Droplet,
  Droplets,
  Save,
  Trash2,
  Waves,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [selectedDate] = useState(new Date());

  // State for current selections
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | undefined>();
  const [selectedSexoLibido, setSelectedSexoLibido] = useState<string[]>([]);


  // State to track the originally loaded log for comparison on save
  const [originalLog, setOriginalLog] = useState<DailyLog | undefined>();

  // Load data from context and populate the form states
  useEffect(() => {
    const log = getLogForDate(selectedDate);
    setOriginalLog(log);
    setSelectedMood(log?.mood);
    setSelectedSymptoms(log?.symptoms || []);
    setSelectedFlow(log?.flowIntensity);
    setSelectedSexoLibido(log?.sexoLibido || []);
  }, [selectedDate, getLogForDate]);

  const handleMoodSelect = (mood: Mood) => {
    const newMood = selectedMood === mood ? undefined : mood;
    setSelectedMood(newMood);
  };

  const handleSymptomSelect = (symptomId: string) => {
    const newSymptoms = selectedSymptoms.includes(symptomId)
      ? selectedSymptoms.filter((s) => s !== symptomId)
      : [...selectedSymptoms, symptomId];
    setSelectedSymptoms(newSymptoms);
  };

    const handleSexoLibidoSelect = (id: string) => {
    const newSelection = selectedSexoLibido.includes(id)
      ? selectedSexoLibido.filter((s) => s !== id)
      : [...selectedSexoLibido, id];
    setSelectedSexoLibido(newSelection);
  };

  const handleFlowSelect = (flow: FlowIntensity) => {
    const newFlow = selectedFlow === flow ? undefined : flow;
    setSelectedFlow(newFlow);
  };

  // Function to clear all current selections from the UI
  const handleClearSelections = () => {
    setSelectedMood(undefined);
    setSelectedSymptoms([]);
    setSelectedFlow(undefined);
    setSelectedSexoLibido([]);
  };

  // Handle saving the current selections
  const handleSave = () => {
    const originalFlow = originalLog?.flowIntensity;
    const isStartingPeriod =
      (!originalFlow || originalFlow === 'nenhum') &&
      selectedFlow &&
      selectedFlow !== 'nenhum';

    // Garante que o dia seja marcado como menstruação se houver fluxo
    let isPeriodDay = originalLog?.isPeriodDay;
    if (selectedFlow && selectedFlow !== 'nenhum') {
      isPeriodDay = true;
    } else if (selectedFlow === 'nenhum') {
      isPeriodDay = false;
    }

    // Save all selections together
    addOrUpdateDailyLog({
      date: selectedDate,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      flowIntensity: selectedFlow,
      sexoLibido: selectedSexoLibido,
      isPeriodDay: isPeriodDay,
    });
    
    // If a new period is starting, update the cycle
    if (isStartingPeriod) {
      startNewCycle(selectedDate);
    }
    
    toast({
      title: 'Registros salvos!',
      description: 'Suas anotações de hoje foram atualizadas.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Meus registros de hoje</CardTitle>
        <CardDescription className="!mt-0">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sexo e Libido Section */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">Sexo e Libido</h3>
          <div className="flex flex-wrap gap-2">
            {SEXO_LIBIDO_OPTIONS.map((option) => {
              const isSelected = selectedSexoLibido.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleSexoLibidoSelect(option.id)}
                  className={cn(
                    'flex items-center gap-2 pl-2 pr-3 py-2 rounded-full border-2 transition-all text-sm',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted/60 hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-lg',
                      isSelected ? 'bg-primary/20' : 'bg-background/80'
                    )}
                  >
                    {option.emoji}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Humor Section */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">Humor</h3>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => {
              // Legacy support for 'energizada'
              const isSelected = selectedMood === option.value || (option.value === 'energetica' && selectedMood === ('energizada' as any));
              return (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={cn(
                    'flex items-center gap-2 pl-2 pr-3 py-2 rounded-full border-2 transition-all text-sm',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted/60 hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-lg',
                       isSelected ? 'bg-primary/20' : 'bg-background/80'
                    )}
                  >
                    {option.emoji}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                       isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {option.label}
                  </span>
                   {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sintomas Section */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">
            Sintomas
          </h3>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((option) => {
              const isSelected = selectedSymptoms.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleSymptomSelect(option.id)}
                  className={cn(
                    'flex items-center gap-2 pl-2 pr-3 py-2 rounded-full border-2 transition-all text-sm',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted/60 hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-lg',
                      isSelected ? 'bg-primary/20' : 'bg-background/80'
                    )}
                  >
                    {option.emoji}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fluxo Section */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">Fluxo Menstrual</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FLOW_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFlowSelect(option.value)}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 transition-colors text-sm font-medium',
                  selectedFlow === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 border-transparent hover:bg-accent'
                )}
              >
                <option.Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t flex flex-col sm:flex-row gap-2">
          <Button onClick={handleSave} className="w-full font-bold h-12 text-base shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-5 w-5" />
            Salvar Registros
          </Button>
          <Button onClick={handleClearSelections} variant="ghost" className="w-full sm:w-auto text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
