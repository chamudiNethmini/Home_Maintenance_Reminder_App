export type ServiceRequestStatus =
  | 'pending'
  | 'inProgress'
  | 'completed';

export type ServiceRequestPriority =
  | 'low'
  | 'medium'
  | 'high';

export type ServiceRequest = {
  id: string;

  requestId: string;

  applianceId: string;
  applianceName: string;

  customerId: string;
  customerName: string;

  problemDescription: string;

  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;

  technicianId?: string;

  createdAt?: string;
  updatedAt?: string;
};