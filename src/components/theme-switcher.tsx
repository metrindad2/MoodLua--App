'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Paintbrush } from 'lucide-react';

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Paintbrush className="w-5 h-5" />
          Tema do Aplicativo
        </CardTitle>
        <CardDescription>
          Escolha como o MoodLua deve se parecer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
          <Button
            variant={theme === 'light' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
            className="h-auto py-2"
          >
            <Sun className="mr-2 h-4 w-4" />
            Claro
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="h-auto py-2"
          >
            <Moon className="mr-2 h-4 w-4" />
            Escuro
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className="h-auto py-2"
          >
            <Laptop className="mr-2 h-4 w-4" />
            Sistema
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
