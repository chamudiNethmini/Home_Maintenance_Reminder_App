import type { LinkingOptions } from '@react-navigation/native';
import { Platform } from 'react-native';
import type { ProviderStackParams } from './providerTypes';

export const providerLinking: LinkingOptions<ProviderStackParams> = {
  enabled: Platform.OS === 'web',
  prefixes: [],
  config: {
    screens: {
      WarrantyProviderEntry: 'provider-entry',
      CreateWarrantyRequest: 'create-warranty-request',
      ProviderHome: {
        screens: {
          Dashboard: 'provider-dashboard',
          Requests: 'warranty-requests',
          Notifications: 'provider-notifications',
          Profile: 'provider-profile',
        },
      },
      CustomerApplianceInfo: 'warranty-request/:warrantyRequestId/customer-appliance',
      DocumentReview: 'warranty-request/:warrantyRequestId/documents',
      WarrantyVerification: 'warranty-request/:warrantyRequestId/verification',
      StatusUpdate: 'warranty-request/:warrantyRequestId/status',
    },
  },
};
