'use client'; // Needs to be a client component to use the form

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsForm } from '@/components/settings-form';

/**
 * Página de Configurações.
 *
 * Espaço para as configurações do aplicativo, incluindo a função SOS.
 */
export default function SettingsPage() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <SettingsIcon className="h-6 w-6" />
            Configurações
          </CardTitle>
          <CardDescription>
            Gerencie as preferências do seu aplicativo, incluindo os contatos e a mensagem de emergência (SOS).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
