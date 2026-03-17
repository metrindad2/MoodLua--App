import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Lightbulb } from 'lucide-react';

interface PhaseTipsProps {
  phase: string;
}

const tipsData: Record<string, string[]> = {
  Folicular: ['Energia em alta', 'Bom para criatividade', 'Foco em novos projetos'],
  Menstrual: ['Descanse e recupere', 'Bebidas quentes podem ajudar', 'Atividades leves são bem-vindas'],
  'Fértil': ['Pico de energia', 'Ótimo para socializar', 'Atividades físicas intensas'],
  'TPM / Lútea': ['Priorize o autocuidado', 'Reduza o consumo de cafeína', 'Permita-se sentir'],
};

export function PhaseTips({ phase }: PhaseTipsProps) {
  const phaseTips = tipsData[phase as keyof typeof tipsData] || tipsData['Folicular'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md">
          <Lightbulb className="w-5 h-5 text-primary" />
          Dicas para a fase {phase}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {phaseTips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}
