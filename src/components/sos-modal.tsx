'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCycleData } from '@/context/cycle-data-context';
import { EMERGENCY_SERVICES } from '@/lib/config';
import { EmergencyContact } from '@/lib/types';
import { Phone, MessageSquare, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';

// Component for the SOS message sending logic
function SosMessageButton({ contact }: { contact: EmergencyContact }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sosMessage } = useCycleData();

  const handleInitialSosClick = () => {
    setLoading(true);
    toast({
      title: 'Obtendo sua localização...',
      description: 'Uma nova aba será aberta para o WhatsApp.',
    });

    const whatsAppWindow = window.open('', '_blank');
    if (whatsAppWindow) {
      whatsAppWindow.document.write(
        'Obtendo localização para enviar via WhatsApp...'
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Ação bloqueada',
        description:
          'Por favor, desative o bloqueador de pop-ups para usar a função SOS.',
      });
      setLoading(false);
      return;
    }

    const processAndRedirect = (locationUrl?: string) => {
      const message = locationUrl ? `${sosMessage}\n${locationUrl}` : sosMessage;
      const encodedMessage = encodeURIComponent(message);
      let phone = contact.phone.replace(/\D/g, '');
      if (phone.length <= 11) {
        phone = `55${phone}`;
      }
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

      // Now update the location of the window we already opened.
      whatsAppWindow.location.href = whatsappUrl;
    };

    navigator.geolocation.getCurrentPosition(
      // Success
      (position) => {
        setLoading(false);
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        processAndRedirect(locationUrl);
      },
      // Error
      (geoError) => {
        setLoading(false);
        let errorTitle = 'Localização não encontrada';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorTitle = 'Permissão de localização negada';
        }

        toast({
          variant: 'destructive',
          title: errorTitle,
          description: 'A mensagem será enviada sem o mapa.',
        });

        processAndRedirect(undefined);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Button onClick={handleInitialSosClick} disabled={loading} size="sm">
      <MessageSquare className="mr-2 h-4 w-4" />
      {loading ? 'Obtendo...' : 'SOS'}
    </Button>
  );
}

export function SosModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { emergencyContacts } = useCycleData();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl h-[90dvh] flex flex-col"
      >
        <SheetHeader className="text-center pb-4">
          <SheetTitle>Chamada de Emergência</SheetTitle>
          <SheetDescription>
            Ligue para serviços de emergência ou contate uma pessoa de
            confiança.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-3">
            <h3 className="font-semibold text-muted-foreground px-2">
              Serviços Públicos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {EMERGENCY_SERVICES.map((service) => (
                <Card
                  key={service.name}
                  className="flex flex-col gap-2 p-4 text-center items-center justify-center"
                >
                  <p className="text-2xl font-bold">{service.number}</p>
                  <p className="text-sm text-muted-foreground -mt-1">
                    {service.name}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="destructive"
                    className="mt-2 w-full"
                  >
                    <a href={`tel:${service.number}`}>
                      <Phone className="mr-2 h-4 w-4" /> Ligar
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-muted-foreground px-2">
              Seus Contatos
            </h3>
            {emergencyContacts.map((contact) => (
              <Card
                key={contact.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="mr-2 h-4 w-4" /> Ligar
                    </a>
                  </Button>
                  <SosMessageButton contact={contact} />
                </div>
              </Card>
            ))}
            {emergencyContacts.length === 0 && (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                Você ainda não adicionou contatos de emergência.
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="mt-6 px-1">
          <Button variant="outline" className="w-full" asChild>
            <Link
              href="/settings#emergency-contacts"
              onClick={() => onOpenChange(false)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Gerenciar Contatos
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
