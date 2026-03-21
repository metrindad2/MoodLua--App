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
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useCycleData } from '@/context/cycle-data-context';
import { UserProfile } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Save, User } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  birthDate: z.coerce.date({
    required_error: 'A data de nascimento é obrigatória.',
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

type SettingsFormValues = z.infer<typeof formSchema>;

export function SettingsForm() {
  const { toast } = useToast();
  const { userProfile, updateUserProfile } = useCycleData();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile?.name || '',
      birthDate: userProfile?.birthDate
        ? new Date(userProfile.birthDate + 'T00:00:00')
        : undefined,
      cycleLengthDays: userProfile?.cycleLengthDays || 28,
      flowDurationDays: userProfile?.flowDurationDays || 5,
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        birthDate: userProfile.birthDate
          ? new Date(userProfile.birthDate + 'T00:00:00')
          : undefined,
        cycleLengthDays: userProfile.cycleLengthDays,
        flowDurationDays: userProfile.flowDurationDays,
      });
    }
  }, [userProfile, form]);

  function onSubmit(values: SettingsFormValues) {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      name: values.name,
      birthDate: format(values.birthDate, 'yyyy-MM-dd'),
      cycleLengthDays: values.cycleLengthDays,
      flowDurationDays: values.flowDurationDays,
    };
    updateUserProfile(updatedProfile);

    toast({
      title: 'Perfil Atualizado!',
      description: 'Suas informações foram salvas com sucesso.',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil
        </CardTitle>
        <CardDescription>
          Edite seu nome e as informações do seu ciclo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cycleLengthDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração do Ciclo</FormLabel>
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
                    <FormLabel>Duração da Menstruação</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
