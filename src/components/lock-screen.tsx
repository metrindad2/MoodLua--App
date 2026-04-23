
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useCycleData } from '@/context/cycle-data-context';
import { Moon, Fingerprint, Delete } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PIN_LENGTH = 4;

export function LockScreen() {
  const [enteredPin, setEnteredPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const { unlockApp } = useCycleData();
  const { toast } = useToast();

  useEffect(() => {
    if (enteredPin.length === PIN_LENGTH) {
      const isSuccess = unlockApp(enteredPin);
      if (!isSuccess) {
        setIsShaking(true);
        toast({
          variant: 'destructive',
          title: 'Senha incorreta',
          description: 'Por favor, tente novamente.',
        });
        setTimeout(() => {
          setIsShaking(false);
          setEnteredPin('');
        }, 820); // Duração da animação de shake
      }
    }
  }, [enteredPin, unlockApp, toast]);

  const handleNumberClick = (num: string) => {
    if (enteredPin.length < PIN_LENGTH) {
      setEnteredPin(enteredPin + num);
    }
  };

  const handleDeleteClick = () => {
    setEnteredPin(enteredPin.slice(0, -1));
  };
  
  const handleBiometricClick = () => {
    toast({
      title: 'Desbloqueio por Biometria',
      description:
        'Este recurso depende do seu dispositivo e navegador. Se compatível, seu aparelho solicitará a autenticação.',
    });
  };

  const PinDots = () => (
    <div
      className={cn(
        'flex items-center justify-center gap-4 my-8',
        isShaking && 'animate-shake'
      )}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 w-4 rounded-full border-2 border-primary transition-colors',
            i < enteredPin.length ? 'bg-primary' : 'bg-transparent'
          )}
        />
      ))}
    </div>
  );

  const numpadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'fingerprint', '0', 'delete',
  ];

  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-moodlua-gradient text-foreground p-4">
      <div className="flex flex-col items-center justify-center text-center">
        <Moon className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold mt-4">Bem-vinda de volta!</h1>
        <p className="text-muted-foreground mt-1">
          Digite sua senha para desbloquear.
        </p>
      </div>

      <PinDots />

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {numpadKeys.map((key) => {
          if (key === 'fingerprint') {
            return (
              <Button
                key="fingerprint"
                variant="ghost"
                className="h-20 w-20 text-2xl font-light rounded-full text-muted-foreground"
                onClick={handleBiometricClick}
              >
                <Fingerprint className="h-8 w-8" />
              </Button>
            );
          }
          if (key === 'delete') {
            return (
              <Button
                key="delete"
                variant="ghost"
                className="h-20 w-20 text-2xl font-light rounded-full text-muted-foreground"
                onClick={handleDeleteClick}
                disabled={enteredPin.length === 0}
              >
                <Delete />
              </Button>
            );
          }
          return (
            <Button
              key={key}
              variant="ghost"
              className="h-20 w-20 text-3xl font-light rounded-full"
              onClick={() => handleNumberClick(key)}
            >
              {key}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
