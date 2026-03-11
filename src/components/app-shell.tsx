'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, CalendarDays, BrainCircuit, Settings, Moon } from 'lucide-react';
import SOSButton from './sos-button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/calendar', label: 'Calendário', icon: CalendarDays },
    { href: '/insights', label: 'Insights IA', icon: BrainCircuit },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    // Container principal com largura máxima para simular uma tela de celular no desktop
    <div className="relative mx-auto flex h-screen max-w-md flex-col border-x bg-card">
      <header className="flex items-center justify-between border-b p-4">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="text-primary" />
          <h1 className="font-bold text-lg text-primary">MoodLua</h1>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <Button
              key={item.href}
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                'text-muted-foreground',
                pathname === item.href && 'text-primary bg-primary/10'
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </header>

      {/* A área de conteúdo principal, com rolagem se o conteúdo for maior que a tela */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      {/* O botão de SOS é posicionado de forma fixa no canto da tela */}
      <SOSButton />
    </div>
  );
}
