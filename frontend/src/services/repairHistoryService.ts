import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import type { RepairHistory } from '../types/repairHistory';

const COLLECTION_NAME = 'repairHistory';

function parseRepairHistory(
  id: string,
  data: Record<string, any>,
): RepairHistory {
  return {
    id,

    serviceRequestId:
      typeof data.serviceRequestId === 'string'
        ? data.serviceRequestId
        : '',

    applianceId:
      typeof data.applianceId === 'string'
        ? data.applianceId
        : '',

    applianceName:
      typeof data.applianceName === 'string'
        ? data.applianceName
        : '',

    technicianId:
      typeof data.technicianId === 'string'
        ? data.technicianId
        : '',

    status: 'completed',

    repairNotes:
      typeof data.repairNotes === 'string'
        ? data.repairNotes
        : '',

    completedDate:
      typeof data.completedDate === 'string'
        ? data.completedDate
        : '',

    createdAt:
      data.createdAt?.toDate?.()
        ?.toISOString(),
  };
}

export async function addRepairHistory(
  repair: Omit<
    RepairHistory,
    'id' | 'createdAt'
  >,
): Promise<string> {
  const documentRef =
    await addDoc(
      collection(
        db,
        COLLECTION_NAME,
      ),
      {
        serviceRequestId:
          repair.serviceRequestId,

        applianceId:
          repair.applianceId,

        applianceName:
          repair.applianceName,

        technicianId:
          repair.technicianId,

        status:
          'completed',

        repairNotes:
          repair.repairNotes.trim(),

        completedDate:
          repair.completedDate,

        createdAt:
          serverTimestamp(),
      },
    );

  return documentRef.id;
}

export async function getRepairHistory(
  technicianId: string,
): Promise<RepairHistory[]> {
  const historyQuery =
    query(
      collection(
        db,
        COLLECTION_NAME,
      ),
      where(
        'technicianId',
        '==',
        technicianId,
      ),
    );

  const snapshot =
    await getDocs(historyQuery);

  const history =
    snapshot.docs.map(
      (document) =>
        parseRepairHistory(
          document.id,
          document.data(),
        ),
    );

  history.sort(
    (a, b) =>
      (
        b.completedDate
      ).localeCompare(
        a.completedDate,
      ),
  );

  return history;
}