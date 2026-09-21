'use client';

import { Settings as SettingsIcon, Github, ExternalLink } from 'lucide-react';
import { SettingsForm } from '@/components/settings-form';
import { AppDataManager } from '@/components/app-data-manager';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SosManager } from '@/components/sos-manager';
import { LockScreenManager } from '@/components/lock-screen-manager';
import { LocationManager } from '@/components/location-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OFFICIAL_LINKS } from '@/lib/config';

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

      {/* Lock Screen Settings */}
      <LockScreenManager />

      {/* Location Permissions */}
      <LocationManager />

      {/* SOS Settings */}
      <SosManager />

      {/* Profile Settings */}
      <SettingsForm />

      {/* GitHub / Open Source Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Github className="w-5 h-5" />
            Código Aberto
          </CardTitle>
          <CardDescription>
            Contribua ou visualize o código-fonte do projeto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <a href={OFFICIAL_LINKS.GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              Ver no GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* App Data Settings */}
      <AppDataManager />
    </div>
  );
}
