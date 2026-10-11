import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Android and iOS keep login sessions in AsyncStorage.
export function initializePlatformAuth(app: FirebaseApp) {
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
