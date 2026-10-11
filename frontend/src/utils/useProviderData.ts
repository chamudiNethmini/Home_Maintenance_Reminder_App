import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { WarrantyCase } from '../types/provider';
import { getWarrantyCaseById, getWarrantyRequestById } from '../services/warrantyRequestService';
import { firestoreError } from './providerFirestoreMapping';

async function requireRequest(id: string) { const request = await getWarrantyRequestById(id); if (!request) throw new Error('Warranty request not found.'); return request; }
export const useWarrantyCase = (id: string) => useRecord<WarrantyCase>(id, getWarrantyCaseById);
const loadWarrantyDetails = (id: string) => getWarrantyCaseById(id);
export const useWarrantyDetails = (id: string) => useRecord(id, loadWarrantyDetails);
export const useWarrantyRequest = (id: string) => useRecord(id, requireRequest);
function useRecord<T>(warrantyRequestId: string, loader: (id: string) => Promise<T>) {
  const [item, setItem] = useState<T | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const sequence = useRef(0), loadedId = useRef<string | null>(null);
  const reload = useCallback(async () => {
    const current = ++sequence.current; setLoading(true); setError('');
    try { const result = await loader(warrantyRequestId); if (current === sequence.current) { loadedId.current = warrantyRequestId; setItem(result); } return result; }
    catch (cause) { if (current === sequence.current) setError(firestoreError(cause)); return null; }
    finally { if (current === sequence.current) setLoading(false); }
  }, [warrantyRequestId, loader]);
  useFocusEffect(useCallback(() => { setItem(null); void reload(); return () => { sequence.current++; }; }, [reload]));
  return { item: loadedId.current === warrantyRequestId ? item : null, loading, error, reload };
}
export function useProviderMutation() {
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
  const busy = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const clear = () => { setError(''); setSuccess(''); };
  async function run(operation: () => Promise<void>, message: string): Promise<boolean> {
    if (busy.current) return false;
    busy.current = true; setPending(true); clear();
    try { await operation(); if (mounted.current) setSuccess(message); return true; }
    catch (cause) { if (mounted.current) setError(firestoreError(cause)); return false; }
    finally { busy.current = false; if (mounted.current) setPending(false); }
  }
  return { pending, error, success, run, clear };
}
