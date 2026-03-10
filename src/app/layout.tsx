import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { CycleDataProvider } from '@/context/cycle-data-context';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/app-shell';

// O next/font otimiza as fontes para você.
// Aqui, estamos carregando a fonte 'Inter' para ser usada no aplicativo.
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

/**
 * Metadados do aplicativo.
 * Isso é usado por navegadores e mecanismos de busca.
 * `title` define o nome que aparece na aba do navegador.
 * `description` é um breve resumo do que o aplicativo faz.
 */
export const metadata: Metadata = {
  title: 'CycleGuard',
  description: 'Seu assistente pessoal para monitoramento do ciclo menstrual e segurança.',
  manifest: '/manifest.json',
};

/**
 * RootLayout é o componente principal que envolve todo o aplicativo.
 * É como o `<body>` de uma página HTML.
 *
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - As páginas e componentes filhos que serão renderizados dentro deste layout.
 * @returns {JSX.Element} O layout raiz do aplicativo.
 */
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
      </head>
      {/*
        A classe `font-body` aplica a fonte Inter ao corpo do documento.
        `antialiased` torna o texto mais suave.
        `CycleDataProvider` é um "provedor de contexto". Ele disponibiliza todos os dados do ciclo
        (perfil, logs, etc.) para todos os componentes dentro dele, sem precisar passar
        os dados manualmente para cada um.
      */}
      <body className={cn('min-h-screen bg-background font-body antialiased', fontSans.variable)}>
        <CycleDataProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </CycleDataProvider>
      </body>
    </html>
  );
}
