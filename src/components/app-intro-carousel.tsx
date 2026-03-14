'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Droplet, Heart, NotebookText } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Droplet,
    title: 'Acompanhe seu Ciclo',
    description:
      'Veja previsões da sua menstruação, período fértil e TPM de forma clara e visual.',
  },
  {
    icon: NotebookText,
    title: 'Registre seu Dia a Dia',
    description:
      'Anote seu humor, sintomas e fluxo para entender melhor seu corpo.',
  },
  {
    icon: BrainCircuit,
    title: 'Receba Insights com IA',
    description:
      'Nossa inteligência artificial analisa seus dados e gera dicas personalizadas para você.',
  },
  {
    icon: Heart,
    title: 'Função SOS de Segurança',
    description:
      'Em uma emergência, envie sua localização para contatos de confiança com um único toque.',
  },
];

export function AppIntroCarousel() {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full max-w-sm sm:max-w-md"
    >
      <CarouselContent>
        {features.map((feature, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-4 text-center">
                  <feature.icon className="h-10 w-10 text-white/90" />
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/80">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="border-white/20 bg-white/10 text-white hover:bg-white/20 -left-2 sm:-left-4" />
      <CarouselNext className="border-white/20 bg-white/10 text-white hover:bg-white/20 -right-2 sm:-right-4" />
    </Carousel>
  );
}
