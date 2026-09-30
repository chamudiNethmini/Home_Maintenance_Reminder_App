import type { ProviderState, RequestStatus, WarrantyCase } from '../types/provider';
export const statuses: RequestStatus[] = ['Pending', 'Approved', 'Rejected', 'More Information Required'];
export function filterCases(cases: WarrantyCase[], search: string, status: RequestStatus | 'All') {
  const term = search.trim().toLowerCase();
  return cases.filter(item => (status === 'All' || item.request.status === status) &&
    [item.request.id, item.customer.name, item.appliance.name, item.appliance.brand].some(value => value.toLowerCase().includes(term)));
}
export function eligibility(item: WarrantyCase, today = new Date().toISOString().slice(0, 10)) {
  const has = (type: string) => item.documents.some(doc => doc.type === type);
  return [
    { label: 'Valid warranty period', checked: item.warranty.purchaseDate <= today && today <= item.warranty.expiryDate },
    { label: 'Receipt available', checked: has('Purchase Receipt') },
    { label: 'Model covered', checked: item.warranty.modelCovered },
    { label: 'Documents complete', checked: has('Warranty Card') && has('Purchase Receipt') && item.documents.every(doc => doc.verificationStatus === 'Verified') },
  ];
}
export function updateStatus(state: ProviderState, id: string, status: RequestStatus, notes: string, now: string): ProviderState {
  const item = state.cases.find(entry => entry.request.id === id);
  if (!item) throw new Error('Warranty request not found.');
  if (!statuses.includes(status)) throw new Error('Invalid status.');
  if (status === 'Approved' && !eligibility(item).every(check => check.checked)) throw new Error('Complete all eligibility checks before approving.');
  if (item.request.status === status && item.request.notes === notes.trim()) return state;
  return { cases: state.cases.map(entry => entry.request.id === id ? { ...entry, request: { ...entry.request, status, notes: notes.trim(), updatedAt: now } } : entry),
    notifications: [{ id: 'notification-' + id + '-' + now, providerId: item.request.providerId,
      warrantyRequestId: id, customerName: item.customer.name,
      title: status === 'More Information Required' ? 'More information requested from customer' : 'Warranty request status updated to ' + status,
      message: notes.trim() || 'The request for ' + item.appliance.name + ' is now ' + status.toLowerCase() + '.',
      isRead: false, createdAt: now }, ...state.notifications] };
}
export function markNotificationsRead(state: ProviderState, id?: string): ProviderState {
  return { ...state, notifications: state.notifications.map(item => !id || item.id === id ? { ...item, isRead: true } : item) };
}
export function formatDate(value: string) {
  return new Date(value.length === 10 ? value + 'T12:00:00' : value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
