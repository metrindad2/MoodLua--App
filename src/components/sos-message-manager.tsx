'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCycleData } from '@/context/cycle-data-context';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { DEFAULT_SOS_MESSAGE } from '@/lib/config';

const messageSchema = z.object({
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.').max(350, 'A mensagem não pode ter mais de 350 caracteres.'),
});

export function SosMessageManager() {
  const { sosMessage, updateSosMessage } = useCycleData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: sosMessage },
  });

  // Update form default value when context data loads
  useEffect(() => {
    form.reset({ message: sosMessage });
  }, [sosMessage, form]);

  function onSubmit(values: z.infer<typeof messageSchema>) {
    updateSosMessage(values.message);
    toast({ title: 'Mensagem de SOS atualizada!', description: 'Sua nova mensagem foi salva com sucesso.' });
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mensagem de Emergência</CardTitle>
          <CardDescription>
            Personalize o texto que será enviado aos seus contatos.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mensagem Personalizada</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={DEFAULT_SOS_MESSAGE}
                                {...field}
                                rows={6}
                             />
                        </FormControl>
                         <FormDescription>
                            O link da sua localização será adicionado automaticamente.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Salvar Mensagem
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}
