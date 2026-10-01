import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeownerDashboardScreen from '../screens/homeowner/HomeownerDashboardScreen';

import ProviderNavigator from './ProviderNavigator';

import type { RootStackParamList } from './rootTypes';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="RoleSelection"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="HomeownerDashboard"
        component={HomeownerDashboardScreen}
      />

      <Stack.Screen
        name="ProviderFlow"
        component={ProviderNavigator}
      />
    </Stack.Navigator>
  );
}