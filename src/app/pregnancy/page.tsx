'use client';
// O 'use client' é necessário porque usamos hooks do React (useState) e lidamos
// com a interação do usuário no navegador, como cliques de botão e preenchimento de formulário.

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addDays, differenceInDays, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Baby, HeartPulse, Stethoscope, Carrot } from 'lucide-react';

// --- LÓGICA DE DADOS (Equivalente ao "script.js" em parte) ---

// Aqui, criamos um "mini banco de dados" com informações sobre o desenvolvimento do bebê.
// A chave (ex: 4) representa a semana de gestação.
const weeklyDevelopment: Record<number, string> = {
  4: 'O coração do seu bebê começa a se formar e a bater. É um pequeno tubo que em breve se tornará um órgão complexo.',
  5: 'O cérebro, a medula espinhal e outros órgãos principais começam a se formar. O embrião parece um pequeno girino.',
  6: 'Pequenos brotos que se tornarão braços e pernas aparecem. As características faciais, como olhos e narinas, começam a se desenvolver.',
  7: 'As mãos e os pés estão se formando, parecendo pequenas pás. O bebê já tem o tamanho de um mirtilo.',
  8: 'O bebê começa a se mover, embora você ainda não consiga sentir. Todos os órgãos essenciais já começaram a se formar.',
  12: 'Os órgãos genitais se formam e o bebê já tem o tamanho de um limão. As unhas começam a crescer.',
  16: 'O bebê pode fazer movimentos de sucção com a boca. O sistema esquelético está se desenvolvendo rapidamente.',
  20: 'Metade do caminho! Você pode sentir os primeiros movimentos do bebê (flutters). Ele agora pode ouvir sons.',
  24: 'O bebê tem chances de sobreviver se nascer prematuramente. Os pulmões estão se desenvolvendo, mas ainda não estão maduros.',
  28: 'O bebê abre os olhos pela primeira vez. Ele pode piscar e ver luz. Está começando a ganhar peso mais rapidamente.',
  32: 'O bebê pratica a respiração e todos os cinco sentidos estão funcionando. A camada de gordura sob a pele se torna mais espessa.',
  36: 'O bebê está "descendo" para a pelve, se preparando para o nascimento. O desenvolvimento pulmonar está quase completo.',
  40: 'Seu bebê está totalmente desenvolvido e pronto para nascer! Ele tem o tamanho de uma pequena abóbora.',
};

// Esta função busca a dica de desenvolvimento mais relevante para a semana atual.
// Se a semana exata não for encontrada, ela busca a mais próxima anterior.
const getDevelopmentTip = (week: number): string => {
  if (weeklyDevelopment[week]) {
    return weeklyDevelopment[week];
  }
  // Encontra a maior semana disponível que seja menor ou igual à semana atual.
  const availableWeeks = Object.keys(weeklyDevelopment).map(Number).sort((a, b) => b - a);
  const closestWeek = availableWeeks.find(w => w <= week);
  return closestWeek ? weeklyDevelopment[closestWeek] : 'Seu bebê está crescendo e se desenvolvendo a cada dia.';
};

// --- COMPONENTE REACT (Equivalente ao "HTML" e "JavaScript" juntos) ---

export default function PregnancyPage() {
  // --- ESTADO (State Management) ---
  // `useState` é um "gancho" (hook) do React para guardar informações que podem mudar.
  // É como criar variáveis cuja alteração faz a página se redesenhar automaticamente.

  // `lmpDate` (Last Menstrual Period): Guarda a data que a usuária insere. Inicia como uma string vazia.
  const [lmpDate, setLmpDate] = useState<string>('');

  // `pregnancyInfo`: Guarda os resultados do cálculo. Inicia como `null` (vazio).
  const [pregnancyInfo, setPregnancyInfo] = useState<{
    weeks: number;
    days: number;
    dueDate: string;
    developmentTip: string;
  } | null>(null);

  // --- FUNÇÕES (Lógica de Eventos) ---
  // Esta função será chamada quando a usuária clicar no botão "Calcular".
  const handleCalculatePregnancy = () => {
    // Converte a string de data (ex: '2023-10-27') em um objeto Date do JavaScript.
    // Adicionamos 'T00:00:00' para evitar problemas com fuso horário.
    const date = new Date(`${lmpDate}T00:00:00`);

    // Verifica se a data inserida é válida.
    if (!lmpDate || !isValid(date)) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    const today = new Date();

    // Cálculo 1: Dias totais de gestação
    // Calcula a diferença em dias entre hoje e a data da última menstruação.
    const totalDays = differenceInDays(today, date);
    if (totalDays < 0) {
      alert('A data da última menstruação não pode ser no futuro.');
      return;
    }

    // Cálculo 2: Semanas e dias
    // Divide os dias totais por 7 para obter as semanas completas.
    const weeks = Math.floor(totalDays / 7);
    // O resto da divisão nos dá os dias restantes.
    const days = totalDays % 7;

    // Cálculo 3: Data Provável do Parto (DPP)
    // A gestação humana dura em média 280 dias (40 semanas) a partir da DUM.
    const dueDate = addDays(date, 280);

    // Atualiza o estado `pregnancyInfo` com os novos resultados.
    // Isso fará com que a seção de resultados apareça na tela.
    setPregnancyInfo({
      weeks,
      days,
      // Formata a data para um formato legível, ex: "27 de julho de 2024".
      dueDate: format(dueDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      developmentTip: getDevelopmentTip(weeks),
    });
  };

  // --- RENDERIZAÇÃO (O que aparece na tela - Equivalente ao "HTML") ---
  // O código abaixo parece HTML, mas é JSX. O React o converterá em HTML real no navegador.
  // As classes CSS (ex: "p-4", "text-center") são do Tailwind CSS, que já está configurado no projeto.
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
            {/* 
              Este é o campo de entrada da data.
              - `value={lmpDate}`: O valor exibido é o que está no nosso estado `lmpDate`.
              - `onChange={e => setLmpDate(e.target.value)}`: Quando a usuária muda a data,
                atualizamos o estado `lmpDate` com o novo valor.
            */}
            <Input
              id="lmp"
              type="date"
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              className="text-center"
            />
          </div>
          {/* 
            Este é o botão de cálculo.
            - `onClick={handleCalculatePregnancy}`: Quando clicado, ele chama a nossa função
              de cálculo que definimos acima.
          */}
          <Button onClick={handleCalculatePregnancy} className="w-full max-w-sm">Calcular Gravidez</Button>
        </CardContent>
      </Card>

      {/* --- Seção de Resultados --- */}
      {/* 
        Esta é uma renderização condicional. O conteúdo dentro de `pregnancyInfo && (...)`
        só será exibido na tela se `pregnancyInfo` não for `null`, ou seja, após um cálculo bem-sucedido.
      */}
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

          {/* Card 3: Desenvolvimento do Bebê */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Seu bebê na semana {pregnancyInfo.weeks}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{pregnancyInfo.developmentTip}</p>
            </CardContent>
          </Card>

          {/* Card 4: Dicas de Saúde (Conteúdo estático) */}
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
