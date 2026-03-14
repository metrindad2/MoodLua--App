'use client'; // Needs to be a client component

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import { EmergencyContactManager } from '@/components/emergency-contact-manager';

/**
 * Página de Configurações.
 *
 * Espaço para as configurações do aplicativo.
 */
export default function SettingsPage() {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <SettingsIcon className="h-6 w-6" />
            Configurações
          </CardTitle>
          <CardDescription>
            Gerencie as preferências do seu aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmergencyContactManager />
        </CardContent>
      </Card>
    </div>
  );
}
