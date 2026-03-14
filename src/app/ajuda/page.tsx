// --- ANOTAÇÕES PARA ESTUDANTES ---
// Este arquivo usa a diretiva 'use client' porque ele precisa interagir
// diretamente com o navegador do usuário para fazer três coisas:
// 1. Responder a cliques no botão.
// 2. Pedir permissão e obter a localização (GPS) do dispositivo.
// 3. Copiar texto para a área de transferência.
// Essas são ações que só podem acontecer no lado do cliente (o navegador),
// e não no servidor.
'use client';

// --- ARQUIVO CSS (Estilização) ---
// Em projetos React/Next.js como este, o CSS não fica em um arquivo separado.
// Usamos uma biblioteca chamada Tailwind CSS. As classes como "bg-red-500",
// "p-4", "text-white" são do Tailwind. Elas aplicam estilos diretamente no HTML.
// Isso torna a estilização mais rápida e consistente.
// As cores principais (como 'primary', 'destructive') são definidas em `src/app/globals.css`.

// --- ARQUIVO JAVASCRIPT (Lógica) ---

// Importa os 'blocos de construção' (componentes) e ferramentas do React e de outras bibliotecas.
import { useState } from 'react'; // Hook do React para criar e gerenciar o 'estado' do componente.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Copy, MessageSquare, Smartphone } from 'lucide-react'; // Ícones para os botões.

// Define o componente da página, que é a função principal exportada pelo arquivo.
export default function AjudaPage() {
  // --- ESTADO DO COMPONENTE ---
  // O 'estado' é como a memória de curto prazo do componente.
  // Usamos `useState` para criar variáveis que, quando alteradas, fazem o React
  // redesenhar a tela automaticamente.

  // `locationMessage`: Armazena a mensagem de emergência com a localização. Começa como nulo.
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  // `error`: Armazena a mensagem de erro se a localização falhar. Começa como nulo.
  const [error, setError] = useState<string | null>(null);
  // `isLoading`: Controla se o processo de obter a localização está em andamento.
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- FUNÇÕES ---

  // Função chamada quando o botão "Pedir Ajuda" é clicado.
  const handleRequestHelp = () => {
    // 1. Reseta os estados anteriores para limpar a tela.
    setLocationMessage(null);
    setError(null);
    setIsLoading(true); // Mostra o feedback de "carregando".

    // 2. Verifica se o navegador suporta a API de Geolocalização.
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador.');
      setIsLoading(false);
      return;
    }

    // 3. Tenta obter a localização.
    // A função `getCurrentPosition` recebe três argumentos:
    // - uma função de sucesso (o que fazer quando a localização é obtida)
    // - uma função de erro (o que fazer se falhar)
    // - opções (como pedir alta precisão)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // --- SUCESSO ---
        const { latitude, longitude } = position.coords;
        // Cria o link do Google Maps com as coordenadas.
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        // Monta a mensagem final.
        const message = `Preciso de ajuda. Minha localização atual é:\n${mapsLink}`;

        // Atualiza o estado com a mensagem, o que fará a tela mostrar as opções de compartilhamento.
        setLocationMessage(message);
        setIsLoading(false); // Esconde o feedback de "carregando".
      },
      () => {
        // --- ERRO ---
        // Chamado se a usuária negar a permissão ou se houver um erro de GPS.
        setError('Não foi possível obter sua localização. Verifique as permissões do seu navegador e tente novamente.');
        setIsLoading(false); // Esconde o feedback de "carregando".
      },
      {
        enableHighAccuracy: true, // Pede a localização mais precisa possível.
      }
    );
  };

  // Função para copiar a mensagem para a área de transferência.
  const handleCopyToClipboard = () => {
    if (locationMessage) {
      navigator.clipboard.writeText(locationMessage);
      alert('Mensagem copiada para a área de transferência!'); // Feedback simples para a usuária.
    }
  };

  // --- ARQUIVO HTML (Estrutura da Interface) ---
  // No React, o HTML é escrito dentro do `return` do componente usando uma sintaxe chamada JSX.
  // Parece HTML, mas é JavaScript, o que nos permite misturar lógica e estrutura.
  return (
    <div className="p-4 flex flex-col items-center justify-center text-center space-y-6">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Pedido de Ajuda
          </CardTitle>
          <CardDescription className="pt-2">
            Pressione o botão abaixo para obter sua localização e compartilhá-la em uma emergência.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          
          {/* Botão Principal: Pedir Ajuda */}
          <Button
            onClick={handleRequestHelp}
            disabled={isLoading} // O botão fica desabilitado enquanto a localização está sendo obtida.
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-lg py-6"
          >
            {/* O texto do botão muda para dar feedback à usuária. */}
            {isLoading ? 'Obtendo Localização...' : 'Pedir Ajuda'}
          </Button>

          {/* Seção de Erro: Só aparece se a variável `error` tiver algum texto. */}
          {error && (
            <p className="text-destructive font-medium mt-4">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Seção de Compartilhamento: Só aparece se a `locationMessage` for gerada com sucesso. */}
      {locationMessage && (
        <Card className="w-full max-w-md animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Compartilhe sua Localização</CardTitle>
            <CardDescription>
              Sua mensagem de emergência está pronta. Escolha como deseja enviá-la.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Caixa de texto mostrando a mensagem gerada. */}
            <div className="rounded-md border bg-muted p-3 text-left text-sm text-muted-foreground">
              {locationMessage.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
            
            {/* Botões de Ação */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button asChild variant="outline">
                {/* `asChild` permite que o componente `Button` passe seus estilos para o `a` (link). */}
                <a href={`https://wa.me/?text=${encodeURIComponent(locationMessage)}`} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2" /> WhatsApp
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href={`sms:?&body=${encodeURIComponent(locationMessage)}`}>
                  <Smartphone className="mr-2" /> SMS
                </a>
              </Button>

              <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy className="mr-2" /> Copiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
