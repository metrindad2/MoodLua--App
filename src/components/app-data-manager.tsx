'use client';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCycleData } from '@/context/cycle-data-context';
import { DatabaseZap, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AppDataManager() {
  const { logout } = useCycleData();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Dados Limpos!',
      description: 'Todos os dados do aplicativo foram removidos deste dispositivo.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <DatabaseZap className="w-5 h-5" />
            Dados do Aplicativo
        </CardTitle>
        <CardDescription>
          Gerencie os dados salvos no seu dispositivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Limpar Todos os Dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação apagará permanentemente todos os dados do aplicativo, incluindo seu perfil, histórico de ciclo, logs e contatos de emergência salvos <span className="font-bold">neste dispositivo</span>. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Confirmar e Limpar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs text-muted-foreground mt-3">
            Ao limpar, você terá que configurar o aplicativo do zero novamente.
        </p>
      </CardContent>
    </Card>
  );
}
