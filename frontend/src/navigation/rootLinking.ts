import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './rootTypes';
import type { UserRole } from '../services/authService';
import { providerLinking } from './providerLinking';
export function rootLinking(role?: UserRole): LinkingOptions<RootStackParamList> {
  return { enabled: providerLinking.enabled, prefixes: [], config: { screens:
    role === 'provider' ? { ProviderFlow: { path: '', screens: providerLinking.config!.screens } }
    : role === 'homeowner' ? { HomeownerDashboard: 'homeowner-dashboard' }
    : role === 'technician' ? { TechnicianPending: 'technician' }
    : { RoleSelection: { path: '', alias: ['provider-entry'] }, Login: 'login/:role' }
  } };
}
