'use client';

import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsForm } from '@/components/settings-form';
import { AppDataManager } from '@/components/app-data-manager';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SosManager } from '@/components/sos-manager';

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
      <SosManager />

      {/* Profile Settings */}
      <SettingsForm />

      {/* App Data Settings */}
      <AppDataManager />
    </div>
  );
}
