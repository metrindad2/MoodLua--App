'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCycleData } from '@/context/cycle-data-context';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'O nome é muito curto.'),
  phone: z.string().min(10, 'O número de telefone parece inválido.'),
});

export function EmergencyContactManager() {
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact } = useCycleData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '' },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    addEmergencyContact({
      id: Date.now().toString(), // simple unique id
      ...values,
    });
    toast({ title: 'Contato adicionado!', description: `${values.name} foi adicionado à sua lista de emergência.` });
    form.reset();
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Contatos de Emergência</CardTitle>
          <CardDescription>
            Adicione pessoas de confiança para contatar em uma emergência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyContacts.length > 0 && (
            <div className="space-y-3">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-3 rounded-md bg-background border">
                   <div>
                     <p className="font-semibold">{contact.name}</p>
                     <p className="text-sm text-muted-foreground">{contact.phone}</p>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => removeEmergencyContact(contact.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                </div>
              ))}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
               <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Mãe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input type="tel" placeholder="(11) 9...." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
               </div>
              <Button type="submit" className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" /> Adicionar Contato
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
