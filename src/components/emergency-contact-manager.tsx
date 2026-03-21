'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCycleData } from '@/context/cycle-data-context';
import { EmergencyContact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import {
  Edit,
  Trash2,
  UserPlus,
  Phone,
  Users,
  User as UserIcon,
} from 'lucide-react';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

const contactSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  phone: z
    .string()
    .min(10, 'O telefone deve ter pelo menos 10 dígitos.')
    .regex(/^\d+$/, 'Apenas números são permitidos.'),
});

export function EmergencyContactManager() {
  const { sosContacts, addSosContact, updateSosContact, removeSosContact } =
    useCycleData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] =
    useState<EmergencyContact | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });

  const handleOpenDialog = (contact: EmergencyContact | null = null) => {
    setEditingContact(contact);
    if (contact) {
      form.reset({ name: contact.name, phone: contact.phone });
    } else {
      form.reset({ name: '', phone: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    if (editingContact) {
      updateSosContact({ ...editingContact, ...values });
      toast({ title: 'Contato atualizado!' });
    } else {
      addSosContact(values);
      toast({ title: 'Contato adicionado!' });
    }
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-primary" />
          Contatos de Emergência
        </Label>
        <p className="text-sm text-muted-foreground">
          Pessoas que você confia para receber seus alertas de SOS.
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        {sosContacts.length > 0 ? (
          sosContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-full">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(contact)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir este contato?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação removerá "{contact.name}" da sua lista de
                        contatos de emergência.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeSosContact(contact.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4">
            Nenhum contato de emergência adicionado.
          </p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOpenDialog(null)}
          >
            <UserPlus className="mr-2" />
            Adicionar Contato
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Editar' : 'Adicionar'} Contato
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
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
                    <FormLabel>Telefone (com DDD e país)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Ex: 5511999998888"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar Contato</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
