import type AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persistence } from 'firebase/auth';

// Firebase's default declarations omit this React Native runtime export.
// Keep the public import typed without importing private runtime entry points.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>,
  ): Persistence;
}
