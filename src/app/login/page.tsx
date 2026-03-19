'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCycleData } from '@/context/cycle-data-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Moon } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

export default function LoginPage() {
  const { userProfile, loading } = useCycleData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Tentativa de login com:', values);
    alert('Funcionalidade de login não implementada.');
  }

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
    <div className="flex flex-col items-center justify-center min-h-dvh p-4">
      <div className="flex flex-col items-center justify-center text-center pt-8 pb-4">
        <Moon className="w-14 h-14 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-foreground">Bem-vinda de volta!</h1>
        <p className="text-muted-foreground mt-2">Acesse sua conta para continuar.</p>
      </div>

      <Card className="w-full max-w-md mt-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full font-bold text-base py-6"
              >
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center pb-8">
        <Link href="/" className="text-sm text-primary hover:underline">
          Não tem conta? Crie uma
        </Link>
      </div>
    </div>
  );
}
