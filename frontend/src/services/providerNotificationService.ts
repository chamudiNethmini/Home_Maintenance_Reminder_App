import { collection, addDoc, deleteDoc, doc, updateDoc, where, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CreateProviderNotification } from '../types/provider';
import { parseNotification } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readCollection } from './providerFirestore';
export function createProviderNotification(data: CreateProviderNotification) {
  return firestoreOperation('Create notification', async () => {
    assertId(data.warrantyRequestId);
    const reference = await addDoc(collection(db, 'providerNotifications'), { ...data, createdAt: serverTimestamp() });
    return reference.id;
  });
}
export async function getProviderNotifications(providerId?: string) {
  // TODO(auth integration): supply the verified provider ID and enforce ownership in Firestore rules.
  // Until then, this explicit service-level fallback reads all accessible provider notifications.
  const data = await readCollection('providerNotifications', parseNotification, providerId ? [where('providerId', '==', providerId)] : []);
  return data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function markNotificationAsRead(id: string) {
  return firestoreOperation('Mark notification as read', async () => { assertId(id); await updateDoc(doc(db, 'providerNotifications', id), { isRead: true }); });
}
export function markAllNotificationsAsRead(providerId?: string) {
  return firestoreOperation('Mark all notifications as read', async () => {
    const unread = (await getProviderNotifications(providerId)).filter(item => !item.isRead);
    for (let offset = 0; offset < unread.length; offset += 400) {
      const batch = writeBatch(db);
      unread.slice(offset, offset + 400).forEach(item => batch.update(doc(db, 'providerNotifications', item.id), { isRead: true }));
      await batch.commit();
    }
  });
}
export function deleteProviderNotification(id: string) {
  return firestoreOperation('Delete notification', async () => { assertId(id); await deleteDoc(doc(db, 'providerNotifications', id)); });
}
