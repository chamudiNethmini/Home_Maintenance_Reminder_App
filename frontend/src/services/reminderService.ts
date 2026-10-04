import {
  Platform,
} from 'react-native';

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

const NOTIFICATION_CHANNEL =
  'maintenance-reminders';

/* =========================
   CURRENT USER
========================= */

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

/* =========================
   FIRESTORE TIMESTAMP
========================= */

function timestampToString(
  value: unknown,
): string | undefined {
  if (
    value instanceof
    Timestamp
  ) {
    return value
      .toDate()
      .toISOString();
  }

  return undefined;
}

/* =========================
   REMINDER DOCUMENT ID
========================= */

function getReminderDocumentId(
  homeownerId: string,
  scheduleId: string,
) {
  return `${homeownerId}_${scheduleId}`;
}

/* =========================
   LOCAL NOTIFICATION
========================= */
export async function testMaintenanceNotification() {
  if (Platform.OS === 'web') {
    return;
  }

  const Notifications =
    await import(
      'expo-notifications'
    );

  const permission =
    await Notifications.requestPermissionsAsync();

  if (
    permission.status !==
    'granted'
  ) {
    throw new Error(
      'Notification permission was not granted.',
    );
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title:
        'FixMate Test Reminder 🔧',

      body:
        'Your maintenance reminder notification is working.',
    },

    trigger: {
      type:
        Notifications
          .SchedulableTriggerInputTypes
          .TIME_INTERVAL,

      seconds: 10,
    },
  });
}
export async function scheduleMaintenanceNotification(
  scheduledDate: string,
  reminderTime: string,
  remindBeforeDays: number,
  applianceName: string,
  maintenanceType: string,
  scheduleId: string,
): Promise<string | null> {
  /*
   * expo-notifications does not
   * schedule our mobile local
   * notification on web.
   */
  if (
    Platform.OS ===
    'web'
  ) {
    return null;
  }

  const Notifications =
    await import(
      'expo-notifications'
    );

  /*
   * Android requires a
   * notification channel.
   */
  if (
    Platform.OS ===
    'android'
  ) {
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNEL,
      {
        name:
          'Maintenance Reminders',

        importance:
          Notifications
            .AndroidImportance
            .HIGH,

        sound:
          'default',
      },
    );
  }

  /*
   * Check notification permission.
   */
  const currentPermission =
    await Notifications.getPermissionsAsync();

  let permissionStatus =
    currentPermission.status;

  /*
   * Ask permission if
   * not already granted.
   */
  if (
    permissionStatus !==
    'granted'
  ) {
    const requestedPermission =
      await Notifications.requestPermissionsAsync();

    permissionStatus =
      requestedPermission.status;
  }

  if (
    permissionStatus !==
    'granted'
  ) {
    throw new Error(
      'Notification permission was not granted.',
    );
  }

  /*
   * Maintenance date:
   * 2026-10-20
   */
  const [
    year,
    month,
    day,
  ] =
    scheduledDate
      .split('-')
      .map(Number);

  /*
   * Reminder time:
   * 09:00
   */
  const [
    hour,
    minute,
  ] =
    reminderTime
      .split(':')
      .map(Number);

  /*
   * Basic validation
   */
  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    throw new Error(
      'Invalid maintenance date or reminder time.',
    );
  }

  /*
   * Example:
   *
   * Maintenance:
   * 2026-10-20 09:00
   */
  const maintenanceDate =
    new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0,
    );

  /*
   * Copy date first.
   */
  const notificationDate =
    new Date(
      maintenanceDate,
    );

  /*
   * Example:
   *
   * Maintenance = Oct 20
   * Reminder = 3 days
   *
   * Notification = Oct 17
   */
  notificationDate.setDate(
    notificationDate.getDate() -
      remindBeforeDays,
  );

  /*
   * Do not schedule something
   * that already passed.
   */
  if (
    notificationDate.getTime() <=
    Date.now()
  ) {
    throw new Error(
      'The selected reminder date and time has already passed. Please choose another reminder time.',
    );
  }

  /*
   * Notification content.
   */
  const content = {
    title:
      'Maintenance Reminder 🔧',

    body:
      `${maintenanceType} for ${applianceName} is due on ${scheduledDate}.`,

    sound:
      'default' as const,

    data: {
      scheduleId,
    },
  };

  let notificationId:
    string;

  /*
   * Android
   */
  if (
    Platform.OS ===
    'android'
  ) {
    notificationId =
      await Notifications.scheduleNotificationAsync(
        {
          content,

          trigger: {
            type:
              Notifications
                .SchedulableTriggerInputTypes
                .DATE,

            date:
              notificationDate,

            channelId:
              NOTIFICATION_CHANNEL,
          },
        },
      );
  } else {
    /*
     * iOS
     */
    notificationId =
      await Notifications.scheduleNotificationAsync(
        {
          content,

          trigger: {
            type:
              Notifications
                .SchedulableTriggerInputTypes
                .DATE,

            date:
              notificationDate,
          },
        },
      );
  }

  return notificationId;
}

