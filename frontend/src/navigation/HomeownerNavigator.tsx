import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import HomeownerDashboardScreen
  from '../screens/homeowner/HomeownerDashboardScreen';

import MyAppliancesScreen
  from '../screens/homeowner/MyAppliancesScreen';

import AddApplianceScreen
  from '../screens/homeowner/AddApplianceScreen';

import ApplianceDetailsScreen
  from '../screens/homeowner/ApplianceDetailsScreen';

  import HomeownerProfileScreen
  from '../screens/homeowner/HomeownerProfileScreen';
  import MaintenanceCalendarScreen
  from '../screens/homeowner/MaintenanceCalendarScreen';

import ScheduleMaintenanceScreen
  from '../screens/homeowner/ScheduleMaintenanceScreen';
import type {
  HomeownerStackParams,
} from './homeownerTypes';

const Stack =
  createNativeStackNavigator<
    HomeownerStackParams
  >();

export default function HomeownerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={
          HomeownerDashboardScreen
        }
      />

      <Stack.Screen
        name="MyAppliances"
        component={
          MyAppliancesScreen
        }
      />

      <Stack.Screen
        name="AddAppliance"
        component={
          AddApplianceScreen
        }
      />

      <Stack.Screen
        name="ApplianceDetails"
        component={
          ApplianceDetailsScreen
        }
      />
      <Stack.Screen
  name="Profile"
  component={HomeownerProfileScreen}
/>
<Stack.Screen
  name="MaintenanceCalendar"
  component={
    MaintenanceCalendarScreen
  }
/>

<Stack.Screen
  name="ScheduleMaintenance"
  component={
    ScheduleMaintenanceScreen
  }
/>
    </Stack.Navigator>
  );
}