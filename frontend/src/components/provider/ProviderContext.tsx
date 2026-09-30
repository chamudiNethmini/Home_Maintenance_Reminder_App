import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ProviderState, RequestStatus, WarrantyCase } from '../../types/provider';
import { createMockData } from '../../utils/providerMockData';
import { markNotificationsRead, updateStatus } from '../../utils/providerWorkflow';
interface Value {
  state: ProviderState;
  saveCase: (item: WarrantyCase) => void;
  changeStatus: (id: string, status: RequestStatus, notes: string) => void;
  markRead: (id?: string) => void;
}
const Context = createContext<Value | null>(null);
export function ProviderModuleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createMockData);
  return <Context.Provider value={{ state,
    saveCase: item => setState(current => ({ ...current, cases: current.cases.map(entry => entry.request.id === item.request.id ? item : entry) })),
    changeStatus: (id, status, notes) => { const next = updateStatus(state, id, status, notes, new Date().toISOString()); setState(next); },
    markRead: id => setState(current => markNotificationsRead(current, id)),
  }}>{children}</Context.Provider>;
}
export function useProviderModule() {
  const value = useContext(Context);
  if (!value) throw new Error('ProviderModuleProvider is required.');
  return value;
}
