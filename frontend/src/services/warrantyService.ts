import { doc, updateDoc, serverTimestamp, type WriteBatch } from 'firebase/firestore';
import { createProviderRecord } from './providerCreate';
import { db } from '../config/firebase';
import type { Warranty } from '../types/provider';
import { parseWarranty } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readById } from './providerFirestore';
export const getWarrantyById = (id: string) => readById('warranties', id, parseWarranty);
export function createWarranty(data: Omit<Warranty, 'id'> & { customerId: string; providerId: string | null }, batch?: WriteBatch) {
  return firestoreOperation('Create warranty', async () => {
    assertId(data.customerId); assertId(data.applianceId);
    return createProviderRecord('warranties', { ...data, status: data.status.toLowerCase() }, batch);
  });
}
export function updateWarranty(id: string, fields: Partial<Omit<Warranty, 'id' | 'applianceId'>>) {
  return firestoreOperation('Save warranty', async () => { assertId(id); await updateDoc(doc(db, 'warranties', id), { ...fields, updatedAt: serverTimestamp() }); });
}
