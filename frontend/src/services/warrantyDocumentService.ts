import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WarrantyDocument } from '../types/provider';
import { assertId, createRepository } from './providerFirestore';
const repository = createRepository<WarrantyDocument>('warrantyDocuments');
export const getWarrantyDocument = repository.getById;
export const listWarrantyDocuments = (requestId: string) => repository.listBy('warrantyRequestId', requestId);
export async function setDocumentVerification(id: string, verificationStatus: WarrantyDocument['verificationStatus']) {
  assertId(id);
  await updateDoc(doc(db, 'warrantyDocuments', id), { verificationStatus });
}
// Uploaded files and document creation belong to the customer module.
