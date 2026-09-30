import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Warranty } from '../types/provider';
import { parseWarranty } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readById } from './providerFirestore';
export const getWarrantyById = (id: string) => readById('warranties', id, parseWarranty);
export function updateWarranty(id: string, fields: Partial<Omit<Warranty, 'id' | 'applianceId'>>) {
  return firestoreOperation('Save warranty', async () => { assertId(id); await updateDoc(doc(db, 'warranties', id), { ...fields, updatedAt: serverTimestamp() }); });
}
