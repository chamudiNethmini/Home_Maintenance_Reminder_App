import type { ProviderState, RequestStatus, WarrantyCase } from '../types/provider';
export function createMockData(): ProviderState {
  const now = new Date();
  const date = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();
  const people = [
    ['Nimal Perera', 'Refrigerator', 'Samsung', 'RT38', 'Pending'],
    ['Amaya Fernando', 'Washing Machine', 'LG', 'F4V5', 'Pending'],
    ['Kasun Silva', 'Air Conditioner', 'Panasonic', 'CS-PU12', 'Approved'],
    ['Dinithi Jayawardena', 'Microwave Oven', 'Singer', 'SMW-20', 'Rejected'],
    ['Ravindu De Silva', 'Dishwasher', 'Bosch', 'SMS46', 'More Information Required'],
  ];
  const cases: WarrantyCase[] = people.map(([name, appliance, brand, model, status], index) => {
    const n = String(index + 1), id = 'WR-2026-00' + n, purchaseDate = date(-220 - index * 10).slice(0, 10);
    return {
      request: { id, customerId: 'customer-' + n, applianceId: 'appliance-' + n, warrantyId: 'warranty-' + n, providerId: 'provider-demo', status: status as RequestStatus, notes: '', createdAt: date(-index), updatedAt: date(-index) },
      customer: { id: 'customer-' + n, name, phone: '+94 77 000 000' + n, email: 'customer' + n + '@example.com' },
      appliance: { id: 'appliance-' + n, customerId: 'customer-' + n, name: appliance, brand, model, serialNumber: 'FM-' + model + '-00' + n, purchaseDate },
      warranty: { id: 'warranty-' + n, applianceId: 'appliance-' + n, purchaseDate, expiryDate: date(index === 3 ? -10 : 145).slice(0, 10), status: index === 3 ? 'Expired' : 'Active', modelCovered: true },
      documents: (['Warranty Card', 'Purchase Receipt'] as const).filter(type => index !== 4 || type !== 'Purchase Receipt').map((type, d) => ({
        id: 'document-' + n + '-' + d, warrantyRequestId: id, type, fileName: (d ? 'receipt_' : 'warranty_') + model.toLowerCase() + '.pdf',
        fileUrl: null, verificationStatus: index === 2 ? 'Verified' : 'Pending',
        sampleText: type + '\n\nCustomer: ' + name + '\nAppliance: ' + brand + ' ' + appliance + '\nModel: ' + model + '\nSerial: FM-' + model + '-00' + n + '\nPurchase date: ' + purchaseDate + '\n\nIllustrative document content. This is not a customer-uploaded file.',
      })),
    };
  });
  return { cases, notifications: [
    { id: 'n1', providerId: 'provider-demo', warrantyRequestId: cases[0].request.id, customerName: people[0][0], title: 'New warranty request received', message: 'A refrigerator warranty request is ready for review.', isRead: false, createdAt: date(0) },
    { id: 'n2', providerId: 'provider-demo', warrantyRequestId: cases[1].request.id, customerName: people[1][0], title: 'Customer uploaded a missing receipt', message: 'The purchase receipt is now available in Document Review.', isRead: false, createdAt: date(-1) },
    { id: 'n3', providerId: 'provider-demo', warrantyRequestId: cases[2].request.id, customerName: people[2][0], title: 'Warranty request status updated to Approved', message: 'The air conditioner warranty request was approved.', isRead: true, createdAt: date(-2) },
    { id: 'n4', providerId: 'provider-demo', warrantyRequestId: cases[4].request.id, customerName: people[4][0], title: 'More information requested from customer', message: 'A purchase receipt is needed to continue review.', isRead: false, createdAt: date(-3) },
  ] };
}
