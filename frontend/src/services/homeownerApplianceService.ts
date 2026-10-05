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
  CreateHomeownerAppliance,
  HomeownerAppliance,
  UpdateHomeownerAppliance,
} from '../types/homeownerAppliance';

const COLLECTION_NAME = 'appliances';

function getCurrentUserId(): string {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      'You must be logged in to manage appliances.',
    );
  }

  return user.uid;
}

function dateToString(
  value: unknown,
): string | undefined {
  if (value instanceof Timestamp) {
    return value
      .toDate()
      .toISOString();
  }

  return undefined;
}

function parseAppliance(
  id: string,
  data: Record<string, any>,
): HomeownerAppliance {
  return {
    id,

    customerId:
      typeof data.customerId === 'string'
        ? data.customerId
        : '',

    name:
      typeof data.name === 'string'
        ? data.name
        : '',

    brand:
      typeof data.brand === 'string'
        ? data.brand
        : '',

    model:
      typeof data.model === 'string'
        ? data.model
        : '',

    serialNumber:
      typeof data.serialNumber === 'string'
        ? data.serialNumber
        : '',

    category:
      data.category === 'Kitchen' ||
      data.category === 'Laundry' ||
      data.category === 'Cooling' ||
      data.category === 'Cleaning'
        ? data.category
        : 'Other',

    purchaseDate:
      typeof data.purchaseDate === 'string'
        ? data.purchaseDate
        : '',

    installationDate:
      typeof data.installationDate === 'string'
        ? data.installationDate
        : '',

    createdAt:
      dateToString(
        data.createdAt,
      ),

    updatedAt:
      dateToString(
        data.updatedAt,
      ),
  };
}

export async function getHomeownerAppliances():
Promise<HomeownerAppliance[]> {
  const customerId =
    getCurrentUserId();

  const applianceQuery =
    query(
      collection(
        db,
        COLLECTION_NAME,
      ),
      where(
        'customerId',
        '==',
        customerId,
      ),
    );

  const snapshot =
    await getDocs(
      applianceQuery,
    );

  const appliances =
    snapshot.docs.map(
      (document) =>
        parseAppliance(
          document.id,
          document.data(),
        ),
    );

  // Latest created appliances first
  appliances.sort(
    (a, b) =>
      (
        b.createdAt ?? ''
      ).localeCompare(
        a.createdAt ?? '',
      ),
  );

  return appliances;
}

export async function addHomeownerAppliance(
  appliance:
    CreateHomeownerAppliance,
): Promise<string> {
  const customerId =
    getCurrentUserId();

  const documentRef =
    await addDoc(
      collection(
        db,
        COLLECTION_NAME,
      ),
      {
        customerId,

        name:
          appliance.name.trim(),

        brand:
          appliance.brand.trim(),

        model:
          appliance.model.trim(),

        serialNumber:
          appliance.serialNumber.trim(),

        category:
          appliance.category,

        purchaseDate:
          appliance.purchaseDate,

        installationDate:
          appliance.installationDate,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

  return documentRef.id;
}

export async function getHomeownerApplianceById(
  applianceId: string,
): Promise<HomeownerAppliance> {
  const customerId =
    getCurrentUserId();

  const documentRef =
    doc(
      db,
      COLLECTION_NAME,
      applianceId,
    );

  const snapshot =
    await getDoc(
      documentRef,
    );

  if (!snapshot.exists()) {
    throw new Error(
      'Appliance was not found.',
    );
  }

  const appliance =
    parseAppliance(
      snapshot.id,
      snapshot.data(),
    );

  if (
    appliance.customerId !==
    customerId
  ) {
    throw new Error(
      'You do not have permission to view this appliance.',
    );
  }

  return appliance;
}

export async function updateHomeownerAppliance(
  applianceId: string,
  updates:
    UpdateHomeownerAppliance,
): Promise<void> {
  // Verify ownership first
  await getHomeownerApplianceById(
    applianceId,
  );

  const cleanedUpdates: Record<
    string,
    unknown
  > = {};

  if (
    updates.name !== undefined
  ) {
    cleanedUpdates.name =
      updates.name.trim();
  }

  if (
    updates.brand !== undefined
  ) {
    cleanedUpdates.brand =
      updates.brand.trim();
  }

  if (
    updates.model !== undefined
  ) {
    cleanedUpdates.model =
      updates.model.trim();
  }

  if (
    updates.serialNumber !==
    undefined
  ) {
    cleanedUpdates.serialNumber =
      updates.serialNumber.trim();
  }

  if (
    updates.category !== undefined
  ) {
    cleanedUpdates.category =
      updates.category;
  }

  if (
    updates.purchaseDate !==
    undefined
  ) {
    cleanedUpdates.purchaseDate =
      updates.purchaseDate;
  }

  if (
    updates.installationDate !==
    undefined
  ) {
    cleanedUpdates.installationDate =
      updates.installationDate;
  }

  await updateDoc(
    doc(
      db,
      COLLECTION_NAME,
      applianceId,
    ),
    {
      ...cleanedUpdates,

      updatedAt:
        serverTimestamp(),
    },
  );
}

export async function deleteHomeownerAppliance(
  applianceId: string,
): Promise<void> {
  // Verify ownership first
  await getHomeownerApplianceById(
    applianceId,
  );

  await deleteDoc(
    doc(
      db,
      COLLECTION_NAME,
      applianceId,
    ),
  );
}