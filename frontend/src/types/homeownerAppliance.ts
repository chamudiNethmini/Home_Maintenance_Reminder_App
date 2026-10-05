export type ApplianceCategory =
  | 'Kitchen'
  | 'Laundry'
  | 'Cooling'
  | 'Cleaning'
  | 'Other';

export interface HomeownerAppliance {
  id: string;

  // Firebase UID of the homeowner
  customerId: string;

  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  category: ApplianceCategory;

  // Stored as YYYY-MM-DD
  purchaseDate: string;
  installationDate: string;

  createdAt?: string;
  updatedAt?: string;
}

export type CreateHomeownerAppliance = {
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  category: ApplianceCategory;
  purchaseDate: string;
  installationDate: string;
};

export type UpdateHomeownerAppliance =
  Partial<CreateHomeownerAppliance>;