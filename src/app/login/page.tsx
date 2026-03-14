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
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppIntroCarousel } from '@/components/app-intro-carousel';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

export default function LoginPage() {
  // Isto é um login simulado. Em um app real, você chamaria o Firebase Auth aqui.
  const { userProfile, loading } = useCycleData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Em um app real, você validaria as credenciais aqui.
    // Para este exemplo educacional, apenas registramos no console.
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
    <div className="flex flex-col items-center justify-center min-h-dvh p-4 bg-gradient-to-b from-purple-900 to-fuchsia-600 text-white">
      <div className="flex flex-col items-center justify-center text-center pt-8 pb-4">
        <Image
          src="/logo.png"
          alt="MoodLua Logo"
          width={56}
          height={56}
          className="mb-2"
        />
        <h1 className="text-3xl font-bold">Bem-vinda de volta!</h1>
      </div>

      <AppIntroCarousel />

      <Card className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 p-6 mt-4 text-white">
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
                        className="bg-white/20 border-none placeholder:text-white/70"
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
                        className="bg-white/20 border-none placeholder:text-white/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-white/30 hover:bg-white/40 text-white font-bold text-base py-6"
              >
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center pb-8">
        <Link href="/" className="text-sm text-white/80 hover:text-white">
          Não tem conta? Crie uma
        </Link>
      </div>
    </div>
  );
}
