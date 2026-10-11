import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Metro selects this file on web; Firebase uses browser persistence.
export function initializePlatformAuth(app: FirebaseApp) {
  return getAuth(app);
}
