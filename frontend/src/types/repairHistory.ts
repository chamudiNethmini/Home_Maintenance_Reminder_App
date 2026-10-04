export type RepairHistory = {
  id: string;

  serviceRequestId: string;

  applianceId: string;
  applianceName: string;

  technicianId: string;

  status: 'completed';

  repairNotes: string;

  completedDate: string;

  createdAt?: string;
};