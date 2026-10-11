import type {
  User,
} from 'firebase/auth';

import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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

/* =========================
   SIGN UP
========================= */

export async function signupUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<LoggedInUser> {
  let createdUser:
    User | null = null;

  try {
    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName) {
      throw new Error(
        'Please enter your full name.',
      );
    }

    if (!cleanEmail) {
      throw new Error(
        'Please enter your email address.',
      );
    }

    if (
      password.length < 6
    ) {
      throw new Error(
        'Password must contain at least 6 characters.',
      );
    }

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );

    createdUser =
      credential.user;

    /*
     * Store the name in Firebase Authentication
     */
    await updateProfile(
      createdUser,
      {
        displayName:
          cleanName,
      },
    );

    /*
     * Create the shared Firestore user profile
     *
     * users/{uid}
     */
    await setDoc(
      doc(
        db,
        'users',
        createdUser.uid,
      ),
      {
        uid:
          createdUser.uid,

        name:
          cleanName,

        email:
          cleanEmail,

        role,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

    return {
      uid:
        createdUser.uid,

      name:
        cleanName,

      email:
        cleanEmail,

      role,
    };
  } catch (
    error: any
  ) {
    /*
     * If Firebase Auth account was created
     * but Firestore profile creation failed,
     * remove the incomplete account.
     */
    if (
      createdUser
    ) {
      try {
        await deleteUser(
          createdUser,
        );
      } catch {
        // Ignore rollback error.
      }
    }

    /*
     * Keep our own validation errors.
     */
    if (
      error?.message ===
        'Please enter your full name.' ||
      error?.message ===
        'Please enter your email address.' ||
      error?.message ===
        'Password must contain at least 6 characters.'
    ) {
      throw error;
    }

    switch (
      error?.code
    ) {
      case 'auth/email-already-in-use':
        throw new Error(
          'An account already exists with this email address.',
        );

      case 'auth/invalid-email':
        throw new Error(
          'Please enter a valid email address.',
        );

      case 'auth/weak-password':
        throw new Error(
          'Please choose a stronger password.',
        );

      case 'auth/network-request-failed':
        throw new Error(
          'Network error. Please check your connection and try again.',
        );

      case 'auth/operation-not-allowed':
        throw new Error(
          'Email and password sign up is currently unavailable.',
        );

      default:
        throw new Error(
          'Unable to create your account. Please try again.',
        );
    }
  }
}

/* =========================
   LOGIN
========================= */

export async function loginUser(
  email: string,
  password: string,
  expectedRole: UserRole,
): Promise<LoggedInUser> {
  try {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

    const firebaseUser =
      credential.user;

    const profile =
      await getUserProfile(
        firebaseUser,
      );

    const userRole =
      profile.role;

    if (
      userRole !==
      expectedRole
    ) {
      await signOut(
        auth,
      );

      throw new Error(
        `This account is registered as ${getRoleName(
          userRole,
        )}, not ${getRoleName(
          expectedRole,
        )}.`,
      );
    }

    return profile;
  } catch (
    error: any
  ) {
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

    switch (
      error?.code
    ) {
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

/* =========================
   LOGOUT
========================= */

export async function logoutUser() {
  await signOut(
    auth,
  );
}

/* =========================
   ROLE NAME
========================= */

function getRoleName(
  role: UserRole,
) {
  if (
    role ===
    'homeowner'
  ) {
    return 'Homeowner';
  }

  if (
    role ===
    'technician'
  ) {
    return 'Technician';
  }

  return 'Warranty Provider';
}

/* =========================
   LOAD USER PROFILE
========================= */

export async function getUserProfile(
  user: User,
): Promise<LoggedInUser> {
  const snapshot =
    await getDoc(
      doc(
        db,
        'users',
        user.uid,
      ),
    );

  if (
    !snapshot.exists()
  ) {
    throw new Error(
      'User profile was not found.',
    );
  }

  const data =
    snapshot.data();

  const role =
    data.role;

  if (
    role !== 'provider' &&
    role !== 'homeowner' &&
    role !== 'technician'
  ) {
    throw new Error(
      'Invalid user role.',
    );
  }

  return {
    uid:
      user.uid,

    role,

    name:
      user.displayName ||
      (
        typeof data.name ===
        'string'
          ? data.name
          : ''
      ),

    email:
      user.email ||
      (
        typeof data.email ===
        'string'
          ? data.email
          : ''
      ),
  };
}    