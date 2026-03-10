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

/**
 * Esquema de validação para o formulário de configurações.
 * Garante que os dados de SOS inseridos sejam válidos.
 */
const formSchema = z.object({
  policeNumber: z.string().min(2, 'O número deve ter pelo menos 2 dígitos.'),
  // Transforma a string de contatos (separada por vírgula) em um array de strings.
  emergencyContacts: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
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
    // O valor inicial dos contatos é um array, mas o campo do formulário é uma string.
    // `join(', ')` converte o array em uma string separada por vírgulas.
    defaultValues: {
      ...sosSettings,
      emergencyContacts: sosSettings.emergencyContacts.join(', '),
    },
  });

  // `useEffect` para atualizar o formulário se as configurações no contexto mudarem.
  useEffect(() => {
    form.reset({
      ...sosSettings,
      emergencyContacts: sosSettings.emergencyContacts.join(', '),
    });
  }, [sosSettings, form]);

  function onSubmit(values: SettingsFormValues) {
    // `zod` já transformou `emergencyContacts` em um array.
    updateSosSettings(values);
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
                <Input placeholder="Separe os números por vírgula" {...field} />
              </FormControl>
              <FormDescription>
                Números de telefone que receberão sua mensagem de alerta.
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
