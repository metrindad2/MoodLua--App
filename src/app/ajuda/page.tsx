'use client';
// O 'use client' é essencial porque este componente usa APIs específicas do navegador (como navigator.geolocation)
// e Hooks do React (useState) para interatividade e gerenciamento de estado.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, MessageCircle, Shield, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define a estrutura para os dados de localização para manter o código tipado.
type Geolocation = {
  latitude: number;
  longitude: number;
};

// Este é o componente principal da página de Ajuda.
export default function AjudaPage() {
  // Estado para gerenciar o status de carregamento (ex: enquanto obtém a localização).
  const [loading, setLoading] = useState(false);
  // Estado para armazenar qualquer mensagem de erro.
  const [error, setError] = useState<string | null>(null);
  // Estado para armazenar a localização obtida.
  const [location, setLocation] = useState<Geolocation | null>(null);
  // Estado para armazenar a mensagem de emergência gerada.
  const [message, setMessage] = useState('');
  // Hook para exibir notificações "toast" para o usuário.
  const { toast } = useToast();

  /**
   * Função principal para lidar com o pedido de ajuda.
   * É acionada quando o botão "Pedir Ajuda" é clicado.
   */
  const handleRequestHelp = () => {
    // 1. Reseta o estado anterior e inicia o carregamento.
    setLoading(true);
    setError(null);
    setLocation(null);
    setMessage('');

    // 2. Verifica se a geolocalização é suportada pelo navegador.
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador.');
      setLoading(false);
      return;
    }
    
    // Notifica o usuário que a localização está sendo buscada.
    toast({
        title: "Obtendo sua localização...",
        description: "Por favor, aguarde. Isso pode levar alguns segundos."
    });

    // 3. Solicita a posição atual do usuário.
    // Pede alta precisão e não usa uma posição em cache para garantir dados atuais.
    navigator.geolocation.getCurrentPosition(
      // --- Callback de SUCESSO ---
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const helpMessage = `Preciso de ajuda. Minha localização atual é:\n${googleMapsLink}`;

        // Armazena a localização e a mensagem no estado do componente.
        setLocation({ latitude, longitude });
        setMessage(helpMessage);
        setLoading(false);
        toast({
            title: "Localização obtida com sucesso!",
            description: "Escolha como deseja compartilhar."
        });
      },
      // --- Callback de ERRO ---
      (geoError) => {
        let errorMessage = 'Não foi possível obter sua localização.';
        // Traduz o código de erro para uma mensagem amigável.
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
      // Opções da API de Geolocalização
      {
        enableHighAccuracy: true, // Solicita a posição mais precisa possível.
        timeout: 10000,           // Espera no máximo 10 segundos.
        maximumAge: 0,            // Não usa uma posição antiga em cache.
      }
    );
  };

  /**
   * Abre o WhatsApp com a mensagem de emergência pré-preenchida.
   */
  const handleShareWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    // Este link abre o WhatsApp. O usuário ainda precisa selecionar um contato.
    window.open(`https://wa.me/?text=${encodedMessage}`);
  };

  /**
   * Abre o aplicativo de SMS padrão com a mensagem de emergência pré-preenchida.
   */
  const handleShareSms = () => {
    const encodedMessage = encodeURIComponent(message);
    // Este link abre o app de SMS.
    window.open(`sms:?body=${encodedMessage}`);
  };

  /**
   * Copia a mensagem de emergência para a área de transferência.
   * Usa a API moderna navigator.clipboard para segurança.
   */
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

  // --- Renderização da Interface (HTML e CSS via componentes) ---
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Pedido de Ajuda
          </CardTitle>
          <CardDescription className="pt-2">
            Em uma emergência, pressione o botão para obter sua localização e compartilhá-la com um contato de confiança.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          
          {/* Seção de opções de compartilhamento, exibida apenas após a localização ser obtida */}
          {location && !loading ? (
            <div className="w-full space-y-3 animate-in fade-in-50">
                <p className='text-sm text-muted-foreground pb-2'>Sua localização foi obtida. Escolha uma opção para pedir ajuda:</p>
              <Button onClick={handleShareWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white" size="lg">
                <Smartphone className="mr-2" /> Enviar via WhatsApp
              </Button>
              <Button onClick={handleShareSms} className="w-full" size="lg" variant="secondary">
                <MessageCircle className="mr-2" /> Enviar via SMS
              </Button>
              <Button onClick={handleCopy} className="w-full" size="lg" variant="secondary">
                <Copy className="mr-2" /> Copiar Mensagem
              </Button>
               <Button onClick={handleRequestHelp} variant="link" className="text-muted-foreground mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Obter nova localização
               </Button>
            </div>
          ) : (
            // Botão principal de ajuda, exibido inicialmente
            <Button
              onClick={handleRequestHelp}
              disabled={loading}
              className="w-full h-20 bg-destructive text-destructive-foreground text-xl font-bold hover:bg-destructive/90 rounded-full shadow-lg"
            >
              {loading ? 'Obtendo localização...' : 'Pedir Ajuda'}
            </Button>
          )}

          {/* Exibe mensagens de erro, se houver */}
          {error && !loading && <p className="text-destructive text-sm font-medium pt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
