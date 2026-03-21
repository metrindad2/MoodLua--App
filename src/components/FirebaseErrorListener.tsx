'use client';
import { useEffect } from 'react';
import { errorEmitter } from '../firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '../firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Log the full error to the console for debugging purposes, regardless of environment.
      console.error(error);
      
      // Show a helpful toast message to the user/developer.
      toast({
        variant: 'destructive',
        title: 'Erro de Permissão do Firebase',
        description: 'A solicitação foi bloqueada pelas regras de segurança. Verifique se o usuário está autenticado e se as regras do Firestore permitem o acesso.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
