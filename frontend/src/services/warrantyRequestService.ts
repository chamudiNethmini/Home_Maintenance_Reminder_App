import { addDoc, collection, deleteDoc, doc, orderBy, runTransaction, serverTimestamp, updateDoc, where, type QueryConstraint, type WriteBatch } from 'firebase/firestore';
import { createProviderRecord } from './providerCreate';
import { db } from '../config/firebase';
import type { CreateWarrantyRequest, RequestStatus, RequestSummary, WarrantyCase, WarrantyRequest } from '../types/provider';
import { parseAppliance, parseRequest, parseWarranty } from '../utils/providerFirestoreMapping';
import { assertRequestEditable, eligibility, toFirestoreStatus } from '../utils/providerWorkflow';
import { assertId, firestoreOperation, readById, readCollection } from './providerFirestore';
import { getApplianceById } from './applianceService';
import { getWarrantyById } from './warrantyService';

export function createWarrantyRequest(data: CreateWarrantyRequest, batch?: WriteBatch) {
  return firestoreOperation('Create warranty request', async () => {
    assertId(data.customerId); assertId(data.applianceId); assertId(data.warrantyId);
    if (batch) return createProviderRecord('warrantyRequests', { warrantyCardUploaded: false, purchaseReceiptUploaded: false, documentsReviewed: false, ...data, status: toFirestoreStatus(data.status) }, batch);
    const reference = await addDoc(collection(db, 'warrantyRequests'), { warrantyCardUploaded: false, purchaseReceiptUploaded: false, documentsReviewed: false, ...data, status: toFirestoreStatus(data.status), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return reference.id;
  });
}
export async function getWarrantyRequests(providerId?: string, serverOrder = false) {
  // TODO(auth integration): pass the authenticated provider's assigned ID.
  // Read all accessible requests for now, without a cap or fake provider identity.
  const constraints: QueryConstraint[] = providerId ? [where('providerId', '==', providerId)] : [];
  if (serverOrder) constraints.push(orderBy('createdAt', 'desc'));
  // Default client sorting includes legacy records missing createdAt; orderBy would omit them.
  const items = await readCollection('warrantyRequests', parseRequest, constraints);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const getWarrantyRequestById = (id: string) => readById('warrantyRequests', id, parseRequest);
export function updateWarrantyRequest(id: string, fields: Partial<Pick<WarrantyRequest, 'notes' | 'customerName' | 'customerPhone' | 'customerEmail' | 'applianceName'>>) {
  return firestoreOperation('Save warranty request', async () => {
    assertId(id);
    const reference = doc(db, 'warrantyRequests', id);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Warranty request not found.');
      assertRequestEditable(parseRequest(snapshot.id, snapshot.data()).status);
      transaction.update(reference, { ...fields, updatedAt: serverTimestamp() });
    });
  });
}
export function saveWarrantyVerification(id: string, verificationNotes: string, modelSerialConfirmed: boolean) {
  return firestoreOperation('Save warranty verification', async () => {
    assertId(id);
    const reference = doc(db, 'warrantyRequests', id);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Warranty request not found.');
      assertRequestEditable(parseRequest(snapshot.id, snapshot.data()).status);
      transaction.update(reference, { verificationNotes: verificationNotes.trim(), modelSerialConfirmed, updatedAt: serverTimestamp() });
    });
  });
}
export function deleteWarrantyRequest(id: string) {
  // Only deletes this request. Related records are managed explicitly by the caller/customer module.
  return firestoreOperation('Delete warranty request', async () => { assertId(id); await deleteDoc(doc(db, 'warrantyRequests', id)); });
}
export async function getRequestSummaries(providerId?: string): Promise<{ items: RequestSummary[]; warnings: string[] }> {
  const requests = await getWarrantyRequests(providerId), warnings: string[] = [];
  const applianceResults = new Map<string, Awaited<ReturnType<typeof getApplianceById>>>();
  await Promise.all([...new Set(requests.map(item => item.applianceId).filter(Boolean))].map(async id => {
    try { applianceResults.set(id, await getApplianceById(id)); }
    catch (error) { warnings.push(error instanceof Error ? error.message : 'Appliance details could not be loaded.'); }
  }));
  return { items: requests.map(request => { const appliance = applianceResults.get(request.applianceId); return {
    request, customerName: request.customerName || request.customerId || 'Customer unavailable',
    applianceName: appliance?.name || request.applianceName || 'Appliance unavailable', applianceBrand: appliance?.brand || '',
  }; }), warnings: [...new Set(warnings)] };
}
export function getWarrantyCaseById(id: string): Promise<WarrantyCase> {
  return firestoreOperation('Load request details', async () => {
    const request = await getWarrantyRequestById(id);
    if (!request) throw new Error('Warranty request not found.');
    if (!request.applianceId || !request.warrantyId || !request.customerId) throw new Error('This request needs customerId, applianceId and warrantyId from the customer module.');
    const [appliance, warranty, documents] = await Promise.all([getApplianceById(request.applianceId), getWarrantyById(request.warrantyId), Promise.resolve([])]);
    if (!appliance) throw new Error('Related appliance ' + request.applianceId + ' was not found.');
    if (!warranty) throw new Error('Related warranty ' + request.warrantyId + ' was not found.');
    if (appliance.customerId !== request.customerId || warranty.applianceId !== request.applianceId) throw new Error('The linked customer, appliance and warranty IDs do not match.');
    return { request, appliance, warranty, documents, customer: { id: request.customerId, name: request.customerName, phone: request.customerPhone, email: request.customerEmail } };
  });
}
/** Saves only editable details, atomically; never replaces a concurrent status/notes update. */
export function saveWarrantyCaseDetails(item: WarrantyCase) {
  return firestoreOperation('Save customer and appliance details', async () => {
    const requestRef = doc(db, 'warrantyRequests', item.request.id), applianceRef = doc(db, 'appliances', item.appliance.id), warrantyRef = doc(db, 'warranties', item.warranty.id);
    await runTransaction(db, async transaction => {
      const [requestSnapshot, applianceSnapshot, warrantySnapshot] = await Promise.all([transaction.get(requestRef), transaction.get(applianceRef), transaction.get(warrantyRef)]);
      if (!requestSnapshot.exists() || !applianceSnapshot.exists() || !warrantySnapshot.exists()) throw new Error('A linked record was deleted. Reload the request.');
      const current = parseRequest(requestSnapshot.id, requestSnapshot.data());
      assertRequestEditable(current.status);
      if (current.applianceId !== item.appliance.id || current.warrantyId !== item.warranty.id || current.customerId !== item.customer.id) throw new Error('Request links changed. Reload before saving.');
      if (applianceSnapshot.data().customerId !== current.customerId || warrantySnapshot.data().applianceId !== current.applianceId) throw new Error('Related record ownership changed. Reload before saving.');
      transaction.update(requestRef, { customerName: item.customer.name, customerPhone: item.customer.phone, customerEmail: item.customer.email, applianceName: item.appliance.name, updatedAt: serverTimestamp() });
      const { name, brand, model, serialNumber, purchaseDate } = item.appliance;
      transaction.update(applianceRef, { name, brand, model, serialNumber, purchaseDate, updatedAt: serverTimestamp() });
      transaction.update(warrantyRef, { purchaseDate, expiryDate: item.warranty.expiryDate, status: item.warranty.status, updatedAt: serverTimestamp() });
    });
  });
}
/** Request status and its provider notification are committed together. */
export function updateWarrantyRequestStatus(id: string, status: RequestStatus, notes: string) {
  return firestoreOperation('Update warranty request status', async () => {
    assertId(id);
    const storedStatus = toFirestoreStatus(status);
    // A transaction re-reads the eligibility records before approving. Rules remain the authorization boundary.
    const requestRef = doc(db, 'warrantyRequests', id), notificationRef = doc(collection(db, 'providerNotifications'));
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(requestRef);
      if (!snapshot.exists()) throw new Error('Warranty request not found.');
      const current = parseRequest(snapshot.id, snapshot.data());
      if (current.status === status && current.notes === notes.trim()) return;
      assertRequestEditable(current.status);
      if (status === 'Approved') {
        assertId(current.applianceId); assertId(current.warrantyId);
        const [applianceSnapshot, warrantySnapshot] = await Promise.all([
          transaction.get(doc(db, 'appliances', current.applianceId)), transaction.get(doc(db, 'warranties', current.warrantyId)),
        ]);
        if (!applianceSnapshot.exists() || !warrantySnapshot.exists()) throw new Error('Appliance or warranty details are missing.');
        const appliance = parseAppliance(applianceSnapshot.id, applianceSnapshot.data()), warranty = parseWarranty(warrantySnapshot.id, warrantySnapshot.data());
        const item: WarrantyCase = { request: current, appliance, warranty, documents: [], customer: { id: current.customerId, name: current.customerName, phone: current.customerPhone, email: current.customerEmail } };
        if (appliance.customerId !== current.customerId || warranty.applianceId !== current.applianceId || !eligibility(item).every(check => check.checked) || !current.modelSerialConfirmed) throw new Error('Approval requires a valid warranty period, both uploaded document flags, a completed document review, and confirmed model/serial details.');
      }
      if (current.status === status && current.notes === notes.trim()) return;
      transaction.update(requestRef, { status: storedStatus, notes: notes.trim(), verificationNotes: notes.trim(), documentsReviewed: current.documentsReviewed,
        updatedAt: serverTimestamp(), ...(['Approved', 'Rejected'].includes(status) ? { verifiedAt: serverTimestamp() } : {}) });
      const title = status === 'Approved' ? 'Warranty request approved' : status === 'Rejected' ? 'Warranty request rejected' : status === 'More Information Required' ? 'More information required' : 'Warranty request status updated';
      const message = status === 'Approved' ? `Warranty request ${id} has been approved.` : status === 'Rejected' ? `Warranty request ${id} has been rejected.` : status === 'More Information Required' ? `More information is required for warranty request ${id}.` : `Warranty request ${id} is pending.`;
      transaction.set(notificationRef, { providerId: current.providerId, customerId: current.customerId, warrantyRequestId: id, customerName: current.customerName,
        title, message, isRead: false, createdAt: serverTimestamp(),
        ...(typeof snapshot.data().developmentSeed === 'string' ? { developmentSeed: snapshot.data().developmentSeed } : {}) });
    });
  });
}

/** Persist only a complete, explicit provider confirmation; checkbox edits stay local. */
export function confirmWarrantyDocumentsReviewed(id: string, confirmations: Pick<WarrantyRequest, 'warrantyCardUploaded' | 'purchaseReceiptUploaded' | 'documentsReviewed'>) {
  return firestoreOperation('Save document review', async () => {
    assertId(id);
    if (confirmations.warrantyCardUploaded !== true || confirmations.purchaseReceiptUploaded !== true || confirmations.documentsReviewed !== true) throw new Error('Select all three confirmations before continuing.');
    const reference = doc(db, 'warrantyRequests', id);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Warranty request not found.');
      assertRequestEditable(parseRequest(snapshot.id, snapshot.data()).status);
      transaction.update(reference, { warrantyCardUploaded: true, purchaseReceiptUploaded: true, documentsReviewed: true, updatedAt: serverTimestamp() });
    });
  });
}
