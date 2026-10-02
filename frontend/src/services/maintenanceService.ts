import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../config/firebase';

import type {
  CreateMaintenanceSchedule,
  MaintenanceSchedule,
  MaintenanceStatus,
} from '../types/maintenance';

const COLLECTION_NAME =
  'maintenanceSchedules';

function getCurrentHomeownerId(): string {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      'You must be logged in to manage maintenance schedules.',
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

function parseMaintenanceSchedule(
  id: string,
  data: Record<string, any>,
): MaintenanceSchedule {
  return {
    id,

    homeownerId:
      typeof data.homeownerId === 'string'
        ? data.homeownerId
        : '',

    applianceId:
      typeof data.applianceId === 'string'
        ? data.applianceId
        : '',

    applianceName:
      typeof data.applianceName === 'string'
        ? data.applianceName
        : '',

    maintenanceType:
      data.maintenanceType ??
      'Other',

    scheduledDate:
      typeof data.scheduledDate === 'string'
        ? data.scheduledDate
        : '',

    notes:
      typeof data.notes === 'string'
        ? data.notes
        : '',

    status:
      data.status === 'completed'
        ? 'completed'
        : 'upcoming',

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

export async function getMaintenanceSchedules():
Promise<MaintenanceSchedule[]> {
  const homeownerId =
    getCurrentHomeownerId();

  const maintenanceQuery =
    query(
      collection(
        db,
        COLLECTION_NAME,
      ),
      where(
        'homeownerId',
        '==',
        homeownerId,
      ),
    );

  const snapshot =
    await getDocs(
      maintenanceQuery,
    );

  const schedules =
    snapshot.docs.map(
      (document) =>
        parseMaintenanceSchedule(
          document.id,
          document.data(),
        ),
    );

  schedules.sort(
    (a, b) =>
      a.scheduledDate.localeCompare(
        b.scheduledDate,
      ),
  );

  return schedules;
}

export async function createMaintenanceSchedule(
  maintenance:
    CreateMaintenanceSchedule,
): Promise<string> {
  const homeownerId =
    getCurrentHomeownerId();

  const documentRef =
    await addDoc(
      collection(
        db,
        COLLECTION_NAME,
      ),
      {
        homeownerId,

        applianceId:
          maintenance.applianceId,

        applianceName:
          maintenance.applianceName,

        maintenanceType:
          maintenance.maintenanceType,

        scheduledDate:
          maintenance.scheduledDate,

        notes:
          maintenance.notes.trim(),

        status:
          'upcoming',

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

  return documentRef.id;
}

export async function getMaintenanceScheduleById(
  scheduleId: string,
): Promise<MaintenanceSchedule> {
  const homeownerId =
    getCurrentHomeownerId();

  const documentRef =
    doc(
      db,
      COLLECTION_NAME,
      scheduleId,
    );

  const snapshot =
    await getDoc(
      documentRef,
    );

  if (!snapshot.exists()) {
    throw new Error(
      'Maintenance schedule was not found.',
    );
  }

  const schedule =
    parseMaintenanceSchedule(
      snapshot.id,
      snapshot.data(),
    );

  if (
    schedule.homeownerId !==
    homeownerId
  ) {
    throw new Error(
      'You do not have permission to access this maintenance schedule.',
    );
  }

  return schedule;
}

export async function updateMaintenanceStatus(
  scheduleId: string,
  status: MaintenanceStatus,
): Promise<void> {
  await getMaintenanceScheduleById(
    scheduleId,
  );

  await updateDoc(
    doc(
      db,
      COLLECTION_NAME,
      scheduleId,
    ),
    {
      status,

      updatedAt:
        serverTimestamp(),
    },
  );
}

export async function deleteMaintenanceSchedule(
  scheduleId: string,
): Promise<void> {
  await getMaintenanceScheduleById(
    scheduleId,
  );

  await deleteDoc(
    doc(
      db,
      COLLECTION_NAME,
      scheduleId,
    ),
  );
}