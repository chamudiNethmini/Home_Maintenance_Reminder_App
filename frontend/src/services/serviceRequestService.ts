import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import type {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestPriority,
} from '../types/serviceRequest';

const COLLECTION_NAME = 'serviceRequests';

function parseServiceRequest(
  id: string,
  data: Record<string, any>,
): ServiceRequest {
  return {
    id,

    requestId:
      typeof data.requestId === 'string'
        ? data.requestId
        : id,

    applianceId:
      typeof data.applianceId === 'string'
        ? data.applianceId
        : '',

    applianceName:
      typeof data.applianceName === 'string'
        ? data.applianceName
        : '',

    customerId:
      typeof data.customerId === 'string'
        ? data.customerId
        : '',

    customerName:
      typeof data.customerName === 'string'
        ? data.customerName
        : '',

    problemDescription:
      typeof data.problemDescription === 'string'
        ? data.problemDescription
        : '',

    status:
      data.status === 'inProgress' ||
      data.status === 'completed'
        ? data.status
        : 'pending',

    priority:
      data.priority === 'high' ||
      data.priority === 'medium'
        ? data.priority
        : 'low',

    technicianId:
      typeof data.technicianId === 'string'
        ? data.technicianId
        : undefined,

    createdAt:
      data.createdAt?.toDate?.()
        ?.toISOString(),

    updatedAt:
      data.updatedAt?.toDate?.()
        ?.toISOString(),
  };
}

export async function getServiceRequests(): Promise<
  ServiceRequest[]
> {
  const snapshot = await getDocs(
    collection(
      db,
      COLLECTION_NAME,
    ),
  );

  return snapshot.docs.map(
    (document) =>
      parseServiceRequest(
        document.id,
        document.data(),
      ),
  );
}

export async function getTechnicianServiceRequests(
  technicianId: string,
): Promise<ServiceRequest[]> {
  const requestsQuery = query(
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
    await getDocs(requestsQuery);

  return snapshot.docs.map(
    (document) =>
      parseServiceRequest(
        document.id,
        document.data(),
      ),
  );
}

export async function createServiceRequest(
  request: Omit<
    ServiceRequest,
    'id' | 'createdAt' | 'updatedAt'
  >,
): Promise<string> {
  const documentRef =
    await addDoc(
      collection(
        db,
        COLLECTION_NAME,
      ),
      {
        requestId:
          request.requestId,

        applianceId:
          request.applianceId,

        applianceName:
          request.applianceName,

        customerId:
          request.customerId,

        customerName:
          request.customerName,

        problemDescription:
          request.problemDescription,

        status:
          request.status,

        priority:
          request.priority,

        technicianId:
          request.technicianId ?? null,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

  return documentRef.id;
}

export async function updateServiceRequestStatus(
  serviceRequestId: string,
  status: ServiceRequestStatus,
): Promise<void> {
  await updateDoc(
    doc(
      db,
      COLLECTION_NAME,
      serviceRequestId,
    ),
    {
      status,
      updatedAt:
        serverTimestamp(),
    },
  );
}