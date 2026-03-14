'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

/**
 * Esquema de validação para o formulário de configurações.
 * Garante que os dados inseridos sejam válidos.
 */
const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
});

type SettingsFormValues = z.infer<typeof formSchema>;

/**
 * Formulário de Configurações.
 * Permite que a usuária personalize as informações.
 */
export function SettingsForm() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // `useEffect` para atualizar o formulário se as configurações no contexto mudarem.
  useEffect(() => {
    form.reset({
      name: 'Usuária',
    });
  }, [form]);

  function onSubmit(values: SettingsFormValues) {
    toast({
      title: 'Configurações Salvas!',
      description: 'Suas informações foram atualizadas.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} disabled />
              </FormControl>
              <FormDescription>
                A edição do perfil será implementada em breve.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled>Salvar Alterações</Button>
      </form>
    </Form>
  );
}
