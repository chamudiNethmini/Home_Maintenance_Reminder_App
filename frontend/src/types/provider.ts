import type { Timestamp } from 'firebase/firestore';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'More Information Required';
export type StoredRequestStatus = 'pending' | 'approved' | 'rejected' | 'more_information_required';
export interface WarrantyRequest {
  id: string; customerId: string; applianceId: string; warrantyId: string;
  providerId: string | null; status: RequestStatus; notes: string; createdAt: string; updatedAt: string;
  customerName: string; customerPhone: string; customerEmail: string; applianceName: string;
  warrantyCardUploaded: boolean; purchaseReceiptUploaded: boolean;
  documentsReviewed: boolean; verificationNotes: string; modelSerialConfirmed: boolean; verifiedAt: string;
}
export interface Warranty {
  id: string; applianceId: string; purchaseDate: string; expiryDate: string;
  status: 'Active' | 'Expired' | 'Under review'; modelCovered: boolean | null;
}
export interface Appliance {
  id: string; customerId: string; name: string; brand: string; model: string;
  serialNumber: string; purchaseDate: string;
}
export type WarrantyDocumentType = 'warranty_card' | 'purchase_receipt' | 'other';
export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';
export interface WarrantyDocument {
  id: string; warrantyRequestId: string; type: WarrantyDocumentType;
  fileName: string; fileUrl: string | null; verificationStatus: DocumentVerificationStatus;
  createdAt: string; updatedAt: string;
}
export type CreateWarrantyDocument = Omit<WarrantyDocument, 'id' | 'createdAt' | 'updatedAt'>;
export interface ProviderNotification {
  id: string; providerId: string | null; customerId?: string | null; warrantyRequestId: string; customerName: string;
  title: string; message: string; isRead: boolean; createdAt: string;
}
export interface Customer { id: string; name: string; phone: string; email: string }
export interface WarrantyCase {
  request: WarrantyRequest; customer: Customer; appliance: Appliance;
  warranty: Warranty; documents: WarrantyDocument[];
}
export interface RequestSummary {
  request: WarrantyRequest; customerName: string; applianceName: string; applianceBrand: string;
}
export interface ProviderState { requests: RequestSummary[]; notifications: ProviderNotification[] }
/** Persisted request schema. Server timestamp writes use FieldValue, reads normalize to ISO strings. */
export type FirestoreWarrantyRequest = Omit<WarrantyRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  status: StoredRequestStatus; createdAt: Timestamp | null; updatedAt: Timestamp | null;
};
export type CreateWarrantyRequest = Omit<WarrantyRequest, 'id' | 'createdAt' | 'updatedAt' | 'verifiedAt' | 'warrantyCardUploaded' | 'purchaseReceiptUploaded' | 'documentsReviewed' | 'verificationNotes' | 'modelSerialConfirmed'> & Partial<Pick<WarrantyRequest, 'warrantyCardUploaded' | 'purchaseReceiptUploaded' | 'documentsReviewed' | 'verificationNotes' | 'modelSerialConfirmed'>>;
export type CreateProviderNotification = Omit<ProviderNotification, 'id' | 'createdAt'>;
