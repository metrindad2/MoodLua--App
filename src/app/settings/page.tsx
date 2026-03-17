'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import { EmergencyContactManager } from '@/components/emergency-contact-manager';
import { SosMessageManager } from '@/components/sos-message-manager';

export default function SettingsPage() {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-secondary" />
            Configurações
          </CardTitle>
          <CardDescription>
            Gerencie as preferências e contatos do seu aplicativo.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <SosMessageManager />
      <EmergencyContactManager />
    </div>
  );
}
