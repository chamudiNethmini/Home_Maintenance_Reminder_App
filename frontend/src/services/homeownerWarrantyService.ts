import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

import {
  getHomeownerApplianceById,
} from './homeownerApplianceService';

const COLLECTION_NAME = 'homeownerWarranties';

type SaveHomeownerWarrantyInput = {
  applianceId: string;
  purchaseDate: string;
  expiryDate: string;
  warrantyPeriod?: string;
};

function validateDate(value: string, label: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`${label} is invalid.`);
  }

  return date;
}

export async function saveHomeownerWarranty(
  input: SaveHomeownerWarrantyInput,
): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please log in first.');
  }

  const customerId = user.uid;
  const applianceId = input.applianceId.trim();

  if (!applianceId) {
    throw new Error('Please select an appliance.');
  }

  const purchaseDateValue = input.purchaseDate.trim();
  const expiryDateValue = input.expiryDate.trim();

  const purchaseDate = validateDate(
    purchaseDateValue,
    'Purchase date',
  );

  const expiryDate = validateDate(
    expiryDateValue,
    'Expiry date',
  );

  if (expiryDate < purchaseDate) {
    throw new Error(
      'Expiry date cannot be before the purchase date.',
    );
  }

  // Verify that the selected appliance belongs to this user.
  const appliance =
    await getHomeownerApplianceById(applianceId);

  if (
    appliance.customerId !== customerId ||
    auth.currentUser?.uid !== customerId
  ) {
    throw new Error('Please log in again.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const status =
    expiryDate < today ? 'expired' : 'active';

  // A stable ID prevents duplicate records for the same appliance.
  const warrantyId =
    `${customerId}_${encodeURIComponent(applianceId)}`;

  const warrantyRef = doc(
    collection(db, COLLECTION_NAME),
    warrantyId,
  );

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(warrantyRef);

    if (
      existing.exists() &&
      existing.data().customerId !== customerId
    ) {
      throw new Error(
        'You do not have permission to update this warranty.',
      );
    }

    const fields = {
      customerId,
      applianceId,
      applianceName: appliance.name,
      brand: appliance.brand,
      model: appliance.model,
      serialNumber: appliance.serialNumber,
      purchaseDate: purchaseDateValue,
      expiryDate: expiryDateValue,
      status,
      updatedAt: serverTimestamp(),
      ...(input.warrantyPeriod !== undefined
        ? { warrantyPeriod: input.warrantyPeriod.trim() }
        : {}),
    };

    if (existing.exists()) {
      transaction.update(warrantyRef, fields);
    } else {
      transaction.set(warrantyRef, {
        ...fields,
        createdAt: serverTimestamp(),
      });
    }
  });

  return warrantyId;
}