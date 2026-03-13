'use client';
import { useCycleData } from '@/context/cycle-data-context';
import { DailyLog, Mood } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Droplets, CalendarIcon } from 'lucide-react';
import { MOOD_OPTIONS } from '@/lib/moods';
import { SYMPTOM_OPTIONS } from '@/lib/symptoms';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { SimpleCalendar } from './simple-calendar';
import { Button } from './ui/button';

const flowOptions: { value: DailyLog['flowIntensity']; label: string }[] = [
    { value: 'nenhum', label: 'Nenhum' },
    { value: 'leve', label: 'Leve' },
    { value: 'médio', label: 'Médio' },
    { value: 'intenso', label: 'Intenso' },
];


export function DailyTracker() {
  const { getLogForDate, addOrUpdateDailyLog } = useCycleData();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<DailyLog['flowIntensity']>();
  
  // Carrega o log do dia sempre que a data selecionada ou os logs no contexto mudarem.
  useEffect(() => {
    const log = getLogForDate(selectedDate);
    setSelectedMood(log?.mood);
    setSelectedSymptoms(log?.symptoms || []);
    setSelectedFlow(log?.flowIntensity);
  }, [selectedDate, getLogForDate]);

  const handleFlowSelect = (flow: DailyLog['flowIntensity']) => {
    const newFlow = selectedFlow === flow ? undefined : flow;
    setSelectedFlow(newFlow);
    addOrUpdateDailyLog({ date: selectedDate, flowIntensity: newFlow });
  };

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
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Seu registro diário</h2>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                  <Button
                    variant={'ghost'}
                    className={cn(
                      'justify-start text-left font-normal text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <SimpleCalendar
                  initialDate={selectedDate}
                  selectedDate={selectedDate}
                  onDateClick={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
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
