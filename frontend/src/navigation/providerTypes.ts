import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
export type ProviderTabParams = { Dashboard: undefined; Requests: undefined; Notifications: undefined; Profile: undefined };
export type ProviderStackParams = {
  WarrantyProviderEntry: undefined;
  ProviderHome: NavigatorScreenParams<ProviderTabParams>;
  CustomerApplianceInfo: { requestId: string };
  DocumentReview: { requestId: string };
  WarrantyVerification: { requestId: string };
  StatusUpdate: { requestId: string };
};
export type ProviderScreenProps<T extends keyof ProviderStackParams> = NativeStackScreenProps<ProviderStackParams, T>;
export type ProviderTabProps<T extends keyof ProviderTabParams> = CompositeScreenProps<BottomTabScreenProps<ProviderTabParams, T>, NativeStackScreenProps<ProviderStackParams>>;
