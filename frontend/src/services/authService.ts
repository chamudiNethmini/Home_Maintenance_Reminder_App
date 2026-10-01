import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../config/firebase';

export type UserRole =
  | 'homeowner'
  | 'technician'
  | 'provider';

export type LoggedInUser = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
};

export async function loginUser(
  email: string,
  password: string,
  expectedRole: UserRole,
): Promise<LoggedInUser> {
  try {
    // Check email and password
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

    const firebaseUser =
      credential.user;

    // Find matching user document in Firestore
    const userRef = doc(
      db,
      'users',
      firebaseUser.uid,
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await signOut(auth);

      throw new Error(
        'User profile was not found.',
      );
    }

    const data =
      userSnapshot.data();

    const userRole =
      data.role as UserRole;

    // Check valid role
    if (
      userRole !== 'homeowner' &&
      userRole !== 'technician' &&
      userRole !== 'provider'
    ) {
      await signOut(auth);

      throw new Error(
        'Invalid user role.',
      );
    }

    // Check selected role matches account role
    if (userRole !== expectedRole) {
      await signOut(auth);

      throw new Error(
        `This account is registered as ${getRoleName(
          userRole,
        )}, not ${getRoleName(
          expectedRole,
        )}.`,
      );
    }

    return {
      uid: firebaseUser.uid,

      name:
        typeof data.name === 'string'
          ? data.name
          : '',

      email:
        typeof data.email === 'string'
          ? data.email
          : firebaseUser.email ?? '',

      role: userRole,
    };
  } catch (error: any) {
    // Keep our custom errors
    if (
      error?.message ===
        'User profile was not found.' ||
      error?.message ===
        'Invalid user role.' ||
      error?.message?.startsWith(
        'This account is registered as',
      )
    ) {
      throw error;
    }

    // Firebase authentication errors
    switch (error?.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        throw new Error(
          'Invalid email or password.',
        );

      case 'auth/invalid-email':
        throw new Error(
          'Please enter a valid email address.',
        );

      case 'auth/user-disabled':
        throw new Error(
          'This account has been disabled.',
        );

      case 'auth/too-many-requests':
        throw new Error(
          'Too many login attempts. Please try again later.',
        );

      default:
        throw new Error(
          'Login failed. Please try again.',
        );
    }
  }
}

export async function logoutUser() {
  await signOut(auth);
}

function getRoleName(
  role: UserRole,
) {
  if (role === 'homeowner') {
    return 'Homeowner';
  }

  if (role === 'technician') {
    return 'Technician';
  }

  return 'Warranty Provider';
}