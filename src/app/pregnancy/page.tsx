'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addDays, differenceInDays, format, isValid, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Baby, HeartPulse, Stethoscope, Carrot, PartyPopper, Ruler } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import pregnancyData from '@/lib/pregnancy-data.json';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

// Define a interface para os dados de cada semana
interface WeekData {
  semana: number;
  tamanho: string;
  fruta: string;
  imagemId: string | null;
  descricao: string;
  dicas: string[];
}

// Define a interface para as informações de gravidez
type PregnancyInfo = {
  weeks: number;
  days: number;
  dueDate: string;
  isComplete: boolean;
  weekData: WeekData | null;
  image: ImagePlaceholder | null;
};

// Carrega o JSON de dados da gravidez
const weeklyData: Record<string, WeekData> = pregnancyData;

// Função para buscar os dados da semana mais relevante
const getWeekData = (week: number): WeekData | null => {
  if (weeklyData[week.toString()]) {
    return weeklyData[week.toString()];
  }
  // Fallback para a maior semana disponível menor que a atual
  const availableWeeks = Object.keys(weeklyData).map(Number).sort((a, b) => b - a);
  const closestWeekKey = availableWeeks.find(w => w <= week);
  return closestWeekKey ? weeklyData[closestWeekKey.toString()] : null;
};


export default function PregnancyPage() {
  const { pregnancyLmpDate, updatePregnancyLmpDate } = useCycleData();
  const [lmpDate, setLmpDate] = useState<string>('');
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null);

  // Função central para calcular e atualizar o estado da gravidez
  const calculatePregnancy = (dateStr: string) => {
    const date = startOfDay(new Date(dateStr + 'T00:00:00'));

    if (!dateStr || !isValid(date)) {
        setPregnancyInfo(null);
        return;
    }

    const today = startOfDay(new Date());
    const totalDays = differenceInDays(today, date);
    
    if (totalDays < 0) {
        setPregnancyInfo(null);
        return;
    }

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    const dueDate = addDays(date, 280);
    const isComplete = weeks >= 40;

    const currentWeekData = getWeekData(weeks);
    const image = currentWeekData?.imagemId ? PlaceHolderImages.find(img => img.id === currentWeekData.imagemId) : null;


    setPregnancyInfo({
      weeks,
      days,
      dueDate: format(dueDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      isComplete,
      weekData: currentWeekData || null,
      image: image || null
    });
  };

  // Efeito que roda uma vez para carregar a data salva do contexto
  useEffect(() => {
    if (pregnancyLmpDate) {
      setLmpDate(pregnancyLmpDate);
      calculatePregnancy(pregnancyLmpDate);
    }
  }, [pregnancyLmpDate]);


  // Função chamada pelo botão "Calcular"
  const handleCalculatePregnancy = () => {
    const date = startOfDay(new Date(lmpDate + 'T00:00:00'));

    if (!lmpDate || !isValid(date)) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    const today = startOfDay(new Date());
    if (differenceInDays(today, date) < 0) {
      alert('A data da última menstruação não pode ser no futuro.');
      return;
    }
    
    updatePregnancyLmpDate(lmpDate);
    calculatePregnancy(lmpDate);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Card 1: Calculadora de Gravidez */}
      <Card className="bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Baby className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Acompanhamento de Gravidez
          </CardTitle>
          <CardDescription className="text-center pt-2">
            Insira a data do primeiro dia da sua última menstruação (DUM) para começar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-sm flex flex-col gap-2">
            <label htmlFor="lmp" className="text-sm font-medium text-muted-foreground">Data da Última Menstruação</label>
            <Input
              id="lmp"
              type="date"
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              className="text-center"
            />
          </div>
          <Button onClick={handleCalculatePregnancy} className="w-full max-w-sm">Calcular Gravidez</Button>
        </CardContent>
      </Card>

      {/* --- Seção de Resultados --- */}
      {pregnancyInfo && (
        <div className="space-y-6 animate-in fade-in-50">
          
          {/* Card 2: Resumo da Gestação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center text-primary">Resumo da sua Gestação</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <p className="text-muted-foreground">Você está com</p>
                <p className="text-3xl font-bold">
                  {pregnancyInfo.weeks} semanas e {pregnancyInfo.days} {pregnancyInfo.days === 1 ? 'dia' : 'dias'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Data provável do parto</p>
                <p className="text-2xl font-bold">{pregnancyInfo.dueDate}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Card 3: Tamanho do Bebê */}
          {pregnancyInfo.weekData && pregnancyInfo.image && !pregnancyInfo.isComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-primary" />
                    Tamanho do Bebê na semana {pregnancyInfo.weeks}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="relative h-32 w-32 shrink-0">
                    <Image 
                        src={pregnancyInfo.image.imageUrl} 
                        alt={pregnancyInfo.image.description}
                        fill
                        className="rounded-full object-cover"
                        data-ai-hint={pregnancyInfo.image.imageHint}
                    />
                </div>
                <div className='space-y-2'>
                  <p className="text-muted-foreground">
                    Seu bebê tem o tamanho aproximado de <span className="font-bold text-foreground">um(a) {pregnancyInfo.weekData.fruta}</span>.
                  </p>
                  <p className='font-bold text-2xl text-primary'>{pregnancyInfo.weekData.tamanho}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 4: Desenvolvimento e Dicas */}
          {pregnancyInfo.isComplete ? (
             <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <PartyPopper className="w-6 h-6 text-primary" />
                  Parabéns!
                </CardTitle>
                <CardDescription>
                    A jornada chegou ao seu lindo final!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{pregnancyInfo.weekData?.descricao || 'Seu bebê está pronto para nascer!'}</p>
              </CardContent>
            </Card>
          ) : pregnancyInfo.weekData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Desenvolvimento do Bebê
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pregnancyInfo.weekData.descricao}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dicas de Saúde para a Mamãe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pregnancyInfo.weekData.dicas.map((dica, index) => {
                      const icons: Record<string, React.ElementType> = {
                          "pré-natal": Stethoscope,
                          "alimentação": Carrot,
                          "exames": HeartPulse,
                      };
                      const keyword = Object.keys(icons).find(key => dica.toLowerCase().includes(key)) || "default";
                      const Icon = icons[keyword] || HeartPulse;

                      return (
                          <div key={index} className="flex items-start gap-4">
                              <Icon className="w-6 h-6 text-primary shrink-0 mt-1" />
                              <p className="text-sm text-muted-foreground">{dica}</p>
                          </div>
                      );
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
