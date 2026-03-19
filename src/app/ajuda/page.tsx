'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { aiAssistant, AiAssistantInput } from '@/ai/flows/ai-assistant';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCycleData } from '@/context/cycle-data-context';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AjudaPage() {
  const { userProfile } = useCycleData(); // To get user's name
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiInput: AiAssistantInput = {
        question: input,
        history: chatHistory,
      };
      
      const response = await aiAssistant(aiInput);

      if (response && response.answer) {
        const modelMessage: Message = { role: 'model', content: response.answer };
        setMessages((prev) => [...prev, modelMessage]);
      } else {
        throw new Error('A IA não retornou uma resposta válida.');
      }
    } catch (error) {
      console.error('Erro ao chamar a IA:', error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Desculpe, não consegui processar sua pergunta. Tente novamente mais tarde.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <div className="p-4 flex flex-col h-full">
      <CardHeader className="p-0 mb-4">
        <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary" />
            <div>
                <CardTitle className="text-2xl font-bold">
                    Ajuda com IA
                </CardTitle>
                <CardDescription className="pt-1">
                    Converse com a Lua, sua assistente de saúde feminina.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100dvh-280px)] p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                       <AvatarFallback>IA</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    )}
                  >
                   <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="w-8 h-8">
                       <AvatarFallback>
                         {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User size={18}/>}
                       </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                       <AvatarFallback>IA</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3 text-sm rounded-bl-none">
                        <p className="animate-pulse">IA está pensando...</p>
                    </div>
                </div>
              )}
              {messages.length === 0 && !isLoading && (
                 <div className="text-center text-muted-foreground p-8">
                    <p>Olá! Como posso te ajudar hoje?</p>
                    <p className="text-xs mt-2">Você pode perguntar sobre seu ciclo, sintomas, bem-estar e mais.</p>
                 </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
