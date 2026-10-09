import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type HomeownerStackParams = {
  Dashboard: undefined;

  MyAppliances: undefined;

  AddAppliance: undefined;

 

  MyWarranty: undefined;

  EditWarranty: undefined;

  

AddWarranty: {
  applianceId: string;
  applianceName: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  mode?: 'add' | 'edit';
};

  ApplianceDetails: {
    applianceId: string;
  };

  MaintenanceCalendar:
    undefined;

  ScheduleMaintenance: {
    applianceId?: string;
  };
  ReminderSettings: {
  scheduleId?: string;
};



WarrantyDetails: {
  applianceId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  expiry: string;
  status: string;
  icon: string;
  purchaseDate: string;
  warrantyPeriod: string;
  warrantyCardUri?: string;
  purchaseReceiptUri?: string;
};

UploadDocuments: {
  warrantyId: string;
} | undefined;

SetExpiryReminder: {
  applianceName: string;
  expiry: string;
};



Notifications: undefined;

Profile: undefined;
};

export type HomeownerScreenProps<
  T extends keyof HomeownerStackParams,
> =
  NativeStackScreenProps<
    HomeownerStackParams,
    T
  >;