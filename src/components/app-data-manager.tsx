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
      title: 'Você saiu!',
      description: 'Seus dados locais foram limpos. Faça login para continuar.',
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
              Sair e Limpar Dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação desconectará sua conta Google e apagará todos os dados de ciclo e logs diários salvos <span className="font-bold">neste dispositivo</span>. Seus contatos de emergência e mensagem SOS permanecerão salvos na sua conta na nuvem.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Confirmar e Sair</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs text-muted-foreground mt-3">
            Ao sair, seus dados de ciclo e logs diários salvos neste navegador serão apagados. Seus dados de emergência continuarão salvos na sua conta.
        </p>
      </CardContent>
    </Card>
  );
}
