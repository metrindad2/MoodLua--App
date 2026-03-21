'use client';
import React from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

function initializeFirebase() {
  const apps = getApps();
  let firebaseApp: FirebaseApp | null = null;

  if (firebaseConfig.projectId && firebaseConfig.projectId !== "PLACEHOLDER") {
    if (!apps.length) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
  } else {
    console.warn("Firebase config is not set correctly. Skipping initialization.");
  }
  
  if (!firebaseApp) {
    return { firebaseApp: null, auth: null, firestore: null };
  }


  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

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
