'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { MessageCircle, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SosMessageManager() {
  const { sosMessage, updateSosMessage } = useCycleData();
  const [message, setMessage] = useState(sosMessage);
  const { toast } = useToast();

  useEffect(() => {
    setMessage(sosMessage);
  }, [sosMessage]);

  const handleSave = () => {
    updateSosMessage(message);
    toast({
      title: 'Mensagem de SOS salva!',
      description: 'Sua mensagem padrão foi atualizada.',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label
          htmlFor="sos-message"
          className="text-base font-semibold flex items-center gap-2 mb-2"
        >
          <MessageCircle className="w-5 h-5 text-primary" />
          Mensagem de Emergência
        </Label>
        <p className="text-sm text-muted-foreground">
          Personalize a mensagem que será enviada aos seus contatos. A sua
          localização será adicionada automaticamente.
        </p>
      </div>

      <Textarea
        id="sos-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={8}
        className="text-base"
      />
      <Button onClick={handleSave}>
        <Save className="mr-2" />
        Salvar Mensagem
      </Button>
    </div>
  );
}
