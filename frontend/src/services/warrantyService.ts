import type { Warranty } from '../types/provider';
import { createRepository } from './providerFirestore';
const repository = createRepository<Warranty>('warranties');
export const getWarranty = repository.getById;
export const listApplianceWarranties = (applianceId: string) => repository.listBy('applianceId', applianceId);
export const saveWarranty = repository.save;
