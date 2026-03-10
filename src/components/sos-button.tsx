'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Botão de Emergência SOS.
 *
 * Este componente implementa a funcionalidade de segurança do aplicativo.
 *
 * Funcionalidades:
 * - Ativação em dois toques para evitar acionamentos acidentais.
 * - No primeiro toque, o botão entra em um modo de confirmação.
 * - No segundo toque (dentro de 5 segundos), ele aciona a emergência.
 * - Tenta obter a localização da usuária.
 * - Tenta usar a API de Compartilhamento Web (`navigator.share`) para enviar uma mensagem
 *   com a localização para os contatos de emergência.
 * - Se o compartilhamento não for possível, ele tenta fazer uma ligação para a polícia.
 */
export default function SOSButton() {
  const { sosSettings } = useCycleData();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  // Efeito para resetar o estado de confirmação após 5 segundos.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirming) {
      timer = setTimeout(() => setConfirming(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [confirming]);

  const handleSOS = async () => {
    if (!confirming) {
      setConfirming(true);
      toast({
        title: 'Confirme a Emergência',
        description: 'Toque no botão SOS novamente para confirmar.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    setConfirming(false);
    toast({ title: 'SOS Ativado!', description: 'Acionando contatos de emergência.' });

    // 1. Obter localização
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `${sosSettings.emergencyMessage}\nMinha localização: ${locationUrl}`;

        // 2. Tentar compartilhar via Web Share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Pedido de Ajuda Urgente!',
              text: message,
            });
          } catch (error) {
            console.error('Erro ao compartilhar:', error);
            // Se o usuário cancelar o compartilhamento, não faz nada. Se for outro erro, tenta ligar.
            if ((error as DOMException).name !== 'AbortError') {
              callPolice();
            }
          }
        } else {
          // 3. Fallback: tentar ligar para a polícia
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
        callPolice();
      }
    );
  };
  
  const callPolice = () => {
    window.location.href = `tel:${sosSettings.policeNumber}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleSOS}
        variant="destructive"
        className={cn(
          'rounded-full h-16 w-16 shadow-lg transform transition-transform duration-200 ease-in-out',
          confirming ? 'animate-pulse scale-110' : 'scale-100'
        )}
        aria-label={confirming ? 'Confirmar SOS' : 'Botão de Emergência SOS'}
      >
        <ShieldAlert className="h-8 w-8" />
      </Button>
    </div>
  );
}
