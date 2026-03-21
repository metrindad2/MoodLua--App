'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { MessageCircle, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SosMessageManager() {
  const { userProfile, updateUserProfile } = useCycleData();
  const [message, setMessage] = useState(userProfile?.sosMessage || '');
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.sosMessage) {
      setMessage(userProfile.sosMessage);
    }
  }, [userProfile?.sosMessage]);

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      await updateUserProfile({ ...userProfile, sosMessage: message });
      toast({
        title: 'Mensagem de SOS salva!',
        description: 'Sua mensagem padrão foi atualizada.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a mensagem. Tente novamente.',
      });
    }
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
          Personalize a mensagem que será enviada. A sua localização será
          adicionada automaticamente.
        </p>
      </div>

      <Textarea
        id="sos-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={8}
        className="text-base"
        placeholder="Digite sua mensagem de emergência aqui..."
      />
      <Button onClick={handleSave}>
        <Save className="mr-2" />
        Salvar Mensagem
      </Button>
    </div>
  );
}
