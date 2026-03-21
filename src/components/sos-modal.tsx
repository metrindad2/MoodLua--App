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
import { Heart, Phone, MessageSquare } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { EmergencyContact } from '@/lib/types';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { PREDEFINED_CONTACTS } from '@/lib/config';

export function SosModal() {
  const { sosContacts, userProfile } = useCycleData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const sosMessage = userProfile?.sosMessage;

  const handleWhatsAppSend = (contact: EmergencyContact) => {
    if (!sosMessage) {
        toast({
            variant: 'destructive',
            title: 'Mensagem não configurada',
            description: 'Vá para as configurações para definir sua mensagem de SOS.',
        });
        return;
    }
    
    toast({
      title: 'Obtendo sua localização...',
      description: 'Por favor, aguarde um momento.',
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
        const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(fullMessage)}`;
        
        window.location.href = whatsappUrl;

        setIsOpen(false);
      },
      (error) => {
        let errorMessage = 'Não foi possível obter sua localização.';
        if (error.code === 1) { // PERMISSION_DENIED
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

  const allContacts = [...PREDEFINED_CONTACTS, ...sosContacts];

  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-24 right-4 z-50 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 animate-pulse"
          >
            <Heart className="h-8 w-8 text-primary-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-primary">
              Chamada de Emergência
            </DialogTitle>
            <DialogDescription className="text-center">
              Ligue ou envie um alerta para seus contatos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {allContacts.length > 0 ? (
              allContacts.map((contact, index) => (
                <div key={contact.id}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-lg">{contact.name}</p>
                    <div className="flex gap-2">
                      <a href={`tel:${contact.phone}`}>
                        <Button size="icon" aria-label={`Ligar para ${contact.name}`}>
                          <Phone />
                        </Button>
                      </a>
                      {!contact.isPredefined && (
                         <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => handleWhatsAppSend(contact)}
                            aria-label={`Mandar WhatsApp para ${contact.name}`}
                          >
                            <MessageSquare />
                          </Button>
                      )}
                    </div>
                  </div>
                  {index < allContacts.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground space-y-4">
                <p>Nenhum contato de emergência adicionado ainda.</p>
                <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                  <Link href="/settings">Adicionar Contatos</Link>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}
