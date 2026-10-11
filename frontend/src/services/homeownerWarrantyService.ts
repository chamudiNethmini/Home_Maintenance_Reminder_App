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

  // Used only to prepare a record for document uploads.
  prepareForUpload?: boolean;
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

function hasUploadedDocument(
  documents: unknown[],
  documentType: string,
): boolean {
  return documents.some((value) => {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const document = value as Record<string, unknown>;

    return (
      document.documentType === documentType &&
      typeof document.fileUrl === 'string' &&
      document.fileUrl.startsWith('https://')
    );
  });
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

    if (auth.currentUser?.uid !== customerId) {
      throw new Error(
        'Your session changed. Please log in again.',
      );
    }

    const existingData = existing.exists()
      ? existing.data()
      : null;

    if (
      existingData &&
      (
        existingData.customerId !== customerId ||
        existingData.applianceId !== applianceId
      )
    ) {
      throw new Error(
        'You do not have permission to update this warranty.',
      );
    }

    // Use the supplied period, or retain the saved period
    // when an existing caller does not supply it.
    const warrantyPeriod =
      input.warrantyPeriod !== undefined
        ? input.warrantyPeriod.trim()
        : typeof existingData?.warrantyPeriod === 'string'
          ? existingData.warrantyPeriod.trim()
          : '';

    const allowedPeriods = [
      '1 year',
      '2 years',
      '3 years',
      '4 years',
      '5 years',
    ];

    if (!allowedPeriods.includes(warrantyPeriod)) {
      throw new Error(
        'Please select a warranty period from 1 to 5 years.',
      );
    }

    const warrantyYears = Number.parseInt(
      warrantyPeriod,
      10,
    );

    const allowedYear =
      purchaseDate.getFullYear() + warrantyYears;

    const allowedMonth = purchaseDate.getMonth();

    // Any valid day within the purchase month,
    // after the selected number of years, is allowed.
    if (
      expiryDate.getFullYear() !== allowedYear ||
      expiryDate.getMonth() !== allowedMonth
    ) {
      const firstDay =
        `${allowedYear}-` +
        `${String(allowedMonth + 1).padStart(2, '0')}-01`;

      const lastDayNumber = new Date(
        allowedYear,
        allowedMonth + 1,
        0,
      ).getDate();

      const lastDay =
        `${allowedYear}-` +
        `${String(allowedMonth + 1).padStart(2, '0')}-` +
        `${String(lastDayNumber).padStart(2, '0')}`;

      throw new Error(
        `For a ${warrantyPeriod} warranty, expiry date must be between ${firstDay} and ${lastDay}.`,
      );
    }

    const documents: unknown[] =
      Array.isArray(existingData?.documents)
        ? existingData.documents
        : [];

    const hasWarrantyCard = hasUploadedDocument(
      documents,
      'warranty_card',
    );

    const hasPurchaseReceipt = hasUploadedDocument(
      documents,
      'purchase_receipt',
    );

    const documentsComplete =
      hasWarrantyCard && hasPurchaseReceipt;

    // Final saving requires both successfully uploaded documents.
    if (
      input.prepareForUpload !== true &&
      !documentsComplete
    ) {
      throw new Error(
        'Please upload both the warranty card and purchase receipt before saving.',
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