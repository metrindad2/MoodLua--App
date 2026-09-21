'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useCycleData } from '@/context/cycle-data-context';
import { Moon, Fingerprint, Delete, Loader2 } from 'lucide-react';

const PIN_LENGTH = 4;

export function LockScreen() {
  const [enteredPin, setEnteredPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { unlockApp, userProfile, biometricUnlock } = useCycleData();

  const handleBiometricClick = useCallback(async () => {
    if (!userProfile?.isBiometricEnabled) return;

    setIsAuthenticating(true);
    try {
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
        }).catch(() => null);

        biometricUnlock();
      }
    } catch (err) {
      console.error('Biometric error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  }, [userProfile, biometricUnlock]);

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
        setTimeout(() => {
          setIsShaking(false);
          setEnteredPin('');
        }, 820);
      }
    }
  }, [enteredPin, unlockApp]);

  const handleNumberClick = (num: string) => {
    if (enteredPin.length < PIN_LENGTH) {
      setEnteredPin(enteredPin + num);
    }
  };

  const handleDeleteClick = () => {
    setEnteredPin(enteredPin.slice(0, -1));
  };

  const PinDots = () => (
    <div
      className={cn(
        'flex items-center justify-center gap-6 my-12',
        isShaking && 'animate-shake'
      )}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-3 w-3 rounded-full border-2 border-primary transition-all duration-200',
            i < enteredPin.length ? 'bg-primary scale-125' : 'bg-transparent'
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
    <div className="relative flex h-dvh w-full flex-col items-center justify-center bg-moodlua-gradient text-foreground px-6 py-12 select-none overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <Moon className="h-14 w-14 text-primary relative z-10 drop-shadow-sm" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bem-vinda de volta!</h1>
          <p className="text-muted-foreground font-medium">
            {userProfile?.isBiometricEnabled 
              ? 'Use a digital ou digite o PIN.' 
              : 'Digite seu PIN para desbloquear.'}
          </p>
        </div>
      </div>

      <PinDots />

      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {numpadKeys.map((key) => {
          if (key === 'fingerprint') {
            return (
              <Button
                key="fingerprint"
                variant="ghost"
                className={cn(
                  "h-16 w-16 text-primary rounded-full transition-opacity",
                  !userProfile?.isBiometricEnabled && "opacity-0 pointer-events-none"
                )}
                onClick={handleBiometricClick}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  <Fingerprint className="h-7 w-7" />
                )}
              </Button>
            );
          }
          if (key === 'delete') {
            return (
              <Button
                key="delete"
                variant="ghost"
                className="h-16 w-16 text-muted-foreground rounded-full"
                onClick={handleDeleteClick}
                disabled={enteredPin.length === 0}
              >
                <Delete className="h-7 w-7" />
              </Button>
            );
          }
          return (
            <Button
              key={key}
              variant="ghost"
              className="h-16 w-16 text-3xl font-light rounded-full hover:bg-primary/10 active:bg-primary/20"
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
