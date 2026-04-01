'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { Heart, Phone, MessageSquare, Shield, UserPlus } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { EmergencyContact } from '@/lib/types';
import Link from 'next/link';
import { PREDEFINED_CONTACTS } from '@/lib/config';

export function SosModal() {
  const { sosContacts, userProfile } = useCycleData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const sosMessage = userProfile?.sosMessage;

  const handleWhatsAppSend = (contact: EmergencyContact) => {
    if (!sosMessage || !sosMessage.trim()) {
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

    // Etapa de segurança: Limpa o número para garantir que apenas dígitos sejam usados.
    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Número de telefone inválido',
        description: 'O contato de emergência não possui um número válido.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        let messageToSend = sosMessage;
        
        if (messageToSend.includes('{{localizacao}}')) {
            messageToSend = messageToSend.replace('{{localizacao}}', mapsLink);
        } else {
            messageToSend = `${messageToSend.trim()}\n\n${mapsLink}`;
        }
        
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageToSend)}`;
        
        toast({
            title: 'Redirecionando para o WhatsApp...',
            description: 'Sua mensagem de SOS está pronta para ser enviada.'
        })

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
      },
      (error) => {
        let errorMessage = 'Não foi possível obter sua localização.';
        if (error.code === 1) { // PERMISSION_DENIED
          errorMessage = 'Permissão de localização negada. Habilite nas configurações do seu navegador ou do aplicativo.';
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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-24 right-4 z-50 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            aria-label="Abrir menu de emergência"
          >
            <Heart className="h-8 w-8 text-primary-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] bg-background p-4">
          <SheetHeader className="flex flex-row items-center justify-between mb-4 px-2">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <Shield className="w-6 h-6 text-primary" />
              Chamada Rápida
            </SheetTitle>
            <SheetClose asChild>
                <Button variant="ghost" className="text-sm">Fechar</Button>
            </SheetClose>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto">
             <div className="grid grid-cols-2 gap-3">
                {allContacts.map((contact) => (
                    <Card key={contact.id} className="bg-accent/50 text-center shadow-none border-none">
                        <CardHeader className="p-3 pb-2">
                            <CardTitle className="text-lg font-bold truncate">{contact.name}</CardTitle>
                            <CardDescription className="text-sm font-semibold text-primary">{contact.phone}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex gap-2 p-3 pt-0">
                            <Button asChild size="sm" className="w-full font-semibold">
                                <a href={`tel:${contact.phone}`}>
                                  <Phone /> Ligar
                                </a>
                            </Button>
                            {!contact.isPredefined && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleWhatsAppSend(contact)}
                                    className="w-full font-semibold"
                                >
                                    <MessageSquare /> SOS
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
             </div>
              
            <Button asChild variant="outline" className="w-full border-dashed border-2" onClick={() => setIsOpen(false)}>
                <Link href="/settings">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar contato
                </Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">Toque para ligar imediatamente</p>

          </div>
        </SheetContent>
      </Sheet>
  );
}
