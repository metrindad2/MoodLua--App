'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCycleData } from '@/context/cycle-data-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Moon } from 'lucide-react';
import { SimpleCalendar } from './simple-calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent } from './ui/card';

// Esquema atualizado para o novo formulário de criação de conta
const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um email válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  lastMenstruationDate: z.date({
    required_error: 'A data da última menstruação é obrigatória.',
  }),
  cycleLengthDays: z.coerce
    .number()
    .int()
    .min(15, 'O ciclo deve ter pelo menos 15 dias.'),
  flowDurationDays: z.coerce
    .number()
    .int()
    .min(1, 'A duração deve ser de pelo menos 1 dia.'),
});

export default function OnboardingForm() {
  const { updateUserProfile } = useCycleData();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      cycleLengthDays: 28,
      flowDurationDays: 5,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const userProfile: UserProfile = {
      name: values.name,
      email: values.email,
      lastMenstruationDate: format(values.lastMenstruationDate, 'yyyy-MM-dd'),
      cycleLengthDays: values.cycleLengthDays,
      flowDurationDays: values.flowDurationDays,
    };
    updateUserProfile(userProfile);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-4">
      <div className="flex flex-col items-center justify-center text-center pt-8 pb-4">
        <Moon className="w-14 h-14 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-foreground">Bem-vinda à MoodLua</h1>
        <p className="text-muted-foreground mt-2">Crie sua conta para começar a jornada.</p>
      </div>

      <Card className="w-full max-w-md mt-6">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="text" placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastMenstruationDate"
                render={({ field }) => (
                  <FormItem>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-between text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? format(field.value, 'PPP', { locale: ptBR })
                              : 'Data da última menstruação'}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <SimpleCalendar
                          initialDate={field.value || new Date()}
                          selectedDate={field.value}
                          onDateClick={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cycleLengthDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs pl-1">
                        Duração do Ciclo (dias)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flowDurationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs pl-1">
                        Duração da Menstruação
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
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
                      <Input type="password" placeholder="Senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full font-bold text-base py-6">
                Criar conta e começar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center pb-8">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Já tem conta? Faça login
        </Link>
      </div>
    </div>
  );
}
