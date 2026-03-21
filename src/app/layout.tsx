import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { CycleDataProvider } from '@/context/cycle-data-context';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'MoodLua',
  description: 'Seu ciclo, seu astral.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#FBF5FF" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#2A0E3F" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={cn('min-h-screen font-body antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            <CycleDataProvider>
              <AppShell>
                {children}
              </AppShell>
              <Toaster />
            </CycleDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
