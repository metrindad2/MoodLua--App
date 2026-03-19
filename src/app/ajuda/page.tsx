'use client';
// Este arquivo cria a interface de chat com la IA.
// 'use client' é necessário porque usamos hooks do React (useState, useRef)
// para gerenciar o estado da conversa e a interação do usuário.

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, User, Send, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
// Importa a função que se comunica com a nossa IA
import { aiAssistant } from '@/ai/flows/ai-assistant';

// Define a estrutura de uma mensagem no chat
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AjudaPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Efeito para rolar para a última mensagem sempre que o chat for atualizado
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Função chamada quando o usuário envia uma pergunta
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Chama a função da IA, passando o histórico da conversa e a nova pergunta
      const response = await aiAssistant({
        history: messages,
        question: input,
      });

      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao chamar a IA:', error);
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível se comunicar com a assistente. Tente novamente.',
        variant: 'destructive',
      });
       // Remove a mensagem do usuário se a IA falhar
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <Card className="flex-1 flex flex-col w-full max-w-md mx-auto bg-card/80">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <CardTitle>Assistente de Saúde</CardTitle>
          <CardDescription>Tire suas dúvidas sobre ciclo e bem-estar.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-primary rounded-full p-2 text-primary-foreground">
                      <Bot size={20} />
                    </div>
                  )}
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <div className="bg-muted rounded-full p-2 text-foreground">
                      <User size={20} />
                    </div>
                  )}
                </div>
              ))}
               {loading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="bg-primary rounded-full p-2 text-primary-foreground">
                    <Bot size={20} className="animate-pulse" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-foreground">
                      <p className="text-sm italic">IA está pensando...</p>
                  </div>
                </div>
              )}
               {messages.length === 0 && !loading && (
                <div className="text-center text-muted-foreground text-sm p-8">
                    <p>Faça uma pergunta sobre seu ciclo, sintomas, bem-estar ou segurança. Ex: "É normal sentir cólicas antes da menstruação?"</p>
                </div>
               )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background/50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()} size="icon">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
