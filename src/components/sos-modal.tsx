'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Siren, Phone, MessageSquare, X } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { EmergencyContact } from '@/lib/types';
import Link from 'next/link';
import { Separator } from './ui/separator';

export function SosModal() {
  const { sosContacts, sosMessage } = useCycleData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppSend = (contact: EmergencyContact) => {
    toast({
      title: 'Obtendo sua localização...',
      description: 'Aguarde um momento.',
    });

    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Erro de Localização',
        description: 'Seu navegador não suporta geolocalização.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const fullMessage = `${sosMessage}\n\n${mapsLink}`;

        const whatsappUrl = `https://wa.me/${
          contact.phone
        }?text=${encodeURIComponent(fullMessage)}`;
        
        // Redireciona a aba atual para o WhatsApp
        window.location.href = whatsappUrl;

        setIsOpen(false);
      },
      (error) => {
        let errorMessage = 'Não foi possível obter sua localização.';
        if (error.code === 1) {
          errorMessage = 'Permissão de localização negada. Habilite nas configurações do seu navegador.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Erro de Localização',
          description: errorMessage,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="fixed bottom-24 right-4 z-50 h-16 w-16 rounded-full shadow-lg animate-pulse"
          >
            <Siren className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-destructive">
              Alerta de Emergência
            </DialogTitle>
            <DialogDescription className="text-center">
              Escolha uma ação rápida. Sua segurança é a prioridade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {sosContacts.length > 0 ? (
              sosContacts.map((contact, index) => (
                <div key={contact.id}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-lg">{contact.name}</p>
                    <div className="flex gap-2">
                      <a href={`tel:${contact.phone}`}>
                        <Button size="icon" aria-label={`Ligar para ${contact.name}`}>
                          <Phone />
                        </Button>
                      </a>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => handleWhatsAppSend(contact)}
                        aria-label={`Mandar WhatsApp para ${contact.name}`}
                      >
                        <MessageSquare />
                      </Button>
                    </div>
                  </div>
                  {index < sosContacts.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground space-y-4">
                <p>Nenhum contato de emergência foi adicionado ainda.</p>
                <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                  <Link href="/settings">Adicionar Contatos</Link>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
