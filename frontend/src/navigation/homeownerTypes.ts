import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type HomeownerStackParams = {
  Dashboard: undefined;

  MyAppliances: undefined;

  AddAppliance: undefined;

  ApplianceDetails: {
    applianceId: string;
  };

  Profile: undefined;
};

export type HomeownerScreenProps<
  T extends keyof HomeownerStackParams,
> = NativeStackScreenProps<
  HomeownerStackParams,
  T
>;