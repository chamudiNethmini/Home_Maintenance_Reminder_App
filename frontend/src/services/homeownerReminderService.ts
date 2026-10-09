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

type ReminderInput = {
  applianceId: string;
  option: string;
  pushNotification: boolean;
  emailNotification: boolean;
};

const reminderOptions = [
  '1 month before expiry',
  '3 months before expiry',
  '1 week before expiry',
  'On expiry date',
];

export async function saveHomeownerReminder(
  input: ReminderInput,
): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please log in first.');
  }

  if (!input.applianceId?.trim()) {
    throw new Error(
      'Appliance ID is missing. Open the reminder from Warranty Details.',
    );
  }

  if (!reminderOptions.includes(input.option)) {
    throw new Error('Please select a valid reminder option.');
  }

  if (!input.pushNotification && !input.emailNotification) {
    throw new Error(
      'Please select at least one notification method.',
    );
  }

  const warrantyQuery = query(
    collection(db, 'homeownerWarranties'),
    where('customerId', '==', user.uid),
    where('applianceId', '==', input.applianceId),
  );

  const snapshot = await getDocs(warrantyQuery);

  if (snapshot.empty) {
    throw new Error(
      'Warranty not found. Save the warranty first.',
    );
  }

  if (snapshot.size > 1) {
    throw new Error(
      'Multiple warranties found for this appliance.',
    );
  }

  const warrantyRef = snapshot.docs[0].ref;

  await runTransaction(db, async (transaction) => {
    const warrantySnapshot =
      await transaction.get(warrantyRef);

    if (!warrantySnapshot.exists()) {
      throw new Error('Warranty not found.');
    }

    if (
      auth.currentUser?.uid !== user.uid ||
      warrantySnapshot.data().customerId !== user.uid
    ) {
      throw new Error(
        'You do not have permission to update this warranty.',
      );
    }

    transaction.update(warrantyRef, {
      reminder: {
        option: input.option,
        pushNotification: input.pushNotification,
        emailNotification: input.emailNotification,
        isRead: false,
        savedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  });
}

export async function markHomeownerReminderRead(
  warrantyId: string,
): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please log in first.');
  }

  if (!warrantyId.trim()) {
    throw new Error('Warranty ID is missing.');
  }

  const warrantyRef = doc(
    db,
    'homeownerWarranties',
    warrantyId,
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(warrantyRef);

    if (!snapshot.exists()) {
      throw new Error('Warranty not found.');
    }

    const data = snapshot.data();

    if (
      auth.currentUser?.uid !== user.uid ||
      data.customerId !== user.uid
    ) {
      throw new Error('Permission denied.');
    }

    if (data.reminder) {
      transaction.update(warrantyRef, {
        'reminder.isRead': true,
      });
    }
  });
}