'use client'

import Link from 'next/link';
import { Home, CalendarDays, BrainCircuit, Settings, Moon, ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/calendar', label: 'Calendário', icon: CalendarDays },
    { href: '/insights', label: 'Insights', icon: BrainCircuit },
    { href: '/sos', label: 'SOS', icon: ShieldAlert },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    // Container principal com altura dinâmica para melhor suporte em celulares
    <div className="relative mx-auto flex h-dvh max-w-md flex-col border-x bg-background">
      {/* Cabeçalho centralizado com a logo */}
      <header className="flex shrink-0 items-center justify-center border-b p-4">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-7 w-7 text-primary" />
          <h1 className="font-bold text-2xl text-primary">MoodLua</h1>
        </Link>
      </header>

      {/* Área de conteúdo principal com rolagem e padding para não ficar sob a navegação */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      
      {/* Navegação Inferior Fixa */}
      <footer className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 shrink-0 border-t bg-background/90 backdrop-blur-sm">
        <nav className="flex items-center justify-around p-1">
          {navItems.map(item => (
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
