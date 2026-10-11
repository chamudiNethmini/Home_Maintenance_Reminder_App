import type { Timestamp } from 'firebase/firestore';
import type { Appliance, ProviderNotification, Warranty, WarrantyDocument, WarrantyRequest } from '../types/provider';
import { requestStatus } from './providerWorkflow';
export type RecordData = Record<string, unknown>;
export const textValue = (value: unknown) => typeof value === 'string' ? value : '';
function isTimestamp(value: unknown): value is Pick<Timestamp, 'toDate'> {
  // Structural check also handles Timestamp instances crossing SDK/module boundaries.
  return typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function';
}
export function dateValue(value: unknown, calendar = false): string {
  const date = isTimestamp(value) ? value.toDate() : value instanceof Date ? value : typeof value === 'string' && value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return calendar ? date.toISOString().slice(0, 10) : date.toISOString();
}
export function parseRequest(id: string, data: RecordData): WarrantyRequest {
  const customer = data.customer && typeof data.customer === 'object' ? data.customer as RecordData : {};
  return { id, customerId: textValue(data.customerId), applianceId: textValue(data.applianceId), warrantyId: textValue(data.warrantyId),
    providerId: textValue(data.providerId) || null, status: requestStatus(data.status), notes: textValue(data.notes),
    createdAt: dateValue(data.createdAt), updatedAt: dateValue(data.updatedAt),
    warrantyCardUploaded: data.warrantyCardUploaded === true, purchaseReceiptUploaded: data.purchaseReceiptUploaded === true,
    documentsReviewed: data.documentsReviewed === true, verificationNotes: textValue(data.verificationNotes),
    modelSerialConfirmed: data.modelSerialConfirmed === true, verifiedAt: dateValue(data.verifiedAt),
    customerName: textValue(data.customerName) || textValue(customer.name), customerPhone: textValue(data.customerPhone) || textValue(customer.phone),
    customerEmail: textValue(data.customerEmail) || textValue(customer.email), applianceName: textValue(data.applianceName) };
}
export function parseAppliance(id: string, data: RecordData): Appliance {
  return { id, customerId: textValue(data.customerId), name: textValue(data.name), brand: textValue(data.brand), model: textValue(data.model), serialNumber: textValue(data.serialNumber), purchaseDate: dateValue(data.purchaseDate, true) };
}
export function parseWarranty(id: string, data: RecordData): Warranty {
  const status = textValue(data.status).toLowerCase();
  return { id, applianceId: textValue(data.applianceId), purchaseDate: dateValue(data.purchaseDate, true), expiryDate: dateValue(data.expiryDate, true),
    status: status === 'active' ? 'Active' : status === 'expired' ? 'Expired' : 'Under review', modelCovered: typeof data.modelCovered === 'boolean' ? data.modelCovered : null };
}
export function parseDocument(id: string, data: RecordData): WarrantyDocument {
  const type = textValue(data.type).toLowerCase().replaceAll('_', ' ');
  const status = textValue(data.verificationStatus).toLowerCase();
  return { id, warrantyRequestId: textValue(data.warrantyRequestId), type: type === 'warranty card' ? 'warranty_card' : type === 'purchase receipt' ? 'purchase_receipt' : 'other',
    fileName: textValue(data.fileName), fileUrl: textValue(data.fileUrl) || null,
    verificationStatus: status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending',
    createdAt: dateValue(data.createdAt), updatedAt: dateValue(data.updatedAt) };
}
export function parseNotification(id: string, data: RecordData): ProviderNotification {
  return { id, providerId: textValue(data.providerId) || null, customerId: textValue(data.customerId) || null, warrantyRequestId: textValue(data.warrantyRequestId), customerName: textValue(data.customerName),
    title: textValue(data.title), message: textValue(data.message), isRead: data.isRead === true, createdAt: dateValue(data.createdAt) };
}
export function firestoreError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : String(error);
  if (code.includes('permission-denied')) return 'Access denied by Firestore rules. The shared authentication and provider permissions must be configured. (' + code + ')';
  if (code.includes('unavailable')) return 'Firestore is unavailable. Check your internet connection and retry. (' + code + ')';
  return message;
}
