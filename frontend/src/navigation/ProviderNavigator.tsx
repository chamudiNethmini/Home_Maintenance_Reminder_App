import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, colors } from '../components/provider/ProviderUI';
import { useProviderModule } from '../components/provider/ProviderContext';
import type { ProviderStackParams, ProviderTabParams } from './providerTypes';
import WarrantyProviderEntryScreen from '../screens/provider/WarrantyProviderEntryScreen';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import WarrantyRequestsScreen from '../screens/provider/WarrantyRequestsScreen';
import CustomerApplianceInfoScreen from '../screens/provider/CustomerApplianceInfoScreen';
import DocumentReviewScreen from '../screens/provider/DocumentReviewScreen';
import WarrantyVerificationScreen from '../screens/provider/WarrantyVerificationScreen';
import StatusUpdateScreen from '../screens/provider/StatusUpdateScreen';
import ProviderNotificationsScreen from '../screens/provider/ProviderNotificationsScreen';
import ProviderProfileScreen from '../screens/provider/ProviderProfileScreen';
const Stack = createNativeStackNavigator<ProviderStackParams>();
const Tabs = createBottomTabNavigator<ProviderTabParams>();
function ProviderTabs() {
  const { state } = useProviderModule();
  const unread = state.notifications.filter(item => !item.isRead).length;
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { borderTopColor: colors.border, paddingTop: 8, paddingBottom: 8, minHeight: 66 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarIcon: ({ color, size }) => <Icon size={size} color={color} name={route.name === 'Dashboard' ? 'grid-outline' : route.name === 'Requests' ? 'file-tray-full-outline' : route.name === 'Notifications' ? 'notifications-outline' : 'person-outline'} />,
  })}>
    <Tabs.Screen name="Dashboard" component={ProviderDashboardScreen} />
    <Tabs.Screen name="Requests" component={WarrantyRequestsScreen} />
    <Tabs.Screen name="Notifications" component={ProviderNotificationsScreen} options={{ tabBarBadge: unread || undefined }} />
    <Tabs.Screen name="Profile" component={ProviderProfileScreen} />
  </Tabs.Navigator>;
}
/** Mount inside the team's NavigationContainer and ProviderModuleProvider. */
export default function ProviderNavigator() {
  return <Stack.Navigator initialRouteName="WarrantyProviderEntry" screenOptions={{ headerTintColor: colors.navy, headerShadowVisible: false, headerStyle: { backgroundColor: colors.background }, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="WarrantyProviderEntry" component={WarrantyProviderEntryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProviderHome" component={ProviderTabs} options={{ headerShown: false }} />
    <Stack.Screen name="CustomerApplianceInfo" component={CustomerApplianceInfoScreen} options={{ title: 'Request details' }} />
    <Stack.Screen name="DocumentReview" component={DocumentReviewScreen} options={{ title: 'Review documents' }} />
    <Stack.Screen name="WarrantyVerification" component={WarrantyVerificationScreen} options={{ title: 'Verify warranty' }} />
    <Stack.Screen name="StatusUpdate" component={StatusUpdateScreen} options={{ title: 'Update status' }} />
  </Stack.Navigator>;
}
