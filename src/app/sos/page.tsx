'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Phone, Share2, ShieldAlert } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COUNTDOWN_SECONDS = 5;

export default function SOSPage() {
  const { sosSettings } = useCycleData();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Countdown timer effect to automatically cancel confirmation
  useEffect(() => {
    if (!isConfirming) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }

    if (countdown === 0) {
      setIsConfirming(false);
      toast({
        title: 'SOS Cancelado',
        description: 'A ação de emergência foi cancelada.',
      })
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isConfirming, countdown, toast]);
  
  const triggerShare = useCallback(async () => {
    setIsConfirming(false);
    toast({ title: 'Acionando Contatos', description: 'Preparando mensagem para compartilhar...' });
    
    // Check for geolocation permission first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `${sosSettings.emergencyMessage}\nMinha localização: ${locationUrl}`;

        // Try to share via Web Share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Pedido de Ajuda Urgente!',
              text: message,
            });
            toast({ title: 'Alerta Compartilhado', description: 'Sua mensagem e localização foram enviadas.' });
          } catch (error) {
             if ((error as DOMException).name !== 'AbortError') {
                toast({ title: 'Falha no Envio', description: 'Não foi possível compartilhar a mensagem.', variant: 'destructive'});
             } else {
                toast({ title: 'Envio Cancelado', description: 'Você cancelou o compartilhamento.' });
             }
          }
        } else {
            toast({ title: 'Função não suportada', description: 'Seu navegador não suporta o compartilhamento automático.', variant: 'destructive'});
        }
      },
      () => {
        // Geolocation failed
        toast({
          title: 'Erro de Localização',
          description: 'Não foi possível obter sua localização. Tente acionar os contatos manualmente.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [sosSettings, toast]);


  const callPolice = useCallback(() => {
    setIsConfirming(false);
    toast({ title: 'Ligando para Emergência', description: `Iniciando chamada para ${sosSettings.policeNumber}`});
    window.location.href = `tel:${sosSettings.policeNumber}`;
  }, [sosSettings, toast]);

  const handleHeartClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
    } else {
      // This is the second tap, triggers the sharing action
      triggerShare();
    }
  };

  // Confirmation Screen UI
  if (isConfirming) {
    const circumference = 2 * Math.PI * 88; // 2 * pi * r
    const strokeDashoffset = circumference * (1 - (countdown / COUNTDOWN_SECONDS));

    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in-25">
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-48 h-48" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" stroke="hsl(var(--muted))" strokeWidth="8" fill="transparent" />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <Button
                    onClick={handleHeartClick}
                    className="rounded-full h-28 w-28 bg-primary/20 hover:bg-primary/30"
                    aria-label="Confirmar SOS"
                    >
                    <Heart className="h-20 w-20 text-primary fill-primary" />
                </Button>
            </div>
        </div>

        <div className="text-center">
            <p className="font-semibold text-lg text-primary">Toque no coração para confirmar</p>
            <p className="text-muted-foreground">Ação será cancelada em <span className="font-bold text-foreground">{countdown}</span>s</p>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 pt-4">
            <Button onClick={callPolice} variant="destructive" className="w-full text-md py-6">
                <Phone className="mr-2" />
                Ligar {sosSettings.policeNumber}
            </Button>
            <Button onClick={triggerShare} variant="secondary" className="w-full text-md py-6">
                <Share2 className="mr-2" />
                Contatos
            </Button>
        </div>
      </div>
    );
  }

  // Initial Screen UI
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full bg-transparent border-0 shadow-none">
        <CardHeader>
          <div className="flex justify-center items-center flex-col gap-2">
            <ShieldAlert className="h-10 w-10 text-primary" />
            <CardTitle className="text-primary text-3xl font-bold">Emergência SOS</CardTitle>
          </div>
          <CardDescription className="pt-2">
            Pressione o coração para ativar o modo de emergência.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
            <Button
              onClick={handleHeartClick}
              className="rounded-full h-48 w-48 shadow-lg shadow-primary/10 transform transition-all duration-300 ease-in-out hover:scale-105 bg-primary/10 text-primary hover:bg-primary/20"
              aria-label={'Botão de Emergência SOS'}
            >
              <Heart className="h-32 w-32 fill-primary/20" />
            </Button>
            <p className="mt-6 text-muted-foreground font-semibold">Pressione para ativar</p>
        </CardContent>
      </Card>
    </div>
  );
}
