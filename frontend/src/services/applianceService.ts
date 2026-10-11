import { doc, updateDoc, serverTimestamp, type WriteBatch } from 'firebase/firestore';
import { createProviderRecord } from './providerCreate';
import { db } from '../config/firebase';
import type { Appliance } from '../types/provider';
import { parseAppliance } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readById } from './providerFirestore';
export const getApplianceById = (id: string) => readById('appliances', id, parseAppliance);
export function createAppliance(data: Omit<Appliance, 'id'> & { warrantyExpiryDate: string }, batch?: WriteBatch) {
  return firestoreOperation('Create appliance', async () => {
    assertId(data.customerId);
    return createProviderRecord('appliances', data, batch);
  });
}
export function updateAppliance(id: string, fields: Partial<Omit<Appliance, 'id' | 'customerId'>>) {
  return firestoreOperation('Save appliance', async () => { assertId(id); await updateDoc(doc(db, 'appliances', id), { ...fields, updatedAt: serverTimestamp() }); });
}
