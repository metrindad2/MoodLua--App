'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { useCycleData } from '@/context/cycle-data-context';
import { DailyLog, Mood } from '@/lib/types';
import { Plus, Droplets, Smile, Annoyed, Frown, HeartPulse, Brain, Zap, BatteryLow, Meh } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const symptomsOptions = [
  { id: 'colicas', label: 'Cólicas' },
  { id: 'dor_de_cabeca', label: 'Dor de Cabeça' },
  { id: 'acne', label: 'Acne' },
  { id: 'inchaco', label: 'Inchaço' },
];

const moodOptions: { value: Mood, label: string, icon: React.ElementType }[] = [
    { value: 'feliz', label: 'Feliz', icon: Smile },
    { value: 'neutra', label: 'Neutra', icon: Meh },
    { value: 'triste', label: 'Triste', icon: Frown },
    { value: 'irritada', label: 'Irritada', icon: Annoyed },
    { value: 'ansiosa', label: 'Ansiosa', icon: Brain },
    { value: 'energizada', label: 'Energizada', icon: Zap },
    { value: 'cansada', label: 'Cansada', icon: BatteryLow },
];

export default function LogEntryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addOrUpdateDailyLog, getLogForDate } = useCycleData();
  const { toast } = useToast();
  
  const today = new Date();
  const existingLog = getLogForDate(today);

  // Estados para os campos do formulário
  const [flow, setFlow] = useState(existingLog?.flowIntensity || 'nenhum');
  const [symptoms, setSymptoms] = useState<string[]>(existingLog?.symptoms?.filter(s => symptomsOptions.some(so => so.id === s)) || []);
  const [otherSymptoms, setOtherSymptoms] = useState(existingLog?.symptoms?.filter(s => !symptomsOptions.some(so => so.id === s)).join(', ') || '');
  const [mood, setMood] = useState<Mood | undefined>(existingLog?.mood);


  const handleSave = () => {
    const allSymptoms = [...symptoms];
    if (otherSymptoms.trim()) {
      // Adiciona outros sintomas, separando por vírgula
      allSymptoms.push(...otherSymptoms.split(',').map(s => s.trim()).filter(Boolean));
    }

    const log: Omit<DailyLog, 'date'> & { date: Date } = {
      date: today,
      flowIntensity: flow as DailyLog['flowIntensity'],
      symptoms: allSymptoms,
      mood: mood,
    };
    
    addOrUpdateDailyLog(log);
    toast({
        title: "Registro Salvo!",
        description: "Suas informações de hoje foram atualizadas.",
    })
    setIsOpen(false);
  };
  
  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    setSymptoms(prev => 
      checked ? [...prev, symptomId] : prev.filter(s => s !== symptomId)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Registrar Hoje
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registro do dia</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Fluxo Menstrual */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" />Fluxo Menstrual</Label>
            <RadioGroup value={flow} onValueChange={setFlow} className="flex space-x-2">
              {['nenhum', 'leve', 'médio', 'intenso'].map(value => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`flow-${value}`} />
                  <Label htmlFor={`flow-${value}`} className="capitalize">{value}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Humor */}
           <div className="space-y-3">
            <Label className="flex items-center gap-2"><Smile className="h-4 w-4 text-primary" />Humor</Label>
            <RadioGroup value={mood} onValueChange={(v) => setMood(v as Mood)} className="grid grid-cols-4 gap-2">
                {moodOptions.map(option => (
                    <Label
                      key={option.value}
                      htmlFor={`mood-${option.value}`}
                      className={`flex flex-col items-center justify-center p-2 border rounded-md cursor-pointer transition-colors ${mood === option.value ? 'bg-primary/20 border-primary' : 'hover:bg-accent/10'}`}
                    >
                      <RadioGroupItem value={option.value} id={`mood-${option.value}`} className="sr-only" />
                      <option.icon className="w-6 h-6 mb-1" />
                      <span className="text-xs text-center">{option.label}</span>
                    </Label>
                ))}
            </RadioGroup>
          </div>

          {/* Sintomas */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" />Sintomas</Label>
            <div className="grid grid-cols-2 gap-2">
              {symptomsOptions.map(symptom => (
                <div key={symptom.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={symptom.id} 
                    checked={symptoms.includes(symptom.id)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom.id, !!checked)}
                  />
                  <Label htmlFor={symptom.id}>{symptom.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Outros Sintomas */}
          <div className="space-y-2">
            <Label htmlFor="other-symptoms">Outros Sintomas</Label>
            <Textarea 
              id="other-symptoms" 
              placeholder="Ex: Fadiga, náusea..."
              value={otherSymptoms}
              onChange={(e) => setOtherSymptoms(e.target.value)}
            />
          </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
