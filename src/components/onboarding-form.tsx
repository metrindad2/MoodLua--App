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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCycleData } from '@/context/cycle-data-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Moon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';

/**
 * Esquema de validação para o formulário de onboarding.
 * O Zod garante que os dados inseridos pela usuária estejam no formato correto
 * antes de serem processados.
 */
const formSchema = z.object({
  lastMenstruationDate: z.date({
    required_error: 'A data da última menstruação é obrigatória.',
  }),
  flowDurationDays: z.coerce.number().int().min(1, 'A duração deve ser de pelo menos 1 dia.'),
  cycleLengthDays: z.coerce.number().int().min(15, 'O ciclo deve ter pelo menos 15 dias.'),
});

/**
 * Formulário de Onboarding (Primeiro Acesso).
 * Este componente é exibido quando a usuária abre o app pela primeira vez.
 * Ele coleta as informações iniciais necessárias para fazer as previsões do ciclo.
 */
export default function OnboardingForm() {
  const { updateUserProfile } = useCycleData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flowDurationDays: 5,
      cycleLengthDays: 28,
    },
  });

  /**
   * Função chamada quando o formulário é enviado.
   * Ela formata os dados e os salva usando o contexto `CycleDataContext`.
   */
  function onSubmit(values: z.infer<typeof formSchema>) {
    const userProfile: UserProfile = {
      ...values,
      lastMenstruationDate: format(values.lastMenstruationDate, 'yyyy-MM-dd'),
    };
    updateUserProfile(userProfile);
  }

  return (
    <div className="p-4 pt-8 h-full flex flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Moon className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Bem-vinda ao MoodLua!</CardTitle>
          <CardDescription>Vamos configurar seu perfil para começar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="lastMenstruationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Última Menstruação</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                          locale={ptBR}
                          weekStartsOn={0}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flowDurationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração da Menstruação (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cycleLengthDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Média do Ciclo (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Começar a Monitorar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
