'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Phone, Share2 } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SOSPage() {
  const { sosSettings } = useCycleData();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'activating' | 'error' | 'shared'>('idle');

  // Timer para resetar o estado de confirmação
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirming) {
      timer = setTimeout(() => {
        setConfirming(false);
        setStatus('idle');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [confirming]);

  const handleSOS = async () => {
    if (!confirming) {
      setConfirming(true);
      setStatus('activating');
      toast({
        title: 'Confirme a Emergência',
        description: 'Pressione o coração novamente para confirmar o envio do alerta.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    setConfirming(false);
    setStatus('activating');
    toast({ title: 'SOS Ativado!', description: 'Acionando contatos de emergência.' });

    // 1. Obter localização
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `${sosSettings.emergencyMessage}\nMinha localização: ${locationUrl}`;

        // 2. Tentar compartilhar via Web Share API
        if (navigator.share && sosSettings.emergencyContacts.length > 0) {
          try {
            await navigator.share({
              title: 'Pedido de Ajuda Urgente!',
              text: message,
            });
            setStatus('shared');
            toast({ title: 'Alerta Enviado', description: 'Sua mensagem e localização foram compartilhadas.' });
          } catch (error) {
            console.error('Erro ao compartilhar:', error);
            if ((error as DOMException).name !== 'AbortError') {
              setStatus('error');
              callPolice();
            } else {
              setStatus('idle');
            }
          }
        } else {
          // 3. Fallback: ligar para a polícia
          callPolice();
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast({
          title: 'Erro de Localização',
          description: 'Não foi possível obter sua localização. Ligando para a polícia...',
          variant: 'destructive',
        });
        setStatus('error');
        callPolice();
      }
    );
  };
  
  const callPolice = () => {
    toast({ title: 'Ligando para Emergência', description: `Iniciando chamada para ${sosSettings.policeNumber}`});
    window.location.href = `tel:${sosSettings.policeNumber}`;
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full bg-card/50">
        <CardHeader>
          <CardTitle className="text-destructive text-3xl font-bold">Emergência SOS</CardTitle>
          <CardDescription>
            Pressione o coração duas vezes para enviar um alerta de emergência.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
            <Button
              onClick={handleSOS}
              className={cn(
                'rounded-full h-40 w-40 shadow-lg transform transition-all duration-300 ease-in-out',
                'bg-secondary/50 text-secondary-foreground hover:bg-secondary/70',
                confirming && 'animate-pulse scale-110 bg-red-500 hover:bg-red-600 text-white'
              )}
              aria-label={confirming ? 'Confirmar SOS' : 'Botão de Emergência SOS'}
            >
              <Heart className={cn('h-24 w-24', confirming && 'fill-white')} />
            </Button>
            {status === 'activating' && confirming && <p className="mt-4 text-destructive font-semibold">Pressione novamente para confirmar!</p>}
        </CardContent>
      </Card>
      
      <Card className="w-full bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl">O que acontece ao ativar?</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-4">
            <div className="flex items-start gap-4">
                <Share2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold">Envio de Mensagem</h3>
                    <p className="text-muted-foreground text-sm">Sua mensagem de emergência e localização atual serão enviadas para seus contatos cadastrados.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold">Ligação de Emergência</h3>
                    <p className="text-muted-foreground text-sm">Caso o envio da mensagem não seja possível, o aplicativo tentará ligar para o número de emergência ({sosSettings.policeNumber}).</p>
                </div>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
