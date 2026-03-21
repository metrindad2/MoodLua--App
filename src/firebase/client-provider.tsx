'use client';
import React from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

if (!firebaseApp) {
  const initialized = initializeFirebase();
  if (initialized.firebaseApp) {
    firebaseApp = initialized.firebaseApp;
    auth = initialized.auth;
    firestore = initialized.firestore;
  }
}

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider app={firebaseApp} auth={auth} firestore={firestore}>
      {children}
      {firebaseApp && <FirebaseErrorListener />}
    </FirebaseProvider>
  );
}
