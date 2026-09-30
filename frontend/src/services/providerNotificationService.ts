import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ProviderNotification } from '../types/provider';
import { assertId, createRepository } from './providerFirestore';
const repository = createRepository<ProviderNotification>('providerNotifications');
export const listProviderNotifications = (providerId: string) => repository.listBy('providerId', providerId);
export async function markProviderNotificationRead(id: string) {
  assertId(id); await updateDoc(doc(db, 'providerNotifications', id), { isRead: true });
}
/** Pass the IDs from the current provider's loaded notification list. */
export async function markProviderNotificationsRead(ids: string[]) {
  const unique = [...new Set(ids)];
  unique.forEach(assertId);
  for (let offset = 0; offset < unique.length; offset += 400) {
    const batch = writeBatch(db);
    unique.slice(offset, offset + 400).forEach(id => batch.update(doc(db, 'providerNotifications', id), { isRead: true }));
    await batch.commit();
  }
}
