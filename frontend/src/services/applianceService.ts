import type { Appliance } from '../types/provider';
import { createRepository } from './providerFirestore';
const repository = createRepository<Appliance>('appliances');
export const getAppliance = repository.getById;
export const listCustomerAppliances = (customerId: string) => repository.listBy('customerId', customerId);
export const saveAppliance = repository.save;
