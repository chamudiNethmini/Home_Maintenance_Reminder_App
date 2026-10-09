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

import AddWarrantyScreen
  from '../screens/warranty/AddWarrantyScreen';

import UploadDocumentsScreen
  from '../screens/warranty/UploadDocumentsScreen';

import MyWarrantyScreen
  from '../screens/warranty/MyWarrantyScreen';

import WarrantyDetailsScreen
  from '../screens/warranty/WarrantyDetailsScreen';

import EditWarrantyScreen
  from '../screens/warranty/EditWarrantyScreen';

import HomeownerProfileScreen
  from '../screens/homeowner/HomeownerProfileScreen';

import MaintenanceCalendarScreen
  from '../screens/homeowner/MaintenanceCalendarScreen';

import ScheduleMaintenanceScreen
  from '../screens/homeowner/ScheduleMaintenanceScreen';

import ReminderSettingsScreen
  from '../screens/homeowner/ReminderSettingsScreen';

import SetExpiryReminderScreen
  from '../screens/warranty/SetExpiryReminderScreen';


import NotificationsScreen from '../screens/warranty/NotificationsScreen';

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
        component={HomeownerDashboardScreen}
      />

      <Stack.Screen
        name="MyAppliances"
        component={MyAppliancesScreen}
      />

      <Stack.Screen
        name="AddAppliance"
        component={AddApplianceScreen}
      />

      <Stack.Screen
        name="ApplianceDetails"
        component={ApplianceDetailsScreen}
      />

      <Stack.Screen
        name="AddWarranty"
        component={AddWarrantyScreen}
      />

      <Stack.Screen
        name="UploadDocuments"
        component={UploadDocumentsScreen}
      />

      <Stack.Screen
        name="MyWarranty"
        component={MyWarrantyScreen}
      />

      <Stack.Screen
        name="WarrantyDetails"
        component={WarrantyDetailsScreen}
      />

<Stack.Screen
  name="SetExpiryReminder"
  component={SetExpiryReminderScreen}
/>

<Stack.Screen
  name="Notifications"
  component={NotificationsScreen}
/>

      <Stack.Screen
        name="EditWarranty"
        component={EditWarrantyScreen}
      />

      <Stack.Screen
        name="Profile"
        component={HomeownerProfileScreen}
      />

      <Stack.Screen
        name="MaintenanceCalendar"
        component={MaintenanceCalendarScreen}
      />

      <Stack.Screen
        name="ScheduleMaintenance"
        component={ScheduleMaintenanceScreen}
      />

      <Stack.Screen
        name="ReminderSettings"
        component={ReminderSettingsScreen}
      />
    </Stack.Navigator>
  );
}