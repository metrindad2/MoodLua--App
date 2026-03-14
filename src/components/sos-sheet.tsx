'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useCycleData } from '@/context/cycle-data-context';
import { Card } from './ui/card';
import { Phone, MessageSquareWarning, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import Link from 'next/link';

interface SosSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const emergencyServices = [
    { name: 'SAMU', number: '192' },
    { name: 'Polícia', number: '190' },
    { name: 'Bombeiros', number: '193' },
    { name: 'Central da Mulher', number: '180' },
];

export function SosSheet({ open, onOpenChange }: SosSheetProps) {
    const { sosSettings } = useCycleData();
    const { toast } = useToast();

    const callNumber = (number: string) => {
        toast({ title: `Ligando para ${number}` });
        window.location.href = `tel:${number}`;
    };

    const triggerSos = useCallback(async (contact: { name: string; number: string }) => {
        toast({ title: 'SOS Acionado', description: `Preparando mensagem para ${contact.name}...` });

        const sendWhatsAppMessage = (message: string, contactNumber: string) => {
            let cleanNumber = contactNumber.replace(/\D/g, '');
            if (cleanNumber.length === 10 || cleanNumber.length === 11) {
                cleanNumber = `55${cleanNumber}`;
            }
            const whatsappUri = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
            toast({
                title: 'Abrindo o WhatsApp...',
                description: `Sua mensagem está pronta.`,
                duration: 4000,
            });
            window.open(whatsappUri, '_blank');
        };

        if (!navigator.geolocation) {
            toast({
                title: 'Localização não suportada',
                description: 'Seu navegador não suporta geolocalização. A mensagem será enviada sem a localização.',
                variant: 'destructive',
                duration: 8000,
            });
            sendWhatsAppMessage(sosSettings.emergencyMessage, contact.number);
            return;
        }
        
        toast({
            title: 'Obtendo sua localização...',
            description: 'Por favor, aguarde e aprove a solicitação do navegador se necessário.',
            duration: 10000, // Timeout is 10s
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const message = `${sosSettings.emergencyMessage}\nMinha localização: ${locationUrl}`;
                
                toast({
                    title: 'Localização obtida com sucesso!',
                    description: 'Enviando mensagem com sua localização.',
                    duration: 4000,
                });
                
                sendWhatsAppMessage(message, contact.number);
            },
            (error: GeolocationPositionError) => {
                let errorDescription: string;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorDescription = 'Permissão negada. Para enviar sua posição, habilite a localização nas configurações do seu navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorDescription = 'Sinal de GPS ou rede indisponível. A mensagem será enviada sem sua posição.';
                        break;
                    case error.TIMEOUT:
                        errorDescription = 'A solicitação de localização demorou demais. A mensagem será enviada sem sua posição.';
                        break;
                    default:
                        errorDescription = 'Não foi possível obter sua localização. A mensagem será enviada sem sua posição.';
                        break;
                }

                toast({
                    title: `Erro de Localização (Cód: ${error.code})`,
                    description: errorDescription,
                    variant: 'destructive',
                    duration: 10000,
                });

                sendWhatsAppMessage(sosSettings.emergencyMessage, contact.number);
            },
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

    }, [sosSettings, toast]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-2xl border-none bg-card">
                <SheetHeader className="flex flex-row items-center justify-between pb-4">
                    <SheetTitle>Chamada de Emergência</SheetTitle>
                    <SheetClose asChild>
                        <Button variant="ghost">Fechar</Button>
                    </SheetClose>
                </SheetHeader>
                 <div className="text-center text-sm text-muted-foreground mb-6 -mt-4 px-2">
                    <p>
                        O botão SOS é uma função de segurança. Com dois toques, você pode ligar para serviços de emergência ou enviar uma mensagem de ajuda (com sua localização) para seus contatos de confiança.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {emergencyServices.map(service => (
                        <Card key={service.name} className="p-4 flex flex-col items-center justify-center text-center bg-background rounded-2xl">
                           <p className="text-2xl font-bold">{service.number}</p>
                           <p className="text-sm text-muted-foreground">{service.name}</p>
                           <Button onClick={() => callNumber(service.number)} className="mt-3 w-full">
                                <Phone /> Ligar
                           </Button>
                        </Card>
                    ))}
                    {sosSettings.emergencyContacts.map((contact, index) => (
                        <Card key={index} className="p-4 flex flex-col items-center justify-center text-center col-span-2 bg-background rounded-2xl">
                           <p className="text-xl font-bold">{contact.number}</p>
                           <p className="text-sm text-muted-foreground">{contact.name}</p>
                           <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                            <Button onClick={() => callNumber(contact.number)} className="w-full">
                                    <Phone /> Ligar
                            </Button>
                            <Button onClick={() => triggerSos(contact)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    <MessageSquareWarning /> SOS
                            </Button>
                           </div>
                        </Card>
                    ))}
                </div>
                <div className="border-t mt-4 pt-4">
                    <Link href="/settings" passHref>
                        <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                            <UserPlus /> Adicionar Contato
                        </Button>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}
