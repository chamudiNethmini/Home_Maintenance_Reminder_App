import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializePlatformAuth } from './firebaseAuth';

// Direct property access lets Expo inline these values from frontend/.env.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingFields = Object.entries(firebaseConfig)
  .filter(([, value]) => !value?.trim())
  .map(([key]) => key);

if (missingFields.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingFields.join(', ')}. Check frontend/.env and restart Expo.`,
  );
}

// Reuse the default app and Auth instance during Fast Refresh.
const existingApp = getApps().find((app) => app.name === '[DEFAULT]');
const app = existingApp ? getApp() : initializeApp(firebaseConfig);

export const auth = existingApp
  ? getAuth(app)
  : initializePlatformAuth(app);

export const db = getFirestore(app);
