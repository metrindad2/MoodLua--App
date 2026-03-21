'use client';

import { useCycleData } from '@/context/cycle-data-context';
import OnboardingForm from '@/components/onboarding-form';
import Dashboard from '@/components/dashboard';
import { useUser } from '@/firebase';

/**
 * HomePage é a página inicial do aplicativo.
 * Ela decide qual tela mostrar para a usuária com base em seu estado.
 * O componente pai AppShell lida com o estado de carregamento e autenticação.
 *
 * Como funciona:
 * 1. Usa o hook `useCycleData` para acessar o perfil da usuária.
 * 2. Se não há perfil de usuário (`userProfile` é nulo),
 *    significa que é o primeiro acesso (após o login). Então, renderiza o componente `OnboardingForm`.
 * 3. Se já existe um perfil de usuário, renderiza o `Dashboard`, que é a tela principal do app.
 */
export default function HomePage() {
  const { userProfile } = useCycleData();
  const { user } = useUser();

  // Garante que não mostre nada se o usuário não estiver logado, pois o AppShell cuidará disso.
  if (!user) {
    return null;
  }

  return <>{userProfile ? <Dashboard /> : <OnboardingForm />}</>;
}
