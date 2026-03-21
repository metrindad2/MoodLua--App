'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppIntroCarousel } from './app-intro-carousel';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const { toast } = useToast();

  const handleLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        toast({
          title: 'Permissão concedida!',
          description: 'Sua localização poderá ser usada na função SOS.',
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            variant: 'destructive',
            title: 'Permissão negada',
            description:
              'Para usar o SOS com mapa, ative a localização nas configurações do seu navegador.',
          });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center items-center">
          <DialogTitle className="text-2xl">Bem-vinda à MoodLua!</DialogTitle>
          <DialogDescription>
            Aqui está um resumo rápido do que o app pode fazer por você.
          </DialogDescription>
        </DialogHeader>

        <AppIntroCarousel />

        <div className="space-y-3 px-4 pt-2">
            <h3 className="font-semibold text-center text-foreground">Função de Segurança</h3>
             <p className="text-sm text-center text-muted-foreground -mt-2">
                Para que a função SOS funcione corretamente, precisamos da sua permissão para acessar a localização.
            </p>
            <Button onClick={handleLocationPermission} className="w-full">
                <MapPin className="mr-2" />
                Permitir Localização
            </Button>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Começar a Usar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