/* =========================
   CANCEL LOCAL NOTIFICATION
========================= */

export async function cancelMaintenanceNotification(
  notificationId?: string,
): Promise<void> {
  if (
    Platform.OS ===
      'web' ||
    !notificationId
  ) {
    return;
  }

  const Notifications =
    await import(
      'expo-notifications'
    );

  await Notifications.cancelScheduledNotificationAsync(
    notificationId,
  );
}

/* =========================
   GET REMINDER
========================= */

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

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  const data =
    snapshot.data();

  return {
    id:
      snapshot.id,

    homeownerId:
      data.homeownerId ??
      '',

    scheduleId:
      data.scheduleId ??
      '',

    applianceId:
      data.applianceId ??
      '',

    applianceName:
      data.applianceName ??
      '',

    maintenanceType:
      data.maintenanceType ??
      '',

    scheduledDate:
      data.scheduledDate ??
      '',

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
      data.enabled !==
      false,

    notificationId:
      typeof data.notificationId ===
      'string'
        ? data.notificationId
        : undefined,

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

/* =========================
   SAVE / UPDATE REMINDER
========================= */

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

  /*
   * Load existing reminder.
   */
  const existing =
    await getDoc(
      reminderRef,
    );

  const existingData =
    existing.exists()
      ? existing.data()
      : null;

  /*
   * If this reminder already
   * scheduled a phone notification,
   * keep its ID so we can cancel it.
   */
  const oldNotificationId =
    typeof existingData
      ?.notificationId ===
    'string'
      ? existingData
          .notificationId
      : undefined;

  let newNotificationId:
    string | null =
    null;

  /*
   * Only Push Notification creates
   * an actual phone notification.
   */
  if (
    reminder.notificationMethod ===
    'Push Notification'
  ) {
    newNotificationId =
      await scheduleMaintenanceNotification(
        reminder.scheduledDate,
        reminder.reminderTime,
        reminder.remindBeforeDays,
        reminder.applianceName,
        reminder.maintenanceType,
        reminder.scheduleId,
      );
  }

  try {
    /*
     * Save reminder settings
     * to Firestore.
     */
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

        enabled:
          true,

        /*
         * Store Expo notification ID.
         *
         * null means there is
         * no phone notification.
         */
        notificationId:
          newNotificationId,

        ...(
          !existing.exists()
            ? {
                createdAt:
                  serverTimestamp(),
              }
            : {}
        ),

        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      },
    );
  } catch (
    error
  ) {
    /*
     * Firestore failed after a new
     * notification was scheduled.
     *
     * Cancel it so we do not
     * leave an orphan notification.
     */
    if (
      newNotificationId
    ) {
      await cancelMaintenanceNotification(
        newNotificationId,
      );
    }

    throw error;
  }

  /*
   * Firestore saved successfully.
   *
   * Now cancel the OLD notification.
   *
   * This prevents duplicates when
   * the user updates a reminder.
   */
  if (
    oldNotificationId &&
    oldNotificationId !==
      newNotificationId
  ) {
    await cancelMaintenanceNotification(
      oldNotificationId,
    );
  }
}

/* =========================
   DELETE REMINDER
========================= */

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

  const reminderRef =
    doc(
      db,
      COLLECTION_NAME,
      reminderId,
    );

  /*
   * Load reminder before deleting
   * so we know its notification ID.
   */
  const existing =
    await getDoc(
      reminderRef,
    );

  const existingData =
    existing.exists()
      ? existing.data()
      : null;

  const notificationId =
    typeof existingData
      ?.notificationId ===
    'string'
      ? existingData
          .notificationId
      : undefined;

  /*
   * Cancel phone notification first.
   */
  if (
    notificationId
  ) {
    await cancelMaintenanceNotification(
      notificationId,
    );
  }

  /*
   * Then remove Firestore reminder.
   */
  await deleteDoc(
    reminderRef,
  );
}