'use client';

import Link from 'next/link';
import {
  Droplet,
  Baby,
  Settings,
  HeartPulse,
  History,
  Moon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCycleData } from '@/context/cycle-data-context';
import { Skeleton } from './ui/skeleton';
import { useState, useEffect } from 'react';
import { SosModal } from './sos-modal';
import { SplashScreen } from './splash-screen';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSplashing, setIsSplashing] = useState(true);
  const pathname = usePathname();
  const { userProfile, loading } = useCycleData();
  const [isSosOpen, setIsSosOpen] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to control the splash screen duration.
    const splashTimer = setTimeout(() => {
      setIsSplashing(false);
    }, 3500); // Show splash for 3.5 seconds

    return () => clearTimeout(splashTimer);
  }, []);

  // Render Splash Screen first
  if (isSplashing) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <div className="relative flex h-dvh w-full flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // Onboarding/login view without the main app shell.
  if (!userProfile) {
    return (
      <div className="relative flex h-dvh w-full flex-col items-center justify-center bg-moodlua-gradient p-4">
        <main className="w-full max-w-md">{children}</main>
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Ciclo', icon: Droplet },
    { href: '/history', label: 'Histórico', icon: History },
    { href: '/pregnancy', label: 'Gravidez', icon: Baby },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  // Full app shell for logged-in users.
  return (
    <div className="relative flex h-dvh w-full flex-col bg-moodlua-gradient">
      <header className="flex shrink-0 items-center justify-center p-4">
        <Link href="/" className="flex items-center gap-2">
           <Moon className="h-8 w-8 text-primary" />
           <h1 className="font-bold text-xl text-foreground">MoodLua</h1>
        </Link>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-24 z-0">
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="fixed bottom-0 z-50 w-full shrink-0 border-t bg-card/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-md items-center justify-around p-1">
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
      
      {userProfile && (
        <>
          <button
            onClick={() => setIsSosOpen(true)}
            className="fixed bottom-[85px] right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-100"
          >
            <HeartPulse className="h-8 w-8" />
            <span className="sr-only">Botão de Emergência</span>
          </button>
          <SosModal open={isSosOpen} onOpenChange={setIsSosOpen} />
        </>
      )}
    </div>
  );
}
