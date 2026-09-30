import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import ProviderNavigator from './src/navigation/ProviderNavigator';
import { ProviderModuleProvider } from './src/components/provider/ProviderContext';
import { colors } from './src/components/provider/ProviderUI';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.teal, background: colors.background, card: colors.white, text: colors.navy, border: colors.border } };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ProviderModuleProvider>
        <NavigationContainer theme={theme}>
          <ProviderNavigator />
        </NavigationContainer>
      </ProviderModuleProvider>
    </SafeAreaProvider>
  );
}
