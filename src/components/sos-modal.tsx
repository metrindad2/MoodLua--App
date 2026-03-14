'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCycleData } from '@/context/cycle-data-context';
import { EMERGENCY_SERVICES } from '@/lib/config';
import { EmergencyContact } from '@/lib/types';
import { Phone, MessageSquare, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

// Component for the SOS button logic
function SosMessageButton({ contact }: { contact: EmergencyContact }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSos = () => {
    setLoading(true);
    toast({ title: 'Obtendo sua localização...' });

    navigator.geolocation.getCurrentPosition(
      // Success
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const helpMessage = `Preciso de ajuda. Minha localização atual é:\n${googleMapsLink}`;
        const encodedMessage = encodeURIComponent(helpMessage);
        
        let phone = contact.phone.replace(/\D/g, '');
        if (phone.length <= 11) { // Assume BR number without country code
            phone = `55${phone}`;
        }

        setLoading(false);
        toast({ title: 'Localização obtida!', description: 'Abrindo WhatsApp...' });
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
      },
      // Error
      (geoError) => {
        setLoading(false);
        let errorMessage = 'Não foi possível obter sua localização, mas você ainda pode enviar uma mensagem de ajuda.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
            errorMessage = 'Permissão de localização negada. A mensagem será enviada sem o mapa.'
        }
        toast({ title: `Erro (Cód: ${geoError.code})`, description: errorMessage, variant: 'destructive' });

        const helpMessage = `Preciso de ajuda.`;
        const encodedMessage = encodeURIComponent(helpMessage);
        let phone = contact.phone.replace(/\D/g, '');
        if (phone.length <= 11) {
            phone = `55${phone}`;
        }
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Button onClick={handleSos} disabled={loading} size="sm" className="bg-destructive hover:bg-destructive/90">
      <MessageSquare className="mr-2 h-4 w-4" />
      {loading ? '...' : 'SOS'}
    </Button>
  );
}

export function SosModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { emergencyContacts } = useCycleData();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[90dvh] flex flex-col">
        <SheetHeader className="text-center pb-4">
          <SheetTitle>Chamada de Emergência</SheetTitle>
          <SheetDescription>
            Ligue para serviços de emergência ou contate uma pessoa de confiança.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-1">
            <div className="grid grid-cols-2 gap-4">
            {EMERGENCY_SERVICES.map((service) => (
                <div key={service.name} className="flex flex-col gap-2 rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold">{service.number}</p>
                    <p className="text-sm text-muted-foreground -mt-1">{service.name}</p>
                    <Button asChild size="sm" className="mt-2 w-full">
                        <a href={`tel:${service.number}`}>
                            <Phone className="mr-2 h-4 w-4" /> Ligar
                        </a>
                    </Button>
                </div>
            ))}
            </div>

            <div className="mt-6 space-y-3">
                {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild size="sm" variant="secondary">
                                <a href={`tel:${contact.phone}`}>
                                    <Phone className="mr-2 h-4 w-4" /> Ligar
                                </a>
                            </Button>
                            <SosMessageButton contact={contact} />
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        
        <div className="mt-6 px-1">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/settings">
                    <UserPlus className="mr-2 h-4 w-4" /> Gerenciar Contatos
                </Link>
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
