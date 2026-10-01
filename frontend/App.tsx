import { useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';

import { ProviderModuleProvider } from './src/components/provider/ProviderContext';
import { colors } from './src/components/provider/ProviderUI';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.teal,
    background: colors.background,
    card: colors.white,
    text: colors.navy,
    border: colors.border,
  },
};

export default function App() {
  useEffect(() => {
    if (!__DEV__) return;

    let active = true;
    let cleanup: (() => void) | undefined;

    // Registers optional console tools only.
    // No sample data is inserted on startup.
    void import('./src/dev/providerFirestoreTools')
      .then((module) => {
        if (active) {
          cleanup = module.installProviderDevTools();
        }
      })
      .catch((error) =>
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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />

      <ProviderModuleProvider>
        <NavigationContainer theme={theme}>
          <RootNavigator />
        </NavigationContainer>
      </ProviderModuleProvider>
    </SafeAreaProvider>
  );
}