'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  BrainCircuit,
  Settings,
  Baby,
  History,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCycleData } from '@/context/cycle-data-context';
import { Skeleton } from './ui/skeleton';
import { FloatingSosButton } from './floating-sos-button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile, loading } = useCycleData();

  const navItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/history', label: 'Histórico', icon: History },
    { href: '/pregnancy', label: 'Gravidez', icon: Baby },
    { href: '/insights', label: 'Insights', icon: BrainCircuit },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="relative mx-auto flex h-dvh max-w-md flex-col items-center justify-center border-x border-border bg-background p-4">
        <div className="space-y-4 p-4 w-full">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // If there's no profile, it's the onboarding/login view. Don't show the main app shell.
  // This provides a container so the background gradient is visible.
  if (!userProfile) {
    return (
      <div className="relative mx-auto h-dvh max-w-md">
        <main>{children}</main>
      </div>
    );
  }

  // If there IS a profile, show the full app shell.
  return (
    <div className="relative mx-auto flex h-dvh max-w-md flex-col border-x border-border bg-muted">
      {/* Área de conteúdo principal com rolagem e padding para não ficar sob a navegação */}
      <main className="flex-1 overflow-y-auto pb-24 bg-background">
        {/* Cabeçalho centralizado com a logo */}
        <header className="flex shrink-0 items-center justify-center border-b border-border bg-background p-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MoodLua Logo" width={28} height={28} />
            <h1 className="font-bold text-xl text-primary">MoodLua</h1>
          </Link>
        </header>
        {children}
      </main>

      {/* Botão SOS Flutuante Adicionado de Volta */}
      <FloatingSosButton />

      {/* Navegação Inferior Fixa */}
      <footer className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 shrink-0 border-t border-border bg-background/90 backdrop-blur-sm">
        <nav className="flex items-center justify-around p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-md p-2 text-center text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
