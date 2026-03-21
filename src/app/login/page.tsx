'use client';

import { useCycleData } from '@/context/cycle-data-context';
import { Moon, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { signInWithGoogle } = useCycleData();
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (user) {
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
    <div className="relative flex h-dvh w-full flex-col items-center justify-center bg-moodlua-gradient p-4 text-center">
      <Moon className="h-16 w-16 text-primary" />
      <h1 className="mt-4 text-3xl font-bold">Bem-vinda à MoodLua</h1>
      <p className="mt-2 text-muted-foreground">
        Faça login para salvar seus dados e acessar todas as funcionalidades.
      </p>
      <Button onClick={signInWithGoogle} className="mt-8">
        <LogIn className="mr-2 h-4 w-4" />
        Entrar com Google
      </Button>
    </div>
  );
}
