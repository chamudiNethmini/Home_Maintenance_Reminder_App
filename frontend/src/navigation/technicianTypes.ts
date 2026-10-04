export type TechnicianStackParamList = {
  TechnicianDashboard: undefined;

  ServiceRequests: undefined;

  ApplianceInformation: {
    serviceRequestId: string;
  };

  UpdateServiceStatus: {
    serviceRequestId: string;
  };

  RepairHistory: undefined;
};