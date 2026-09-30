import type { Timestamp } from 'firebase/firestore';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'More Information Required';
export type StoredRequestStatus = 'pending' | 'approved' | 'rejected' | 'more_information_required';
export interface WarrantyRequest {
  id: string; customerId: string; applianceId: string; warrantyId: string;
  providerId: string | null; status: RequestStatus; notes: string; createdAt: string; updatedAt: string;
  customerName: string; customerPhone: string; customerEmail: string; applianceName: string;
}
export interface Warranty {
  id: string; applianceId: string; purchaseDate: string; expiryDate: string;
  status: 'Active' | 'Expired' | 'Under review'; modelCovered: boolean | null;
}
export interface Appliance {
  id: string; customerId: string; name: string; brand: string; model: string;
  serialNumber: string; purchaseDate: string;
}
export interface WarrantyDocument {
  id: string; warrantyRequestId: string; type: 'Warranty Card' | 'Purchase Receipt' | 'Other';
  fileName: string; fileUrl: string | null;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}
export interface ProviderNotification {
  id: string; providerId: string | null; warrantyRequestId: string; customerName: string;
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
export type CreateWarrantyRequest = Omit<WarrantyRequest, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateProviderNotification = Omit<ProviderNotification, 'id' | 'createdAt'>;
