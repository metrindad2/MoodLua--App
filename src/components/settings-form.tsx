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
import { Textarea } from '@/components/ui/textarea';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { SosSettings } from '@/lib/types';

/**
 * Esquema de validação para o formulário de configurações.
 * Garante que os dados de SOS inseridos sejam válidos.
 */
const formSchema = z.object({
  policeNumber: z.string().min(2, 'O número deve ter pelo menos 2 dígitos.'),
  emergencyContacts: z.string(), // Recebe uma string com múltiplos contatos, um por linha
  emergencyMessage: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.'),
});

type SettingsFormValues = z.infer<typeof formSchema>;

/**
 * Formulário de Configurações.
 * Permite que a usuária personalize as informações da função SOS.
 */
export function SettingsForm() {
  const { sosSettings, updateSosSettings } = useCycleData();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    // Converte o array de objetos de contatos em uma string de múltiplas linhas para o textarea.
    defaultValues: {
      ...sosSettings,
      emergencyContacts: sosSettings.emergencyContacts.map(c => `${c.name}: ${c.number}`).join('\n'),
    },
  });

  // `useEffect` para atualizar o formulário se as configurações no contexto mudarem.
  useEffect(() => {
    form.reset({
      ...sosSettings,
      emergencyContacts: sosSettings.emergencyContacts.map(c => `${c.name}: ${c.number}`).join('\n'),
    });
  }, [sosSettings, form]);

  function onSubmit(values: SettingsFormValues) {
    // Converte a string do textarea de volta para um array de objetos de contato.
    const contacts = values.emergencyContacts
      .split('\n')
      .map(line => {
        const parts = line.split(':');
        const name = parts[0]?.trim();
        const number = parts.slice(1).join(':').trim(); // Garante que números com ":" funcionem
        if (name && number) {
          return { name, number };
        }
        return null;
      })
      .filter((c): c is { name: string; number: string } => c !== null);
      
    const newSettings: SosSettings = {
        policeNumber: values.policeNumber,
        emergencyMessage: values.emergencyMessage,
        emergencyContacts: contacts,
    };

    updateSosSettings(newSettings);
    toast({
      title: 'Configurações Salvas!',
      description: 'Suas informações de emergência foram atualizadas.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="policeNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da Polícia</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 190" {...field} />
              </FormControl>
              <FormDescription>
                Número para o qual o app ligará em uma emergência.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyContacts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contatos de Emergência</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Um por linha. Ex: Gaby: 11987654321"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Adicione um contato por linha no formato "Nome: Número".
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem de Emergência</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Sua mensagem personalizada..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Esta mensagem será enviada junto com sua localização.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Salvar Alterações</Button>
      </form>
    </Form>
  );
}
