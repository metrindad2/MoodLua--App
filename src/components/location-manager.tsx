'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LocationManager() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Não suportado',
        description: 'Seu navegador não suporta geolocalização.',
      });
      return;
    }

    setIsRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        setHasPermission(true);
        toast({
          title: 'Localização ativada!',
          description: 'Seu GPS está pronto para uso no SOS.',
        });
      },
      (error) => {
        setIsRequesting(false);
        setHasPermission(false);
        console.error('Erro de GPS:', error);
        toast({
          variant: 'destructive',
          title: 'Erro de localização',
          description: 'Não foi possível obter sua posição. Verifique as permissões do navegador.',
        });
      },
      { timeout: 10000 }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Permissão de Localização
        </CardTitle>
        <CardDescription>
          Ative o GPS para que o botão de SOS funcione corretamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant={hasPermission ? "outline" : "default"} 
          className="w-full" 
          onClick={handleRequestLocation}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Solicitando GPS...
            </>
          ) : hasPermission ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              GPS Ativado
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Ativar Localização
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Sua localização só é acessada quando você usa o recurso de SOS para sua segurança.
        </p>
      </CardContent>
    </Card>
  );
}
