export type NotificationMethod =
  | 'In-App'
  | 'Push Notification'
  | 'Email';

export interface MaintenanceReminder {
  id: string;

  homeownerId: string;

  scheduleId: string;

  applianceId: string;
  applianceName: string;

  maintenanceType: string;
  scheduledDate: string;

  remindBeforeDays: number;
  reminderTime: string;

  notificationMethod: NotificationMethod;

  enabled: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export type SaveMaintenanceReminder = {
  scheduleId: string;

  applianceId: string;
  applianceName: string;

  maintenanceType: string;
  scheduledDate: string;

  remindBeforeDays: number;
  reminderTime: string;

  notificationMethod: NotificationMethod;
};