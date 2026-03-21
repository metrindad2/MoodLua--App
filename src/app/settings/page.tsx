'use client';

import { Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { SettingsForm } from '@/components/settings-form';
import { AppDataManager } from '@/components/app-data-manager';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SosMessageManager } from '@/components/sos-message-manager';
import { EmergencyContactManager } from '@/components/emergency-contact-manager';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-secondary" />
          Configurações
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie as preferências e dados do seu aplicativo.
        </p>
      </div>

      {/* Theme Settings */}
      <ThemeSwitcher />

      {/* SOS Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Chamadas de Emergência
          </CardTitle>
          <CardDescription>
            Gerencie seus contatos e sua mensagem de SOS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SosMessageManager />
          <Separator />
          <EmergencyContactManager />
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <SettingsForm />

      {/* App Data Settings */}
      <AppDataManager />
    </div>
  );
}
