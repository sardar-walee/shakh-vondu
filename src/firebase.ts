import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigData from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
};

// Initialize Firebase App safely
let appInstance;
try {
  appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase init fallback:', e);
  appInstance = initializeApp({
    apiKey: firebaseConfigData.apiKey,
    authDomain: firebaseConfigData.authDomain,
    projectId: firebaseConfigData.projectId,
    appId: firebaseConfigData.appId
  });
}

export const app = appInstance;

// Initialize Firestore safely
let firestoreInstance;
try {
  const customDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigData.firestoreDatabaseId;
  firestoreInstance = customDatabaseId && customDatabaseId !== '(default)'
    ? getFirestore(app, customDatabaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('Custom databaseId fallback to default firestore instance:', e);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Initialize Firebase Auth
export const auth = getAuth(app);
