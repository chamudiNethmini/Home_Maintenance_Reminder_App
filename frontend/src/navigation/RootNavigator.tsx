import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';

import HomeownerNavigator from './HomeownerNavigator';
import ProviderNavigator from './ProviderNavigator';
import TechnicianNavigator from './TechnicianNavigator';

import { useAuth } from '../components/auth/AuthContext';

import {
  ProviderModuleProvider,
} from '../components/provider/ProviderContext';

import type { RootStackParamList } from './rootTypes';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

function ProviderFlow() {
  const { user } = useAuth();

  if (user?.role !== 'provider') {
    return null;
  }

  return (
    <ProviderModuleProvider
      key={user.uid}
      authenticatedProviderId={user.uid}
    >
      <ProviderNavigator />
    </ProviderModuleProvider>
  );
}

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Group navigationKey="signed-out">
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        </Stack.Group>
      ) : user.role === 'provider' ? (
        <Stack.Screen
          navigationKey={user.uid}
          name="ProviderFlow"
          component={ProviderFlow}
        />
      ) : user.role === 'homeowner' ? (
        <Stack.Screen
          navigationKey={user.uid}
          name="HomeownerDashboard"
          component={HomeownerNavigator}
        />
      ) : (
        <Stack.Screen
          navigationKey={user.uid}
          name="TechnicianDashboard"
          component={TechnicianNavigator}
        />
      )}
    </Stack.Navigator>
  );
}