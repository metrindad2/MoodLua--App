'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Heart, Phone, MessageSquare, Shield, UserPlus, MapPin, Loader2 } from 'lucide-react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { EmergencyContact } from '@/lib/types';
import Link from 'next/link';
import { PREDEFINED_CONTACTS } from '@/lib/config';

export function SosModal() {
  const { sosContacts, userProfile } = useCycleData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const sosMessage = userProfile?.sosMessage;

  // Função para buscar localização de forma proativa
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsFetchingLocation(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        setIsFetchingLocation(false);
        // Não mostramos toast de erro aqui para não ser intrusivo ao abrir o menu
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  // Busca a localização assim que o modal abre
  useEffect(() => {
    if (isOpen) {
      fetchLocation();
    }
  }, [isOpen, fetchLocation]);

  const handleWhatsAppSend = (contact: EmergencyContact) => {
    if (!sosMessage || !sosMessage.trim()) {
        toast({
            variant: 'destructive',
            title: 'Mensagem não configurada',
            description: 'Vá para as configurações para definir sua mensagem de SOS.',
        });
        return;
    }

    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Número de telefone inválido',
        description: 'O contato de emergência não possui um número válido.',
      });
      return;
    }

    // Se a localização ainda não estiver pronta, tenta buscar uma última vez
    if (!location) {
        toast({
            title: 'Buscando localização...',
            description: 'Aguarde um instante para incluirmos seu mapa.',
        });
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                sendWithLocation(contact, cleanPhone, lat, lng);
            },
            () => {
                // Se falhar mesmo assim, envia sem localização (melhor que não enviar)
                sendWithLocation(contact, cleanPhone);
                toast({
                    variant: 'destructive',
                    title: 'Localização indisponível',
                    description: 'A mensagem foi enviada sem o link do mapa.',
                });
            },
            { timeout: 5000 }
        );
    } else {
        sendWithLocation(contact, cleanPhone, location.lat, location.lng);
    }
  };

  const sendWithLocation = (contact: EmergencyContact, phone: string, lat?: number, lng?: number) => {
    let mapsLink = '';
    if (lat && lng) {
        mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    }

    let messageToSend = sosMessage || '';
    
    if (mapsLink) {
        if (messageToSend.includes('{{localizacao}}')) {
            messageToSend = messageToSend.replace('{{localizacao}}', mapsLink);
        } else {
            messageToSend = `${messageToSend.trim()}\n\nMinha localização: ${mapsLink}`;
        }
    } else {
        // Remove o placeholder se não houver localização
        messageToSend = messageToSend.replace('{{localizacao}}', '(Localização não disponível)').trim();
    }
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageToSend)}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
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
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] bg-background p-4 pb-10">
          <SheetHeader className="flex flex-row items-center justify-between mb-4 px-2">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <Shield className="w-6 h-6 text-primary" />
              Chamada Rápida
            </SheetTitle>
            <SheetClose asChild>
                <Button variant="ghost" className="text-sm">Fechar</Button>
            </SheetClose>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto max-h-[60vh] px-1">
             {/* Status da Localização */}
             <div className="flex items-center justify-center p-2 bg-muted/30 rounded-lg text-xs gap-2">
                {isFetchingLocation ? (
                    <>
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span className="text-muted-foreground">Obtendo sua localização GPS...</span>
                    </>
                ) : location ? (
                    <>
                        <MapPin className="h-3 w-3 text-green-500" />
                        <span className="text-green-600 font-medium">Localização pronta para envio</span>
                    </>
                ) : (
                    <>
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Localização indisponível. Ative o GPS.</span>
                    </>
                )}
             </div>

             <div className="grid grid-cols-2 gap-3">
                {allContacts.map((contact) => (
                    <Card key={contact.id} className="bg-accent/50 text-center shadow-none border-none">
                        <CardHeader className="p-3 pb-2">
                            <CardTitle className="text-base font-bold truncate">{contact.name}</CardTitle>
                            <CardDescription className="text-xs font-semibold text-primary">{contact.phone}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-col gap-2 p-3 pt-0">
                            <Button asChild size="sm" className="w-full font-semibold h-9">
                                <a href={`tel:${contact.phone}`}>
                                  <Phone className="w-3 h-3 mr-1" /> Ligar
                                </a>
                            </Button>
                            {!contact.isPredefined && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleWhatsAppSend(contact)}
                                    className="w-full font-semibold h-9"
                                >
                                    <MessageSquare className="w-3 h-3 mr-1" /> SOS
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
             </div>
              
            <Button asChild variant="outline" className="w-full border-dashed border-2 h-12" onClick={() => setIsOpen(false)}>
                <Link href="/settings">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Gerenciar Contatos
                </Link>
            </Button>

            <p className="text-[10px] text-center text-muted-foreground pt-2">
                Toque no botão azul para ligar ou no botão cinza para enviar mensagem de SOS com sua localização.
            </p>

          </div>
        </SheetContent>
      </Sheet>
  );
}
