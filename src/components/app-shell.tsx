'use client';

import Link from 'next/link';
import { Droplet, Baby, Settings, History, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCycleData } from '@/context/cycle-data-context';
import { Skeleton } from './ui/skeleton';
import { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';
import { SosModal } from './sos-modal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSplashing, setIsSplashing] = useState(true);
  const pathname = usePathname();
  const { userProfile, loading: isDataLoading } = useCycleData();

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsSplashing(false);
    }, 1800); 
    return () => clearTimeout(splashTimer);
  }, []);

  if (isSplashing) {
    return <SplashScreen />;
  }
  
  if (isDataLoading) {
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

  // Onboarding view without the main app shell.
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
    <div className="relative flex min-h-dvh w-full flex-col bg-moodlua-gradient">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <header className="flex shrink-0 items-center justify-center p-4">
          <Link href="/" className="flex items-center gap-2">
            <Moon className="h-8 w-8 text-primary" />
            <h1 className="font-bold text-xl text-foreground">MoodLua</h1>
          </Link>
        </header>

        <main className="w-full flex-1 overflow-y-auto pb-24 z-0">
          {children}
        </main>
      </div>

      {/* SOS Button, globally available */}
      <SosModal />

      <footer className="fixed bottom-0 z-50 w-full shrink-0 border-t bg-card/80 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
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
    </div>
  );
}
