import { collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { firestoreOperation } from '../services/providerFirestore';
import { createWarrantyRequest, deleteWarrantyRequest, getWarrantyRequestById, getWarrantyRequests, updateWarrantyRequest, updateWarrantyRequestStatus } from '../services/warrantyRequestService';
import { getApplianceById, updateAppliance } from '../services/applianceService';
import { getWarrantyById, updateWarranty } from '../services/warrantyService';
import { getDocumentsByWarrantyRequest, updateDocumentVerificationStatus } from '../services/warrantyDocumentService';
import { createProviderNotification, deleteProviderNotification, getProviderNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../services/providerNotificationService';

const seedTag = 'fixmate-provider-development-v1';
const requestIds = [1, 2, 3].map(n => 'fixmate-dev-request-' + n);
type SeedOptions = { projectId: string; confirm: 'CREATE DEVELOPMENT TEST DATA'; providerId?: string; warrantyCardUrl?: string; purchaseReceiptUrl?: string };
function guard(projectId: string) {
  if (!__DEV__) throw new Error('Development tools are disabled in production builds.');
  if (!projectId || projectId !== db.app.options.projectId) throw new Error('The project ID must exactly match the configured Firebase project.');
}
const knownPaths = () => [1, 2, 3].flatMap(n => [
  'warrantyRequests/fixmate-dev-request-' + n, 'appliances/fixmate-dev-appliance-' + n,
  'warranties/fixmate-dev-warranty-' + n, 'warrantyDocuments/fixmate-dev-card-' + n, 'warrantyDocuments/fixmate-dev-receipt-' + n,
]).concat(['providerNotifications/fixmate-dev-notification-1', 'providerNotifications/fixmate-dev-notification-2']);

/** Explicit opt-in only. Never called during startup. Existing records are never overwritten. */
export function seedProviderTestData(options: SeedOptions) {
  return firestoreOperation('Create development test data', async () => {
    guard(options.projectId);
    if (options.confirm !== 'CREATE DEVELOPMENT TEST DATA') throw new Error('Explicit development-data confirmation is required.');
    for (const url of [options.warrantyCardUrl, options.purchaseReceiptUrl]) if (url && !url.startsWith('https://')) throw new Error('Document URLs must use HTTPS.');
    const date = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
    const entries: { path: string; data: Record<string, unknown> }[] = [];
    (['pending', 'approved', 'rejected'] as const).forEach((status, index) => {
      const n = index + 1, requestId = requestIds[index], applianceId = 'fixmate-dev-appliance-' + n, warrantyId = 'fixmate-dev-warranty-' + n;
      const customerName = 'Development Customer ' + n, customerId = 'fixmate-dev-customer-' + n, applianceName = ['Refrigerator', 'Washing Machine', 'Microwave Oven'][index];
      entries.push(
        { path: 'warrantyRequests/' + requestId, data: { customerId, applianceId, warrantyId, providerId: options.providerId || null, status, notes: 'Development-only sample request.', customerName, customerPhone: '+94 77 000 000' + n, customerEmail: 'dev-customer-' + n + '@example.com', applianceName, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } },
        { path: 'appliances/' + applianceId, data: { customerId, name: applianceName, brand: 'Development Brand', model: 'DEV-' + n, serialNumber: 'TEST-SERIAL-' + n, purchaseDate: date(-100) } },
        { path: 'warranties/' + warrantyId, data: { applianceId, purchaseDate: date(-100), expiryDate: date(index === 2 ? -1 : 265), status: index === 2 ? 'expired' : 'active', modelCovered: true } },
        { path: 'warrantyDocuments/fixmate-dev-card-' + n, data: { warrantyRequestId: requestId, type: 'warranty_card', fileName: 'development-warranty-card.pdf', fileUrl: options.warrantyCardUrl || null, verificationStatus: index === 1 && options.warrantyCardUrl ? 'verified' : 'pending' } },
        { path: 'warrantyDocuments/fixmate-dev-receipt-' + n, data: { warrantyRequestId: requestId, type: 'purchase_receipt', fileName: 'development-purchase-receipt.pdf', fileUrl: options.purchaseReceiptUrl || null, verificationStatus: index === 1 && options.purchaseReceiptUrl ? 'verified' : 'pending' } },
      );
      if (index < 2) entries.push({ path: 'providerNotifications/fixmate-dev-notification-' + n, data: { providerId: options.providerId || null, warrantyRequestId: requestId, customerName, title: index ? 'Warranty request status updated to Approved' : 'New warranty request received', message: 'Development-only notification for testing.', isRead: false, createdAt: serverTimestamp() } });
    });
    await runTransaction(db, async transaction => {
      const refs = entries.map(entry => doc(db, entry.path));
      const existing = await Promise.all(refs.map(ref => transaction.get(ref)));
      if (existing.some(snapshot => snapshot.exists())) throw new Error('Development sample IDs already exist. Read them or explicitly remove the sample dataset before seeding again.');
      entries.forEach((entry, index) => transaction.set(refs[index], { ...entry.data, developmentSeed: seedTag }));
    });
    return { requestIds, paths: entries.map(entry => entry.path) };
  });
}
export function deleteProviderTestData(options: { projectId: string; confirm: 'DELETE DEVELOPMENT TEST DATA' }) {
  return firestoreOperation('Delete development test data', async () => {
    guard(options.projectId);
    if (options.confirm !== 'DELETE DEVELOPMENT TEST DATA') throw new Error('Explicit deletion confirmation is required.');
    const notifications = await getDocs(query(collection(db, 'providerNotifications'), where('warrantyRequestId', 'in', requestIds)));
    const paths = [...new Set([...knownPaths(), ...notifications.docs.filter(item => item.data().developmentSeed === seedTag).map(item => 'providerNotifications/' + item.id)])];
    if (paths.length > 400) throw new Error('Too many sample records for one cleanup transaction.');
    await runTransaction(db, async transaction => {
      const refs = paths.map(path => doc(db, path));
      const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) return;
        if (snapshot.data().developmentSeed !== seedTag) throw new Error('Refusing to delete a record without the development marker: ' + paths[index]);
        transaction.delete(refs[index]);
      });
    });
    return { deletedPaths: paths };
  });
}
function devOnly<T extends unknown[], R>(operation: (...args: T) => R) {
  return (...args: T): R => { guard(String(db.app.options.projectId)); return operation(...args); };
}
export const providerDevTools = {
  projectId: db.app.options.projectId,
  seed: seedProviderTestData, cleanup: deleteProviderTestData,
  createRequest: devOnly(createWarrantyRequest), readRequests: devOnly(getWarrantyRequests),
  getRequest: devOnly(getWarrantyRequestById), updateRequest: devOnly(updateWarrantyRequest), updateStatus: devOnly(updateWarrantyRequestStatus), deleteRequest: devOnly(deleteWarrantyRequest),
  getAppliance: devOnly(getApplianceById), updateAppliance: devOnly(updateAppliance),
  getWarranty: devOnly(getWarrantyById), updateWarranty: devOnly(updateWarranty),
  getDocuments: devOnly(getDocumentsByWarrantyRequest), reviewDocument: devOnly(updateDocumentVerificationStatus),
  createNotification: devOnly(createProviderNotification), readNotifications: devOnly(getProviderNotifications),
  markRead: devOnly(markNotificationAsRead), markAllRead: devOnly(markAllNotificationsAsRead), deleteNotification: devOnly(deleteProviderNotification),
};
declare global { var fixmateProviderDev: typeof providerDevTools | undefined; }
export function installProviderDevTools() {
  if (__DEV__) globalThis.fixmateProviderDev = providerDevTools;
  return () => { if (globalThis.fixmateProviderDev === providerDevTools) delete globalThis.fixmateProviderDev; };
}
