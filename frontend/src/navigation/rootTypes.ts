import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ProviderStackParams } from './providerTypes';

export type UserRole =
  | 'homeowner'
  | 'technician'
  | 'provider';

export type RootStackParamList = {
  RoleSelection: undefined;

  Login: {
    role: UserRole;
  };

  HomeownerDashboard: undefined;
  TechnicianPending: undefined;

  ProviderFlow:
    NavigatorScreenParams<ProviderStackParams>;
};