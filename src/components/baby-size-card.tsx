'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Ruler } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface BabySizeCardProps {
  week: number;
}

// Mapeia semanas de gravidez para um tamanho de referência (fruta/semente)
const weekToSizeMap: Record<number, { id: string; name: string }> = {
  4: { id: 'poppy-seed', name: 'uma semente de papoula' },
  5: { id: 'poppy-seed', name: 'uma semente de papoula' },
  6: { id: 'lentil-grain', name: 'um grão de lentilha' },
  7: { id: 'lentil-grain', name: 'um grão de lentilha' },
  8: { id: 'bean', name: 'um feijão' },
  9: { id: 'bean', name: 'um feijão' },
  10: { id: 'olive', name: 'uma azeitona' },
  11: { id: 'olive', name: 'uma azeitona' },
  12: { id: 'lemon', name: 'um limão' },
  13: { id: 'lemon', name: 'um limão' },
  14: { id: 'lemon', name: 'um limão' },
  15: { id: 'avocado', name: 'um abacate' },
  16: { id: 'avocado', name: 'um abacate' },
  17: { id: 'avocado', name: 'um abacate' },
  18: { id: 'avocado', name: 'um abacate' },
  19: { id: 'banana', name: 'uma banana' },
  20: { id: 'banana', name: 'uma banana' },
  21: { id: 'banana', name: 'uma banana' },
  22: { id: 'banana', name: 'uma banana' },
  23: { id: 'corn-cob', name: 'uma espiga de milho' },
  24: { id: 'corn-cob', name: 'uma espiga de milho' },
  25: { id: 'corn-cob', name: 'uma espiga de milho' },
  26: { id: 'corn-cob', name: 'uma espiga de milho' },
  27: { id: 'coconut', name: 'um coco' },
  28: { id: 'coconut', name: 'um coco' },
  29: { id: 'coconut', name: 'um coco' },
  30: { id: 'coconut', name: 'um coco' },
  31: { id: 'papaya', name: 'um mamão papaya' },
  32: { id: 'papaya', name: 'um mamão papaya' },
  33: { id: 'papaya', name: 'um mamão papaya' },
  34: { id: 'papaya', name: 'um mamão papaya' },
  35: { id: 'pumpkin', name: 'uma abóbora pequena' },
  36: { id: 'pumpkin', name: 'uma abóbora pequena' },
  37: { id: 'pumpkin', name: 'uma abóbora pequena' },
  38: { id: 'pumpkin', name: 'uma abóbora pequena' },
  39: { id: 'pumpkin', name: 'uma abóbora pequena' },
  40: { id: 'pumpkin', name: 'uma abóbora pequena' },
};


// Encontra a melhor correspondência de tamanho para a semana atual
const getSizeForWeek = (week: number): { image: ImagePlaceholder; name: string } | null => {
  if (weekToSizeMap[week]) {
    const sizeInfo = weekToSizeMap[week];
    const image = PlaceHolderImages.find(img => img.id === sizeInfo.id);
    return image ? { image, name: sizeInfo.name } : null;
  }
  
  // Se a semana exata não for encontrada, encontra a maior semana disponível que seja menor ou igual à atual
  const availableWeeks = Object.keys(weekToSizeMap).map(Number).sort((a, b) => b - a);
  const closestWeek = availableWeeks.find(w => w <= week);
  
  if (closestWeek) {
      const sizeInfo = weekToSizeMap[closestWeek];
      const image = PlaceHolderImages.find(img => img.id === sizeInfo.id);
      return image ? { image, name: sizeInfo.name } : null;
  }

  return null;
};


export function BabySizeCard({ week }: BabySizeCardProps) {
  const sizeData = getSizeForWeek(week);

  if (!sizeData) {
    return null; // Não renderiza nada se não houver dados de tamanho para a semana
  }

  const { image, name } = sizeData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Tamanho do Bebê
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-32 w-32">
            <Image 
                src={image.imageUrl} 
                alt={image.description}
                fill
                className="rounded-full object-cover"
                data-ai-hint={image.imageHint}
            />
        </div>
        <p className="text-muted-foreground">
          Nesta semana, seu bebê tem o tamanho aproximado de <span className="font-bold text-foreground">{name}</span>.
        </p>
      </CardContent>
    </Card>
  );
}
