import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

export type WarrantyProviderOption = {
  id: string;
  name: string;
};

export async function getWarrantyProviders(): Promise<
  WarrantyProviderOption[]
> {
  if (!auth.currentUser) {
    throw new Error('Please log in first.');
  }

  const providerQuery = query(
    collection(db, 'users'),
    where('role', '==', 'provider'),
  );

  const snapshot = await getDocs(providerQuery);

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      id: item.id,
      name:
        typeof data.name === 'string' && data.name.trim()
          ? data.name
          : 'Warranty Provider',
    };
  });
}

type SubmitInput = {
  applianceId: string;
  providerId: string;
  customerPhone: string;
  notes: string;
};

export async function submitHomeownerWarrantyRequest(
  input: SubmitInput,
): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please log in first.');
  }

  const customerId = user.uid;
  const applianceId = input.applianceId.trim();
  const providerId = input.providerId.trim();
  const phone = input.customerPhone.trim();
  const notes = input.notes.trim();

  if (!applianceId || !providerId) {
    throw new Error(
      'Please select an appliance and provider.',
    );
  }

  if (!/^\+?[\d\s()-]{7,20}$/.test(phone)) {
    throw new Error(
      'Please enter a valid phone number.',
    );
  }

  if (!notes) {
    throw new Error(
      'Please describe your warranty request.',
    );
  }

  const homeownerWarrantyId =
    `${customerId}_${encodeURIComponent(applianceId)}`;

  const homeownerWarrantyRef = doc(
    db,
    'homeownerWarranties',
    homeownerWarrantyId,
  );

  const applianceRef = doc(
    db,
    'appliances',
    applianceId,
  );

  const customerRef = doc(
    db,
    'users',
    customerId,
  );

  const providerRef = doc(
    db,
    'users',
    providerId,
  );

  const requestRef = doc(
    collection(db, 'warrantyRequests'),
  );

  const warrantyRef = doc(
    collection(db, 'warranties'),
  );

  const notificationRef = doc(
    collection(db, 'providerNotifications'),
  );

  return runTransaction(db, async (transaction) => {
    const customerSnapshot =
      await transaction.get(customerRef);

    const providerSnapshot =
      await transaction.get(providerRef);

    const applianceSnapshot =
      await transaction.get(applianceRef);

    const homeownerWarrantySnapshot =
      await transaction.get(homeownerWarrantyRef);

    if (auth.currentUser?.uid !== customerId) {
      throw new Error(
        'Your session changed. Please log in again.',
      );
    }

    if (!customerSnapshot.exists()) {
      throw new Error(
        'Your user profile was not found.',
      );
    }

    const customer = customerSnapshot.data();

    if (customer.role !== 'homeowner') {
      throw new Error(
        'A homeowner account is required.',
      );
    }

    if (!providerSnapshot.exists()) {
      throw new Error(
        'Selected warranty provider was not found.',
      );
    }

    const provider = providerSnapshot.data();

    if (provider.role !== 'provider') {
      throw new Error(
        'Selected account is not a warranty provider.',
      );
    }

    if (!applianceSnapshot.exists()) {
      throw new Error(
        'Your appliance was not found.',
      );
    }

    const appliance = applianceSnapshot.data();

    if (appliance.customerId !== customerId) {
      throw new Error(
        'You cannot submit a request for this appliance.',
      );
    }

    if (!homeownerWarrantySnapshot.exists()) {
      throw new Error(
        'Please save your warranty first.',
      );
    }

    const warranty =
      homeownerWarrantySnapshot.data();

    if (
      warranty.customerId !== customerId ||
      warranty.applianceId !== applianceId
    ) {
      throw new Error(
        'You cannot submit a request for this warranty.',
      );
    }

    // All reads happen before any transaction writes.
    if (
      typeof warranty.warrantyRequestId === 'string' &&
      warranty.warrantyRequestId
    ) {
      const previousRequestRef = doc(
        db,
        'warrantyRequests',
        warranty.warrantyRequestId,
      );

      const previousRequestSnapshot =
        await transaction.get(previousRequestRef);

      if (previousRequestSnapshot.exists()) {
        throw new Error(
          'A request already exists for this warranty. Please check its status.',
        );
      }
    }

    if (
      typeof warranty.purchaseDate !== 'string' ||
      !warranty.purchaseDate.trim() ||
      typeof warranty.expiryDate !== 'string' ||
      !warranty.expiryDate.trim()
    ) {
      throw new Error(
        'Please save valid warranty dates first.',
      );
    }

    const customerName =
      typeof customer.name === 'string'
        ? customer.name
        : user.displayName ?? '';

    const customerEmail =
      user.email ??
      (typeof customer.email === 'string'
        ? customer.email
        : '');

    const applianceName =
      typeof appliance.name === 'string'
        ? appliance.name
        : '';

    // Create a linked warranty snapshot for provider services.
    transaction.set(warrantyRef, {
      customerId,
      providerId,
      applianceId,
      homeownerWarrantyId,
      purchaseDate: warranty.purchaseDate,
      expiryDate: warranty.expiryDate,
      status:
        warranty.status === 'expired'
          ? 'expired'
          : 'active',
      modelCovered: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(requestRef, {
      customerId,
      providerId,
      applianceId,
      warrantyId: warrantyRef.id,
      homeownerWarrantyId,
      customerName,
      customerPhone: phone,
      customerEmail,
      applianceName,
      status: 'pending',
      notes,
      warrantyCardUploaded: false,
      purchaseReceiptUploaded: false,
      documentsReviewed: false,
      verificationNotes: '',
      modelSerialConfirmed: false,
      verifiedAt: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(notificationRef, {
      providerId,
      customerId,
      warrantyRequestId: requestRef.id,
      customerName,
      title: 'New warranty request',
      message:
        `${customerName} submitted a request for ${applianceName}.`,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    transaction.update(homeownerWarrantyRef, {
      warrantyRequestId: requestRef.id,
      providerWarrantyId: warrantyRef.id,
      providerId,
      updatedAt: serverTimestamp(),
    });

    return requestRef.id;
  });
}