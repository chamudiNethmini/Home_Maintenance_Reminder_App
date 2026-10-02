export type MaintenanceStatus =
  | 'upcoming'
  | 'completed';

export type MaintenanceType =
  | 'Filter Cleaning'
  | 'General Service'
  | 'Deep Cleaning'
  | 'Inspection'
  | 'Repair'
  | 'Other';

export interface MaintenanceSchedule {
  id: string;

  homeownerId: string;

  applianceId: string;
  applianceName: string;

  maintenanceType: MaintenanceType;

  // YYYY-MM-DD
  scheduledDate: string;

  notes: string;

  status: MaintenanceStatus;

  createdAt?: string;
  updatedAt?: string;
}

export type CreateMaintenanceSchedule = {
  applianceId: string;
  applianceName: string;

  maintenanceType: MaintenanceType;

  scheduledDate: string;

  notes: string;
};