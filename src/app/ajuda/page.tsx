'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, MessageCircle, ShieldAlert, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Geolocation = {
  latitude: number;
  longitude: number;
};

export default function AjudaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Geolocation | null>(null);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleRequestHelp = () => {
    setLoading(true);
    setError(null);
    setLocation(null);
    setMessage('');

    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador.');
      setLoading(false);
      return;
    }
    
    toast({
        title: "Obtendo sua localização...",
        description: "Por favor, aguarde. Isso pode levar alguns segundos."
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const helpMessage = `Preciso de ajuda. Minha localização atual é:\n${googleMapsLink}`;

        setLocation({ latitude, longitude });
        setMessage(helpMessage);
        setLoading(false);
        toast({
            title: "Localização obtida com sucesso!",
            description: "Escolha como deseja compartilhar."
        });
      },
      (geoError) => {
        let errorMessage = 'Não foi possível obter sua localização.';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Habilite nas configurações do seu navegador para usar esta função.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage = 'Sinal de localização indisponível. Tente em um local com céu aberto.';
            break;
          case geoError.TIMEOUT:
            errorMessage = 'Tempo esgotado para obter localização. Verifique sua conexão e tente novamente.';
            break;
        }
        setError(errorMessage);
        setLoading(false);
        toast({
            title: "Erro de Localização (Cód: " + geoError.code + ")",
            description: errorMessage,
            variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleShareWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`);
  };

  const handleShareSms = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`sms:?body=${encodedMessage}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      toast({
        title: 'Mensagem copiada!',
        description: 'Você pode colar a mensagem onde precisar.',
      });
    }).catch(() => {
        toast({
            title: 'Falha ao copiar',
            description: 'Não foi possível copiar a mensagem automaticamente.',
            variant: 'destructive',
        })
    });
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Pedido de Ajuda
          </CardTitle>
          <CardDescription className="pt-2">
            Em uma emergência, pressione o botão para obter sua localização e compartilhá-la com um contato de confiança.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          
          {location && !loading ? (
            <div className="w-full space-y-3 animate-in fade-in-50">
                <p className='text-sm text-muted-foreground pb-2'>Sua localização foi obtida. Escolha uma opção para pedir ajuda:</p>
              <Button onClick={handleShareWhatsApp} className="w-full" size="lg">
                <Smartphone className="mr-2" /> Enviar via WhatsApp
              </Button>
              <Button onClick={handleShareSms} className="w-full" size="lg" variant="secondary">
                <MessageCircle className="mr-2" /> Enviar via SMS
              </Button>
              <Button onClick={handleCopy} className="w-full" size="lg" variant="outline">
                <Copy className="mr-2" /> Copiar Mensagem
              </Button>
               <Button onClick={handleRequestHelp} variant="link" className="text-muted-foreground mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Obter nova localização
               </Button>
            </div>
          ) : (
            <Button
              onClick={handleRequestHelp}
              disabled={loading}
              className="w-full h-20 text-xl font-bold rounded-full shadow-lg"
            >
              {loading ? 'Obtendo localização...' : 'Pedir Ajuda'}
            </Button>
          )}

          {error && !loading && <p className="text-destructive text-sm font-medium pt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
