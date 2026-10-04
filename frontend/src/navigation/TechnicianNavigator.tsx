import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TechnicianDashboardScreen from '../screens/technician/TechnicianDashboardScreen';
import ServiceRequestsScreen from '../screens/technician/ServiceRequestsScreen';

import type { TechnicianStackParamList } from './technicianTypes';

const Stack =
  createNativeStackNavigator<TechnicianStackParamList>();

export default function TechnicianNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TechnicianDashboard"
        component={TechnicianDashboardScreen}
      />

      <Stack.Screen
        name="ServiceRequests"
        component={ServiceRequestsScreen}
      />
    </Stack.Navigator>
  );
}