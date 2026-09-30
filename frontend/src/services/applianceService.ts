import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Appliance } from '../types/provider';
import { parseAppliance } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readById } from './providerFirestore';
export const getApplianceById = (id: string) => readById('appliances', id, parseAppliance);
export function updateAppliance(id: string, fields: Partial<Omit<Appliance, 'id' | 'customerId'>>) {
  return firestoreOperation('Save appliance', async () => { assertId(id); await updateDoc(doc(db, 'appliances', id), { ...fields, updatedAt: serverTimestamp() }); });
}
