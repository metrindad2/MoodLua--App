'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Heart, HelpCircle } from 'lucide-react';

export default function SOSPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Botão de Emergência SOS
          </CardTitle>
          <CardDescription className="pt-2">
            Para sua segurança, um botão de emergência em formato de coração{' '}
            <Heart className="inline h-4 w-4" /> está sempre visível no canto
            inferior direito da tela.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            Dê **dois toques rápidos** no botão de coração para abrir as opções
            de emergência a qualquer momento, em qualquer tela do aplicativo.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Você pode configurar seus contatos de emergência e a mensagem na
            página de Ajustes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
