import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  auth,
} from '../../config/firebase';

import {
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  type LoggedInUser,
  type UserRole,
} from '../../services/authService';

type Session = {
  user:
    LoggedInUser | null;

  loading:
    boolean;

  error:
    string;

  login:
    (
      email: string,
      password: string,
      role: UserRole,
    ) => Promise<void>;

  signup:
    (
      name: string,
      email: string,
      password: string,
      role: UserRole,
    ) => Promise<void>;

  logout:
    () => Promise<void>;
};

const Context =
  createContext<Session | null>(
    null,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<LoggedInUser | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState('');

  /*
   * Used for both login and signup.
   * This prevents onAuthStateChanged
   * from trying to load the profile
   * before login/signup is finished.
   */
  const authAction =
    useRef(
      false,
    );

  const generation =
    useRef(
      0,
    );

  useEffect(
    () => {
      const unsubscribe =
        onAuthStateChanged(
          auth,
          (
            firebaseUser,
          ) => {
            const version =
              ++generation.current;

            /*
             * Login/signup function will
             * handle the session.
             */
            if (
              authAction.current
            ) {
              return;
            }

            setUser(
              null,
            );

            setError(
              '',
            );

            setLoading(
              true,
            );

            if (
              !firebaseUser
            ) {
              setLoading(
                false,
              );

              return;
            }

            void getUserProfile(
              firebaseUser,
            )
              .then(
                (
                  profile,
                ) => {
                  if (
                    version ===
                    generation.current
                  ) {
                    setUser(
                      profile,
                    );
                  }
                },
              )
              .catch(
                (
                  cause,
                ) => {
                  if (
                    version ===
                    generation.current
                  ) {
                    setError(
                      cause instanceof
                        Error
                        ? cause.message
                        : 'Could not load your account.',
                    );
                  }
                },
              )
              .finally(
                () => {
                  if (
                    version ===
                    generation.current
                  ) {
                    setLoading(
                      false,
                    );
                  }
                },
              );
          },
        );

      return () => {
        generation.current++;

        unsubscribe();
      };
    },
    [],
  );

  /* =========================
     LOGIN
  ========================= */

  async function login(
    email: string,
    password: string,
    role: UserRole,
  ) {
    if (
      authAction.current
    ) {
      return;
    }

    authAction.current =
      true;

    generation.current++;

    setError(
      '',
    );

    setLoading(
      true,
    );

    try {
      const profile =
        await loginUser(
          email,
          password,
          role,
        );

      if (
        auth.currentUser?.uid ===
        profile.uid
      ) {
        setUser(
          profile,
        );
      }
    } catch (
      cause
    ) {
      setUser(
        null,
      );

      await logoutUser();

      throw cause;
    } finally {
      authAction.current =
        false;

      setLoading(
        false,
      );
    }
  }

  /* =========================
     SIGN UP
  ========================= */

  async function signup(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) {
    if (
      authAction.current
    ) {
      return;
    }

    authAction.current =
      true;

    generation.current++;

    setError(
      '',
    );

    setLoading(
      true,
    );

    try {
      const profile =
        await signupUser(
          name,
          email,
          password,
          role,
        );

      if (
        auth.currentUser?.uid ===
        profile.uid
      ) {
        setUser(
          profile,
        );
      }
    } catch (
      cause
    ) {
      setUser(
        null,
      );

      /*
       * signupUser already attempts
       * rollback if account creation
       * partially fails.
       */
      if (
        auth.currentUser
      ) {
        await logoutUser();
      }

      throw cause;
    } finally {
      authAction.current =
        false;

      setLoading(
        false,
      );
    }
  }

  /* =========================
     LOGOUT
  ========================= */

  async function logout() {
    await logoutUser();

    generation.current++;

    setUser(
      null,
    );

    setError(
      '',
    );
  }

  return (
    <Context.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const value =
    useContext(
      Context,
    );

  if (
    !value
  ) {
    throw new Error(
      'AuthProvider is required.',
    );
  }

  return value;
}