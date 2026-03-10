'use client';

import { useCycleData } from '@/context/cycle-data-context';
import OnboardingForm from '@/components/onboarding-form';
import Dashboard from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * HomePage é a página inicial do aplicativo.
 * Ela decide qual tela mostrar para a usuária com base em seu estado.
 *
 * Como funciona:
 * 1. Usa o hook `useCycleData` para acessar os dados do ciclo e o estado de carregamento.
 * 2. Se os dados ainda estão carregando (`loading` é true), exibe um "esqueleto" (placeholders de carregamento)
 *    para indicar que a página está sendo preparada.
 * 3. Se o carregamento terminou e não há perfil de usuário (`userProfile` é nulo),
 *    significa que é o primeiro acesso. Então, renderiza o componente `OnboardingForm`.
 * 4. Se já existe um perfil de usuário, renderiza o `Dashboard`, que é a tela principal do app.
 *
 * Esta abordagem torna a página dinâmica e responsiva ao estado da usuária.
 */
export default function HomePage() {
  const { userProfile, loading } = useCycleData();

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <main className="flex-1">
      {userProfile ? <Dashboard /> : <OnboardingForm />}
    </main>
  );
}
