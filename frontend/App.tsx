import {
  useEffect,
  useMemo,
} from 'react';

import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
  Platform,
  StatusBar,
} from 'react-native';

import RootNavigator
  from './src/navigation/RootNavigator';

import {
  AuthProvider,
  useAuth,
} from './src/components/auth/AuthContext';

import {
  rootLinking,
} from './src/navigation/rootLinking';

import {
  Button,
  Notice,
  Page,
  colors,
} from './src/components/provider/ProviderUI';

import {
  LoadingState,
  MutationState,
} from './src/components/provider/ProviderDataState';

import {
  useProviderMutation,
} from './src/utils/useProviderData';

const theme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    primary:
      colors.teal,

    background:
      colors.background,

    card:
      colors.white,

    text:
      colors.navy,

    border:
      colors.border,
  },
};

export default function App() {
  /*
   * Provider development tools
   */
  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    let active = true;

    let cleanup:
      (() => void) |
      undefined;

    // Registers optional console tools only.
    // No sample data is inserted on startup.
    void import(
      './src/dev/providerFirestoreTools'
    )
      .then(
        (module) => {
          if (active) {
            cleanup =
              module.installProviderDevTools();
          }
        },
      )
      .catch(
        (error) =>
          console.warn(
            'Provider development tools could not be loaded.',
            error,
          ),
      );

    return () => {
      active = false;

      cleanup?.();
    };
  }, []);

  /*
   * Maintenance notification handler
   *
   * Native only:
   * Android / iOS
   *
   * Chrome / Expo Web will skip this.
   */
  useEffect(() => {
    if (
      Platform.OS ===
      'web'
    ) {
      return;
    }

    void import(
      'expo-notifications'
    )
      .then(
        (
          Notifications,
        ) => {
          Notifications.setNotificationHandler(
            {
              handleNotification:
                async () => ({
                  shouldShowBanner:
                    true,

                  shouldShowList:
                    true,

                  shouldPlaySound:
                    true,

                  shouldSetBadge:
                    false,
                }),
            },
          );
        },
      )
      .catch(
        (error) => {
          console.warn(
            'Notification handler could not be loaded.',
            error,
          );
        },
      );
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
      />

      <AuthProvider>
        <AuthenticatedNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AuthenticatedNavigation() {
  const {
    user,
    loading,
    error,
    logout,
  } = useAuth();

  const mutation =
    useProviderMutation();

  const linking =
    useMemo(
      () =>
        rootLinking(
          user?.role,
        ),
      [
        user?.role,
      ],
    );

  if (loading) {
    return (
      <Page title="FixMate">
        <LoadingState
          text="Restoring your session…"
        />
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Account unavailable">
        <Notice
          error
          text={error}
        />

        <MutationState
          {...mutation}
        />

        <Button
          title="Return to login"
          disabled={
            mutation.pending
          }
          onPress={() => {
            void mutation.run(
              logout,
              '',
            );
          }}
        />
      </Page>
    );
  }

  return (
    <NavigationContainer
      theme={theme}
      linking={linking}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}