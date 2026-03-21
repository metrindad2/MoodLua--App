'use client';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

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

// Re-exporting everything
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';

// Exporting the initializer
export { initializeFirebase };
