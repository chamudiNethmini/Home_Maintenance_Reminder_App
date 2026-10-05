import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type HomeownerStackParams = {
  Dashboard: undefined;

  MyAppliances: undefined;

  AddAppliance: undefined;

AddWarranty: {
  applianceId: string;
  applianceName: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
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

  Profile: undefined;
};

export type HomeownerScreenProps<
  T extends keyof HomeownerStackParams,
> =
  NativeStackScreenProps<
    HomeownerStackParams,
    T
  >;