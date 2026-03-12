'use client';

import { useCycleData } from '@/context/cycle-data-context';
import OnboardingForm from '@/components/onboarding-form';
import Dashboard from '@/components/dashboard';

/**
 * HomePage é a página inicial do aplicativo.
 * Ela decide qual tela mostrar para a usuária com base em seu estado.
 * O componente pai AppShell lida com o estado de carregamento.
 *
 * Como funciona:
 * 1. Usa o hook `useCycleData` para acessar o perfil da usuária.
 * 2. Se não há perfil de usuário (`userProfile` é nulo),
 *    significa que é o primeiro acesso. Então, renderiza o componente `OnboardingForm`.
 * 4. Se já existe um perfil de usuário, renderiza o `Dashboard`, que é a tela principal do app.
 *
 * Esta abordagem torna a página dinâmica e responsiva ao estado da usuária.
 */
export default function HomePage() {
  const { userProfile } = useCycleData();

  return <>{userProfile ? <Dashboard /> : <OnboardingForm />}</>;
}
