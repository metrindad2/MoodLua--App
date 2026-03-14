'use client'; // Needs to be a client component

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon, Info } from 'lucide-react';
import { SettingsForm } from '@/components/settings-form';

/**
 * Página de Configurações.
 *
 * Espaço para as configurações do aplicativo.
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
            Gerencie as preferências do seu aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="bg-muted/50 border-dashed">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
               <Info className="w-5 h-5 text-muted-foreground" />
               <CardTitle className="text-lg">Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No momento, as configurações de perfil, como nome e dados do ciclo,
                não podem ser editadas após o cadastro inicial.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
