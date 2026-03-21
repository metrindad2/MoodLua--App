'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SosMessageManager } from '@/components/sos-message-manager';
import { EmergencyContactManager } from '@/components/emergency-contact-manager';
import { Heart, Phone, ShieldAlert } from 'lucide-react';
import { PREDEFINED_CONTACTS } from '@/lib/config';
import { Button } from './ui/button';

export function SosManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Chamadas de Emergência
        </CardTitle>
        <CardDescription>
          Gerencie seus contatos e sua mensagem de SOS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predefined Contacts */}
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-base text-muted-foreground">
                <ShieldAlert className="w-5 h-5" />
                Serviços de Emergência (Brasil)
            </h3>
            <div className="space-y-3">
                {PREDEFINED_CONTACTS.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-semibold">{contact.name}</p>
                            <p className="text-sm text-primary font-bold">{contact.phone}</p>
                        </div>
                        <a href={`tel:${contact.phone}`}>
                            <Button size="icon" aria-label={`Ligar para ${contact.name}`}>
                                <Phone />
                            </Button>
                        </a>
                    </div>
                ))}
            </div>
        </div>

        <Separator />
        
        {/* Custom Contacts */}
        <EmergencyContactManager />
        
        <Separator />

        {/* SOS Message */}
        <SosMessageManager />
      </CardContent>
    </Card>
  );
}
