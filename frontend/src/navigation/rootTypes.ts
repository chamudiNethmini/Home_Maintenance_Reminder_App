import type {
  NavigatorScreenParams,
} from '@react-navigation/native';

import type {
  ProviderStackParams,
} from './providerTypes';

import type {
  TechnicianStackParamList,
} from './technicianTypes';

export type UserRole =
  | 'homeowner'
  | 'technician'
  | 'provider';

export type RootStackParamList = {
  RoleSelection:
    undefined;

  Login: {
    role:
      UserRole;
  };

  SignUp: {
    role:
      UserRole;
  };

  HomeownerDashboard:
    undefined;

  TechnicianDashboard:
    NavigatorScreenParams<TechnicianStackParamList>;

  ProviderFlow:
    NavigatorScreenParams<ProviderStackParams>;
};