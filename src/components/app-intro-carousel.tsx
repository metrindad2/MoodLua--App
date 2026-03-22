'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Droplet, NotebookText, Heart } from 'lucide-react';

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
    icon: Heart,
    title: 'Botão de Emergência SOS',
    description:
      'Envie um alerta com sua localização para contatos de confiança em situações de risco.',
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
                  <feature.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-2 sm:-left-4" />
      <CarouselNext className="-right-2 sm:-right-4" />
    </Carousel>
  );
}
