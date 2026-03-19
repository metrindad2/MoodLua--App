'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { Moon } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { userProfile, loading } = useCycleData();

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh p-4 text-center">
        <p>Você já está logado.</p>
        <Link href="/" className="text-primary hover:underline mt-4">
          Ir para o Painel
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-4 text-center">
      <Moon className="w-14 h-14 text-primary mb-2" />
      <h1 className="text-3xl font-bold text-foreground">Bem-vinda de volta!</h1>
      <p className="text-muted-foreground mt-2 mb-8">
        Como os dados são salvos localmente, não há necessidade de login.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Ir para a tela inicial para começar
      </Link>
    </div>
  );
}
