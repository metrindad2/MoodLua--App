'use client';
// O 'use client' é necessário porque usamos hooks do React (useState) e lidamos
// com a interação do usuário no navegador, como cliques de botão e preenchimento de formulário.

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addDays, differenceInDays, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Importa o novo ícone 'Ruler' para a seção de tamanho
import { Baby, HeartPulse, Stethoscope, Carrot, Ruler } from 'lucide-react';

// --- LÓGICA DE DADOS (Equivalente ao "script.js" em parte) ---

// BANCO DE DADOS 1: Dicas sobre o desenvolvimento do bebê por semana.
// Foco no que está acontecendo (formação de órgãos, etc.), sem mencionar o tamanho.
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

// BANCO DE DADOS 2: Comparações de tamanho do bebê por semana.
// Foco apenas na comparação visual com frutas e objetos.
const weeklySizeComparison: Record<number, string> = {
    4: 'um grão de papoula',
    6: 'um grão de lentilha',
    8: 'um feijão',
    10: 'uma azeitona',
    12: 'um limão',
    16: 'um abacate',
    20: 'uma banana',
    24: 'uma espiga de milho',
    30: 'um coco',
    36: 'um mamão',
    40: 'uma pequena abóbora',
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

// FUNÇÃO 2: Busca a comparação de tamanho para a semana atual.
const getSizeComparison = (week: number): string | null => {
  if (weeklySizeComparison[week]) {
    return weeklySizeComparison[week];
  }
  const availableWeeks = Object.keys(weeklySizeComparison).map(Number).sort((a, b) => b - a);
  const closestWeek = availableWeeks.find(w => w <= week);
  return closestWeek ? weeklySizeComparison[closestWeek] : null;
};

// --- COMPONENTE REACT (Equivalente ao "HTML" e "JavaScript" juntos) ---

export default function PregnancyPage() {
  // --- ESTADO (State Management) ---
  const [lmpDate, setLmpDate] = useState<string>('');

  // Atualiza o estado para incluir a nova informação de 'sizeComparison'.
  const [pregnancyInfo, setPregnancyInfo] = useState<{
    weeks: number;
    days: number;
    dueDate: string;
    developmentTip: string;
    sizeComparison: string | null;
  } | null>(null);

  // --- FUNÇÕES (Lógica de Eventos) ---
  const handleCalculatePregnancy = () => {
    const date = new Date(`${lmpDate}T00:00:00`);

    if (!lmpDate || !isValid(date)) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    const today = new Date();
    const totalDays = differenceInDays(today, date);

    if (totalDays < 0) {
      alert('A data da última menstruação não pode ser no futuro.');
      return;
    }

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    const dueDate = addDays(date, 280);

    // Atualiza o estado com todos os dados, incluindo a nova comparação de tamanho.
    setPregnancyInfo({
      weeks,
      days,
      dueDate: format(dueDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      developmentTip: getDevelopmentTip(weeks),
      sizeComparison: getSizeComparison(weeks), // Adiciona o tamanho do bebê
    });
  };

  // --- RENDERIZAÇÃO (O que aparece na tela - Equivalente ao "HTML") ---
  return (
    <div className="p-4 space-y-6">
      {/* Card 1: Calculadora de Gravidez (sem alterações) */}
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
          {/* Card 2: Resultados do Cálculo (sem alterações) */}
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
          
          {/* --- NOVO CARD: Tamanho do Bebê --- */}
          {/* Este card só aparece se existir uma comparação de tamanho para a semana atual */}
          {pregnancyInfo.sizeComparison && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-accent" />
                  Tamanho do Bebê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nesta semana, seu bebê está aproximadamente do tamanho de{' '}
                  <span className="font-semibold text-foreground">{pregnancyInfo.sizeComparison}</span>.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Desenvolvimento do Bebê (agora focado apenas no desenvolvimento) */}
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

          {/* Card 4: Dicas de Saúde (sem alterações) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas de Saúde para a Gestante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Stethoscope className="w-6 h-6 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Faça o pré-natal</h4>
                  <p className="text-sm text-muted-foreground">É fundamental para a sua saúde e a do bebê. Siga todas as consultas e exames recomendados.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Carrot className="w-6 h-6 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Alimentação Saudável</h4>
                  <p className="text-sm text-muted-foreground">Consuma frutas, vegetais e proteínas. Beba bastante água e evite alimentos crus ou não pasteurizados.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <HeartPulse className="w-6 h-6 text-accent shrink-0 mt-1" />
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

/*
COMO ESTE CÓDIGO SE INTEGRA AO RESTO DO APLICATIVO?

1. Roteamento: O arquivo está em `src/app/pregnancy/page.tsx`. O sistema de roteamento do Next.js
   automaticamente cria a página no endereço `/pregnancy`.

2. Navegação: O componente `src/components/app-shell.tsx` já tem um link na barra de navegação
   inferior que aponta para `/pregnancy`. É por isso que o botão "Gravidez" já funciona.

3. Estilos: Os componentes como `<Card>`, `<Button>` e as classes como `p-4` vêm do sistema
   de design (ShadCN e Tailwind CSS) do projeto. Isso garante que a nova aba tenha a mesma
   aparência do restante do aplicativo.

4. Lógica (JavaScript): Toda a lógica de cálculo e interação está contida neste mesmo arquivo,
   usando os recursos do React (`useState`, `onClick`, etc.). Isso mantém o código organizado
   e específico para esta funcionalidade.
*/
