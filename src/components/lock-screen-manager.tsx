'use client';

import { useState } from 'react';
import { useCycleData } from '@/context/cycle-data-context';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { LockKeyhole, Fingerprint } from 'lucide-react';

const PIN_LENGTH = 4;

export function LockScreenManager() {
  const { userProfile, enableLock, disableLock, enableBiometric } = useCycleData();
  const { toast } = useToast();

  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleToggleSwitch = (checked: boolean) => {
    if (checked) {
      resetEnableForm();
      setIsEnableDialogOpen(true);
    } else {
      setIsDisableConfirmOpen(true);
    }
  };

  const handleToggleBiometric = (checked: boolean) => {
    enableBiometric(checked);
    toast({
      title: checked ? 'Biometria ativada!' : 'Biometria desativada.',
      description: checked ? 'Você poderá usar sua digital para desbloquear.' : 'Use apenas o PIN para acessar.',
    });
  };

  const resetEnableForm = () => {
    setNewPin('');
    setConfirmPin('');
    setError('');
  };

  const handleEnableLock = () => {
    if (newPin.length !== PIN_LENGTH) {
      setError(`A senha deve ter ${PIN_LENGTH} dígitos.`);
      return;
    }
    if (newPin !== confirmPin) {
      setError('As senhas não correspondem.');
      return;
    }
    enableLock(newPin);
    toast({ title: 'Bloqueio de tela ativado!' });
    setIsEnableDialogOpen(false);
  };
  
  const handleOpenChangeDialog = () => {
      resetEnableForm();
      setIsChangeDialogOpen(true);
  }

  const handleChangePin = () => {
    if (newPin.length !== PIN_LENGTH) {
      setError(`A nova senha deve ter ${PIN_LENGTH} dígitos.`);
      return;
    }
     if (newPin !== confirmPin) {
      setError('As senhas não correspondem.');
      return;
    }
    enableLock(newPin);
    toast({ title: 'Senha alterada com sucesso!' });
    setIsChangeDialogOpen(false);
  }

  const handleDisableLock = () => {
    disableLock();
    toast({ title: 'Bloqueio de tela desativado.' });
    setIsDisableConfirmOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LockKeyhole className="w-5 h-5" />
            Bloqueio de Tela
          </CardTitle>
          <CardDescription>
            Proteja o acesso ao aplicativo com senha e biometria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <label htmlFor="lock-switch" className="font-medium">
              Ativar senha PIN
            </label>
            <Switch
              id="lock-switch"
              checked={userProfile?.isLockEnabled || false}
              onCheckedChange={handleToggleSwitch}
            />
          </div>

          {userProfile?.isLockEnabled && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <label htmlFor="biometric-switch" className="font-medium">
                    Desbloqueio Digital
                  </label>
                </div>
                <Switch
                  id="biometric-switch"
                  checked={userProfile?.isBiometricEnabled || false}
                  onCheckedChange={handleToggleBiometric}
                />
              </div>
              <Button variant="outline" className="w-full" onClick={handleOpenChangeDialog}>Alterar Senha PIN</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog to Enable Lock */}
      <Dialog open={isEnableDialogOpen} onOpenChange={setIsEnableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar Bloqueio de Tela</DialogTitle>
            <DialogDescription>
              Crie uma senha de {PIN_LENGTH} dígitos para proteger seu
              aplicativo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={PIN_LENGTH}
              placeholder="Digite a nova senha"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <Input
              type="password"
              inputMode="numeric"
              maxLength={PIN_LENGTH}
              placeholder="Confirme a nova senha"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEnableLock}>Salvar e Ativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Dialog to Change PIN */}
      <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Crie uma nova senha de {PIN_LENGTH} dígitos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={PIN_LENGTH}
              placeholder="Digite a nova senha"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <Input
              type="password"
              inputMode="numeric"
              maxLength={PIN_LENGTH}
              placeholder="Confirme a nova senha"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleChangePin}>Salvar Nova Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog to Disable Lock */}
      <AlertDialog
        open={isDisableConfirmOpen}
        onOpenChange={setIsDisableConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar o bloqueio de tela?</AlertDialogTitle>
            <AlertDialogDescription>
              Se você desativar, o aplicativo não pedirá mais senha nem digital para abrir.
              Tem certeza que quer continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableLock}>
              Sim, desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
