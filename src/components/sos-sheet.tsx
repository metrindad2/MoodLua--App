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

    const triggerSos = useCallback((contact: { name: string; number: string }) => {
        toast({ title: 'Acionando Contato de Emergência', description: `Preparando mensagem para ${contact.name}` });

        if (!navigator.geolocation) {
            toast({
                title: 'Erro de Localização',
                description: 'Seu navegador não suporta geolocalização.',
                variant: 'destructive',
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const message = `${sosSettings.emergencyMessage}\nMinha localização: ${locationUrl}`;
                
                // Limpa caracteres comuns de formatação do número
                const cleanNumber = contact.number.replace(/[\s()-]/g, '');
                
                // Cria o link SMS para abrir o app de mensagens com tudo preenchido
                const smsUri = `sms:${cleanNumber}?body=${encodeURIComponent(message)}`;

                toast({
                    title: 'Abrindo app de Mensagens...',
                    description: `Sua mensagem para ${contact.name} está pronta.`,
                    duration: 4000,
                });

                // Redireciona para o app de SMS
                window.location.href = smsUri;
            },
            (error: GeolocationPositionError) => {
                let description = 'Não foi possível obter sua localização. Tente acionar os contatos manualmente.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        description = 'Você negou o acesso à localização. Por favor, habilite nas configurações do seu navegador para usar esta função.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        description = 'Informações de localização não estão disponíveis no momento. Verifique seu sinal de GPS.';
                        break;
                    case error.TIMEOUT:
                        description = 'A solicitação de localização demorou demais. Tente novamente em um local com melhor sinal.';
                        break;
                }
                toast({
                    title: 'Erro de Localização',
                    description: description,
                    variant: 'destructive',
                    duration: 7000
                });
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
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
