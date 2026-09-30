export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'More Information Required';
export interface WarrantyRequest {
  id: string; customerId: string; applianceId: string; warrantyId: string;
  providerId: string; status: RequestStatus; notes: string; createdAt: string; updatedAt: string;
}
export interface Warranty {
  id: string; applianceId: string; purchaseDate: string; expiryDate: string;
  status: 'Active' | 'Expired' | 'Under review'; modelCovered: boolean;
}
export interface Appliance {
  id: string; customerId: string; name: string; brand: string; model: string;
  serialNumber: string; purchaseDate: string;
}
export interface WarrantyDocument {
  id: string; warrantyRequestId: string; type: 'Warranty Card' | 'Purchase Receipt';
  fileName: string; fileUrl: string | null;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected'; sampleText?: string;
}
export interface ProviderNotification {
  id: string; providerId: string; warrantyRequestId: string; customerName: string;
  title: string; message: string; isRead: boolean; createdAt: string;
}
export interface Customer { id: string; name: string; phone: string; email: string }
export interface WarrantyCase {
  request: WarrantyRequest; customer: Customer; appliance: Appliance;
  warranty: Warranty; documents: WarrantyDocument[];
}
export interface ProviderState { cases: WarrantyCase[]; notifications: ProviderNotification[] }
