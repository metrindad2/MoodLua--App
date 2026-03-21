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
import { Moon } from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '@/lib/types';
import { Card, CardContent } from './ui/card';

// Esquema atualizado para o novo formulário de criação de conta
const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  birthDate: z.coerce.date({
    required_error: 'A data de nascimento é obrigatória.',
  }),
  lastMenstruationDate: z.coerce.date({
    required_error: 'A data da última menstruação é obrigatória.',
  }),
  cycleLengthDays: z.coerce
    .number({
      invalid_type_error: 'Deve ser um número válido.',
      required_error: 'A duração do ciclo é obrigatória.',
    })
    .int()
    .min(1, 'A duração do ciclo é obrigatória.')
    .gte(15, 'O ciclo deve ter pelo menos 15 dias.'),
  flowDurationDays: z.coerce
    .number({
      invalid_type_error: 'Deve ser um número válido.',
      required_error: 'A duração da menstruação é obrigatória.',
    })
    .int()
    .min(1, 'A duração da menstruação é obrigatória.'),
});

export default function OnboardingForm() {
  const { updateUserProfile } = useCycleData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cycleLengthDays: 28,
      flowDurationDays: 5,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const userProfile: UserProfile = {
      name: values.name,
      birthDate: format(values.birthDate, 'yyyy-MM-dd'),
      lastMenstruationDate: format(values.lastMenstruationDate, 'yyyy-MM-dd'),
      cycleLengthDays: values.cycleLengthDays,
      flowDurationDays: values.flowDurationDays,
    };
    updateUserProfile(userProfile);
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center pb-4">
        <Moon className="w-14 h-14 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vinda à MoodLua
        </h1>
        <p className="text-muted-foreground mt-2">Vamos começar sua jornada.</p>
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
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value instanceof Date
                            ? format(field.value, 'yyyy-MM-dd')
                            : typeof field.value === 'string'
                            ? field.value
                            : ''
                        }
                      />
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
                    <FormLabel>Data da Última Menstruação</FormLabel>
                    <FormControl>
                       <Input
                        type="date"
                        {...field}
                        value={
                          field.value instanceof Date
                            ? format(field.value, 'yyyy-MM-dd')
                            : typeof field.value === 'string'
                            ? field.value
                            : ''
                        }
                      />
                    </FormControl>
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

              <Button type="submit" className="w-full font-bold text-base py-6">
                Começar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
