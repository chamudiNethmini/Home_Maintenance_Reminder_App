import { collection, doc, getDoc, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CreateWarrantyDocument, DocumentVerificationStatus } from '../types/provider';
import { parseDocument } from '../utils/providerFirestoreMapping';
import { assertId, firestoreOperation, readCollection } from './providerFirestore';
export function getDocumentsByWarrantyRequest(warrantyRequestId: string) {
  return firestoreOperation('Load request documents', async () => {
    assertId(warrantyRequestId);
    return readCollection('warrantyDocuments', parseDocument, [where('warrantyRequestId', '==', warrantyRequestId)]);
  });
}
export function createWarrantyDocument(data: CreateWarrantyDocument) {
  return createWarrantyDocuments([data]).then(ids => ids[0]);
}
export function createWarrantyDocuments(documents: CreateWarrantyDocument[]) {
  return firestoreOperation('Save warranty documents', async () => {
    if (!documents.length || documents.length > 400) throw new Error('Choose the required documents before submitting.');
    const batch = writeBatch(db), ids: string[] = [];
    documents.forEach(document => {
      assertId(document.warrantyRequestId);
      if (!['warranty_card', 'purchase_receipt'].includes(document.type)) throw new Error('Invalid warranty document type.');
      const reference = doc(collection(db, 'warrantyDocuments'));
      ids.push(reference.id);
      batch.set(reference, { ...document, id: reference.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
    return ids;
  });
}
export function deleteWarrantyDocumentsByRequest(warrantyRequestId: string) {
  return firestoreOperation('Remove incomplete warranty document records', async () => {
    assertId(warrantyRequestId);
    const documents = await getDocumentsByWarrantyRequest(warrantyRequestId);
    if (!documents.length) return;
    const batch = writeBatch(db);
    documents.forEach(document => batch.delete(doc(db, 'warrantyDocuments', document.id)));
    await batch.commit();
  });
}
export function updateDocumentVerificationStatus(id: string, status: DocumentVerificationStatus) {
  return firestoreOperation('Save document review', async () => {
    assertId(id);
    if (!['pending', 'verified', 'rejected'].includes(status)) throw new Error('Invalid document verification status.');
    const reference = doc(db, 'warrantyDocuments', id), snapshot = await getDoc(reference);
    if (!snapshot.exists()) throw new Error('The warranty document no longer exists.');
    const requestId = String(snapshot.data().warrantyRequestId || '');
    assertId(requestId);
    const batch = writeBatch(db);
    batch.update(reference, { verificationStatus: status, updatedAt: serverTimestamp() });
    batch.update(doc(db, 'warrantyRequests', requestId), { documentsReviewed: false, updatedAt: serverTimestamp() });
    await batch.commit();
  });
}
