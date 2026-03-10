import { SettingsForm } from '@/components/settings-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

/**
 * Página de Configurações.
 *
 * Esta página serve como um container para o formulário de configurações.
 * Ela apresenta um título e uma descrição e, em seguida, renderiza o
 * componente `SettingsForm`, que contém a lógica real do formulário.
 * Manter o formulário em um componente separado (`SettingsForm`) é uma boa prática
 * para organização do código.
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
            Personalize as configurações de emergência (SOS) do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
