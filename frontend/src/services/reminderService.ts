import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../config/firebase';

import type {
  MaintenanceReminder,
  SaveMaintenanceReminder,
} from '../types/reminder';

const COLLECTION_NAME =
  'maintenanceReminders';

function getCurrentHomeownerId() {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      'You must be logged in to manage reminders.',
    );
  }

  return user.uid;
}

function timestampToString(
  value: unknown,
): string | undefined {
  if (value instanceof Timestamp) {
    return value
      .toDate()
      .toISOString();
  }

  return undefined;
}

function getReminderDocumentId(
  homeownerId: string,
  scheduleId: string,
) {
  return `${homeownerId}_${scheduleId}`;
}

export async function getReminderByScheduleId(
  scheduleId: string,
): Promise<MaintenanceReminder | null> {
  const homeownerId =
    getCurrentHomeownerId();

  const reminderId =
    getReminderDocumentId(
      homeownerId,
      scheduleId,
    );

  const snapshot =
    await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        reminderId,
      ),
    );

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  return {
    id: snapshot.id,

    homeownerId:
      data.homeownerId ?? '',

    scheduleId:
      data.scheduleId ?? '',

    applianceId:
      data.applianceId ?? '',

    applianceName:
      data.applianceName ?? '',

    maintenanceType:
      data.maintenanceType ?? '',

    scheduledDate:
      data.scheduledDate ?? '',

    remindBeforeDays:
      typeof data.remindBeforeDays ===
      'number'
        ? data.remindBeforeDays
        : 1,

    reminderTime:
      data.reminderTime ??
      '09:00',

    notificationMethod:
      data.notificationMethod ??
      'In-App',

    enabled:
      data.enabled !== false,

    createdAt:
      timestampToString(
        data.createdAt,
      ),

    updatedAt:
      timestampToString(
        data.updatedAt,
      ),
  };
}

export async function saveMaintenanceReminder(
  reminder: SaveMaintenanceReminder,
): Promise<void> {
  const homeownerId =
    getCurrentHomeownerId();

  const reminderId =
    getReminderDocumentId(
      homeownerId,
      reminder.scheduleId,
    );

  const reminderRef =
    doc(
      db,
      COLLECTION_NAME,
      reminderId,
    );

  const existing =
    await getDoc(
      reminderRef,
    );

  await setDoc(
    reminderRef,
    {
      homeownerId,

      scheduleId:
        reminder.scheduleId,

      applianceId:
        reminder.applianceId,

      applianceName:
        reminder.applianceName,

      maintenanceType:
        reminder.maintenanceType,

      scheduledDate:
        reminder.scheduledDate,

      remindBeforeDays:
        reminder.remindBeforeDays,

      reminderTime:
        reminder.reminderTime,

      notificationMethod:
        reminder.notificationMethod,

      enabled: true,

      ...(!existing.exists()
        ? {
            createdAt:
              serverTimestamp(),
          }
        : {}),

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export async function deleteMaintenanceReminder(
  scheduleId: string,
): Promise<void> {
  const homeownerId =
    getCurrentHomeownerId();

  const reminderId =
    getReminderDocumentId(
      homeownerId,
      scheduleId,
    );

  await deleteDoc(
    doc(
      db,
      COLLECTION_NAME,
      reminderId,
    ),
  );
}