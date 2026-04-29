'use client';
// O 'use client' é necessário porque usamos hooks do React (useState) e lidamos
// com a interação do usuário no navegador, como cliques de botão e preenchimento de formulário.

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addDays, differenceInDays, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Baby, HeartPulse, Stethoscope, Carrot, PartyPopper } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { BabySizeCard } from '@/components/baby-size-card';

// --- LÓGICA DE DADOS (Equivalente ao "script.js" em parte) ---

// BANCO DE DADOS 1: Dicas sobre o desenvolvimento do bebê por semana.
const weeklyDevelopment: Record<number, string> = {
  4: 'O coração do seu bebê começa a se formar e a bater. É um pequeno tubo que em breve se tornará um órgão complexo.',
  5: 'O cérebro, a medula espinhal e outros órgãos principais começam a se formar. O embrião parece um pequeno girino.',
  6: 'Pequenos brotos que se tornarão braços e pernas aparecem. As características faciais, como olhos e narinas, começam a se desenvolver.',
  7: 'As mãos e os pés estão se formando, parecendo pequenas pás. O desenvolvimento dos órgãos internos continua.',
  8: 'O bebê começa a se mover, embora você ainda não consiga sentir. Todos os órgãos essenciais já começaram a se formar.',
  12: 'Os órgãos genitais se formam e as unhas começam a crescer. Os reflexos do bebê estão se desenvolvendo.',
  16: 'O bebê pode fazer movimentos de sucção com a boca. O sistema esquelético está se desenvolvendo rapidamente.',
  20: 'Metade do caminho! Você pode sentir os primeiros movimentos do bebê (flutters). Ele agora pode ouvir sons.',
  24: 'O bebê tem chances de sobreviver se nascer prematuramente. Os pulmões estão se desenvolvendo, mas ainda não estão maduros.',
  28: 'O bebê abre os olhos pela primeira vez. Ele pode piscar e ver luz. Está começando a ganhar peso mais rapidamente.',
  32: 'O bebê pratica a respiração e todos os cinco sentidos estão funcionando. A camada de gordura sob a pele se torna mais espessa.',
  36: 'O bebê está "descendo" para a pelve, se preparando para o nascimento. O desenvolvimento pulmonar está quase completo.',
  40: 'Seu bebê está totalmente desenvolvido e pronto para nascer!',
};

// FUNÇÃO 1: Busca a dica de desenvolvimento mais relevante para a semana atual.
const getDevelopmentTip = (week: number): string => {
  if (weeklyDevelopment[week]) {
    return weeklyDevelopment[week];
  }
  const availableWeeks = Object.keys(weeklyDevelopment).map(Number).sort((a, b) => b - a);
  const closestWeek = availableWeeks.find(w => w <= week);
  return closestWeek ? weeklyDevelopment[closestWeek] : 'Seu bebê está crescendo e se desenvolvendo a cada dia.';
};

type PregnancyInfo = {
  weeks: number;
  days: number;
  dueDate: string;
  developmentTip: string;
  isComplete: boolean;
};

// --- COMPONENTE REACT (Equivalente ao "HTML" e "JavaScript" juntos) ---

export default function PregnancyPage() {
  const { pregnancyLmpDate, updatePregnancyLmpDate } = useCycleData();
  const [lmpDate, setLmpDate] = useState<string>('');
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null);

  // Função central para calcular e atualizar o estado da gravidez
  const calculatePregnancy = (dateStr: string) => {
    // Analisa a string da data para garantir que seja tratada no fuso horário local,
    // o que evita erros de contagem de dias.
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado no JS
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    if (!dateStr || !isValid(date)) {
        setPregnancyInfo(null);
        return;
    }

    const today = new Date();
    // A diferença em dias agora é consistente, pois ambas as datas estão no mesmo fuso horário.
    const totalDays = differenceInDays(today, date);
    
    if (totalDays < 0) {
        setPregnancyInfo(null);
        return;
    }

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    const dueDate = addDays(date, 280); // 280 dias = 40 semanas
    const isComplete = weeks >= 40;

    setPregnancyInfo({
      weeks,
      days,
      dueDate: format(dueDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      developmentTip: getDevelopmentTip(weeks),
      isComplete,
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
    const date = new Date(`${lmpDate}T00:00:00`);

    if (!lmpDate || !isValid(date)) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    const today = new Date();
    if (differenceInDays(today, date) < 0) {
      alert('A data da última menstruação não pode ser no futuro.');
      return;
    }
    
    // Salva a data no contexto para persistência
    updatePregnancyLmpDate(lmpDate);
    // Roda o cálculo com a nova data
    calculatePregnancy(lmpDate);
  };

  // --- RENDERIZAÇÃO (O que aparece na tela) ---
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
          {/* Card 2: Resultados do Cálculo */}
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
          
          {!pregnancyInfo.isComplete && <BabySizeCard week={pregnancyInfo.weeks} />}
          
          {/* Card 3: Desenvolvimento do Bebê ou Parabéns */}
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
                <p className="text-muted-foreground">Seu bebê já nasceu ou está prestes a nascer. Nesta fase final, ele(a) está totalmente desenvolvido(a) e pronto(a) para encontrar você!</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-semibold text-foreground text-sm">{pregnancyInfo.developmentTip}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Desenvolvimento na semana {pregnancyInfo.weeks}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{pregnancyInfo.developmentTip}</p>
              </CardContent>
            </Card>
          )}

          {/* Card 4: Dicas de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas de Saúde para a Gestante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Stethoscope className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Faça o pré-natal</h4>
                  <p className="text-sm text-muted-foreground">É fundamental para a sua saúde e a do bebê. Siga todas as consultas e exames recomendados.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Carrot className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Alimentação Saudável</h4>
                  <p className="text-sm text-muted-foreground">Consuma frutas, vegetais e proteínas. Beba bastante água e evite alimentos crus ou não pasteurizados.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <HeartPulse className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Exames Importantes</h4>
                  <p className="text-sm text-muted-foreground">Ultrassons, exames de sangue e outros testes são cruciais para monitorar o desenvolvimento do bebê.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
