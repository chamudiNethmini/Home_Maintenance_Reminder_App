import { validDate } from './providerWorkflow';

export const requestFieldLabels = {
  customerName: 'Customer Name', customerPhone: 'Customer Phone', customerEmail: 'Customer Email',
  applianceName: 'Appliance Name', brand: 'Brand', model: 'Model', serialNumber: 'Serial Number',
  purchaseDate: 'Purchase Date', warrantyExpiryDate: 'Warranty Expiry Date', notes: 'Notes',
};
export type WarrantyRequestForm = Record<keyof typeof requestFieldLabels, string>;
export function validateWarrantyRequestForm(form: WarrantyRequestForm): string {
  for (const key of Object.keys(requestFieldLabels) as (keyof WarrantyRequestForm)[]) {
    if (key !== 'notes' && !form[key].trim()) return requestFieldLabels[key] + ' is required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) return 'Enter a valid customer email address.';
  if (!/^\+?[\d\s().-]+$/.test(form.customerPhone.trim()) || form.customerPhone.replace(/\D/g, '').length < 7 || form.customerPhone.replace(/\D/g, '').length > 15) return 'Enter a valid customer phone number (7–15 digits).';
  if (!validDate(form.purchaseDate) || !validDate(form.warrantyExpiryDate)) return 'Enter valid dates in YYYY-MM-DD format.';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (form.purchaseDate > today) return 'Purchase Date cannot be in the future.';
  if (form.warrantyExpiryDate < form.purchaseDate) return 'Warranty Expiry Date must be on or after Purchase Date.';
  return '';
}
