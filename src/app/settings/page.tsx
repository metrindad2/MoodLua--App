import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

/**
 * Página de Configurações.
 *
 * Espaço para futuras configurações do aplicativo.
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
          <p className="text-muted-foreground">Nenhuma configuração disponível no momento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
