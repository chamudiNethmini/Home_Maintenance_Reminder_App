import type { RequestStatus, StoredRequestStatus, WarrantyCase, RequestSummary } from '../types/provider';
export const statuses: RequestStatus[] = ['Pending', 'Approved', 'Rejected', 'More Information Required'];
const stored: Record<RequestStatus, StoredRequestStatus> = {
  Pending: 'pending', Approved: 'approved', Rejected: 'rejected', 'More Information Required': 'more_information_required',
};
export function toFirestoreStatus(status: RequestStatus): StoredRequestStatus {
  if (!statuses.includes(status)) throw new Error('Invalid warranty request status.');
  return stored[status];
}
export function requestStatus(value: unknown): RequestStatus {
  const entry = statuses.find(status => status === value || stored[status] === value);
  if (!entry) throw new Error('Unsupported warranty request status: ' + String(value));
  return entry;
}
export function filterRequests(requests: RequestSummary[], search: string, status: RequestStatus | 'All') {
  const term = search.trim().toLowerCase();
  return requests.filter(item => (status === 'All' || item.request.status === status) &&
    [item.request.id, item.customerName, item.applianceName, item.applianceBrand].some(value => value.toLowerCase().includes(term)));
}
export function eligibility(item: WarrantyCase, today = new Date().toISOString().slice(0, 10)) {
  const has = (type: string) => item.documents.some(doc => doc.type === type && !!doc.fileUrl);
  return [
    { label: 'Valid warranty period', checked: validDate(item.warranty.purchaseDate) && validDate(item.warranty.expiryDate) && item.warranty.purchaseDate <= today && today <= item.warranty.expiryDate },
    { label: 'Receipt available', checked: has('Purchase Receipt') },
    { label: 'Model covered', checked: item.warranty.modelCovered === true },
    { label: 'Documents complete', checked: has('Warranty Card') && has('Purchase Receipt') && item.documents.every(doc => doc.verificationStatus === 'Verified') },
  ];
}
export function formatDate(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return 'Date unavailable';
  return new Date(value.length === 10 ? value + 'T12:00:00' : value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
