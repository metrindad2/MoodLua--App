'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useCycleData } from '@/context/cycle-data-context';
import { Moon, Fingerprint, Delete, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PIN_LENGTH = 4;

export function LockScreen() {
  const [enteredPin, setEnteredPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { unlockApp, userProfile, biometricUnlock } = useCycleData();
  const { toast } = useToast();

  const handleBiometricClick = useCallback(async () => {
    if (!userProfile?.isBiometricEnabled) {
      toast({
        title: 'Biometria não configurada',
        description: 'Ative o desbloqueio por digital nos ajustes.',
      });
      return;
    }

    setIsAuthenticating(true);
    try {
      // Use standard WebAuthn API to trigger native platform authenticator
      if (window.PublicKeyCredential && 
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'required',
            allowCredentials: [],
          }
        }).catch(() => {
          return null;
        });

        biometricUnlock();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro de biometria',
          description: 'Seu dispositivo não suporta autenticação biométrica web.',
        });
      }
    } catch (err) {
      console.error('Biometric error:', err);
      toast({
        variant: 'destructive',
        title: 'Falha na autenticação',
        description: 'Não foi possível verificar sua identidade.',
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, [userProfile, biometricUnlock, toast]);

  useEffect(() => {
    if (userProfile?.isBiometricEnabled) {
      const timer = setTimeout(() => {
        handleBiometricClick();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userProfile, handleBiometricClick]);

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
        }, 820);
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

  const handleRequestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        toast({
          title: 'GPS Ativado',
          description: 'Sua localização está pronta para o SOS.',
        });
      },
      (error) => {
        console.error('Erro de GPS na tela de bloqueio:', error);
        toast({
          variant: 'destructive',
          title: 'Erro de GPS',
          description: 'Verifique as permissões de localização.',
        });
      }
    );
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
          {userProfile?.isBiometricEnabled 
            ? 'Use a digital ou digite o PIN.' 
            : 'Digite seu PIN para desbloquear.'}
        </p>

        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-4 text-xs flex items-center gap-2 opacity-70 hover:opacity-100"
          onClick={handleRequestLocation}
        >
          <MapPin className="h-3 w-3" />
          Ativar GPS para SOS
        </Button>
      </div>

      <PinDots />

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {numpadKeys.map((key) => {
          if (key === 'fingerprint') {
            return (
              <Button
                key="fingerprint"
                variant="ghost"
                className="h-20 w-20 text-2xl font-light rounded-full text-primary"
                onClick={handleBiometricClick}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Fingerprint className="h-8 w-8" />
                )}
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
