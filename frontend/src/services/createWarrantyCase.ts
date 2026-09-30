import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createAppliance } from './applianceService';
import { createWarranty } from './warrantyService';
import { createWarrantyRequest } from './warrantyRequestService';
import { firestoreOperation } from './providerFirestore';
import { validateWarrantyRequestForm, type WarrantyRequestForm } from '../utils/warrantyRequestForm';

/** Replace with the customer module's ID once its shared identity contract is available.
 * Allocating a reference does not write a customer or request document. */
function generateRequestCustomerId() { return 'request-customer-' + doc(collection(db, 'warrantyRequests')).id; }

export function createWarrantyCase(input: WarrantyRequestForm, identity: { customerId?: string; providerId?: string } = {}) {
  return firestoreOperation('Create warranty request', async () => {
    try {
      const form = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim()])) as WarrantyRequestForm;
      const error = validateWarrantyRequestForm(form);
      if (error) throw new Error(error);
      const customerId = identity.customerId ?? generateRequestCustomerId(), providerId = identity.providerId ?? null;
      const batch = writeBatch(db);
      const applianceId = await createAppliance({ customerId, name: form.applianceName, brand: form.brand, model: form.model, serialNumber: form.serialNumber, purchaseDate: form.purchaseDate, warrantyExpiryDate: form.warrantyExpiryDate }, batch);
      const warrantyId = await createWarranty({ customerId, applianceId, providerId, purchaseDate: form.purchaseDate, expiryDate: form.warrantyExpiryDate, status: 'Active', modelCovered: null }, batch);
      const warrantyRequestId = await createWarrantyRequest({ customerId, applianceId, warrantyId, providerId, customerName: form.customerName, customerPhone: form.customerPhone, customerEmail: form.customerEmail, applianceName: form.applianceName, status: 'Pending', notes: form.notes }, batch);
      // All three linked documents become visible together, or none are written.
      await batch.commit();
      return { warrantyRequestId, applianceId, warrantyId, customerId };
    } catch (error) {
      console.error('Warranty request creation failed', error);
      throw error;
    }
  });
}
