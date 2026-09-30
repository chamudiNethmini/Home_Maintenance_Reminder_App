import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { RequestStatus, WarrantyRequest } from '../types/provider';
import { statuses } from '../utils/providerWorkflow';
import { assertId, createRepository } from './providerFirestore';
const repository = createRepository<WarrantyRequest>('warrantyRequests');
export const getWarrantyRequest = repository.getById;
export const listProviderWarrantyRequests = (providerId: string) => repository.listBy('providerId', providerId);
export const saveWarrantyRequest = repository.save;
/** Future integration: atomically update a request and create its provider notification.
 * Firestore rules must enforce the authenticated provider's ownership.
 * This is not invoked by the local preview and does not send a customer message.
 */
export async function updateWarrantyRequestStatus(input: {
  requestId: string; providerId: string; customerName: string; status: RequestStatus; notes: string;
}) {
  assertId(input.requestId); assertId(input.providerId);
  if (!statuses.includes(input.status)) throw new Error('Invalid request status.');
  const reference = doc(db, 'warrantyRequests', input.requestId);
  const notification = doc(collection(db, 'providerNotifications'));
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Warranty request not found.');
    if (snapshot.data().providerId !== input.providerId) throw new Error('This request belongs to another provider.');
    if (snapshot.data().status === input.status && snapshot.data().notes === input.notes.trim()) return;
    transaction.update(reference, { status: input.status, notes: input.notes.trim(), updatedAt: serverTimestamp() });
    transaction.set(notification, {
      providerId: input.providerId, warrantyRequestId: input.requestId, customerName: input.customerName,
      title: 'Warranty request status updated to ' + input.status,
      message: input.notes.trim() || 'The warranty request status has changed.',
      isRead: false, createdAt: serverTimestamp(),
    });
  });
}
