import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TechnicianDashboardScreen from '../screens/technician/TechnicianDashboardScreen';
import ServiceRequestsScreen from '../screens/technician/ServiceRequestsScreen';
import ApplianceInformationScreen from '../screens/technician/ApplianceInformationScreen';
import UpdateServiceStatusScreen from '../screens/technician/UpdateServiceStatusScreen';

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

      <Stack.Screen
        name="ApplianceInformation"
        component={ApplianceInformationScreen}
      />

      <Stack.Screen
        name="UpdateServiceStatus"
        component={UpdateServiceStatusScreen}
      />
    </Stack.Navigator>
  );
}