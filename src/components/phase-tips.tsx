import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PhaseTipsProps {
  phase: string;
}

const tipsData: Record<string, string[]> = {
  Folicular: ['Sua energia está aumentando.', 'Ótimo momento para iniciar projetos.', 'Experimente novos treinos.'],
  Menstruação: ['Descanse e recupere as energias.', 'Bebidas quentes podem trazer conforto.', 'Atividades leves são bem-vindas.'],
  'Fértil': ['Você está no pico de energia e sociabilidade.', 'Excelente para atividades em grupo.', 'Aproveite a sua fertilidade em alta.'],
  'TPM / Lútea': ['Priorize o autocuidado e momentos relaxantes.', 'Reduza o consumo de cafeína e sal.', 'Permita-se sentir e acolha suas emoções.'],
};

export function PhaseTips({ phase }: PhaseTipsProps) {
  const phaseTips = tipsData[phase as keyof typeof tipsData] || tipsData['Folicular'];
  
  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Dicas para a fase {phase}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
              {phaseTips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
        </CardContent>
    </Card>
  );
}
