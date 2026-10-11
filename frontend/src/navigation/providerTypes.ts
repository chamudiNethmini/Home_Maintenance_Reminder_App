import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StoredRequestStatus } from '../types/provider';
export type ProviderTabParams = { Dashboard: undefined; Requests: undefined; Notifications: undefined; Profile: undefined };
export type ProviderStackParams = {
  WarrantyProviderEntry: undefined;
  CreateWarrantyRequest: undefined;
  ProviderHome: NavigatorScreenParams<ProviderTabParams>;
  CustomerApplianceInfo: { warrantyRequestId: string };
  DocumentReview: { warrantyRequestId: string };
  WarrantyVerification: { warrantyRequestId: string };
  StatusUpdate: { warrantyRequestId: string; pendingDecision?: StoredRequestStatus; verificationNotes?: string };
};
export type ProviderScreenProps<T extends keyof ProviderStackParams> = NativeStackScreenProps<ProviderStackParams, T>;
export type ProviderTabProps<T extends keyof ProviderTabParams> = CompositeScreenProps<BottomTabScreenProps<ProviderTabParams, T>, NativeStackScreenProps<ProviderStackParams>>;
