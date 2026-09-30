import { doc, updateDoc, where, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WarrantyDocument } from '../types/provider';
import { parseDocument } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readCollection } from './providerFirestore';
export function getDocumentsByWarrantyRequest(warrantyRequestId: string) {
  return firestoreOperation('Load request documents', async () => {
    assertId(warrantyRequestId);
    return readCollection('warrantyDocuments', parseDocument, [where('warrantyRequestId', '==', warrantyRequestId)]);
  });
}
export function updateDocumentVerificationStatus(id: string, status: WarrantyDocument['verificationStatus']) {
  return firestoreOperation('Save document review', async () => {
    assertId(id);
    if (!['Pending', 'Verified', 'Rejected'].includes(status)) throw new Error('Invalid document verification status.');
    await updateDoc(doc(db, 'warrantyDocuments', id), { verificationStatus: status.toLowerCase(), updatedAt: serverTimestamp() });
  });
}
export function updateDocumentsVerificationStatus(documents: WarrantyDocument[], status: WarrantyDocument['verificationStatus']) {
  return firestoreOperation('Save document checklist', async () => {
    if (!documents.length) throw new Error('No documents to review.');
    if (documents.length > 400) throw new Error('Review documents individually for requests with more than 400 files.');
    if (!['Pending', 'Verified', 'Rejected'].includes(status)) throw new Error('Invalid document verification status.');
    const batch = writeBatch(db);
    documents.forEach(item => { assertId(item.id); batch.update(doc(db, 'warrantyDocuments', item.id), { verificationStatus: status.toLowerCase(), updatedAt: serverTimestamp() }); });
    await batch.commit();
  });
}
