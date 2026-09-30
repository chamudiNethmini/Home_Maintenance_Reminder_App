import { collection, doc, getDoc, getDocs, limit, query, setDoc, Timestamp, where, type DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

/** Domain timestamps are ISO strings; existing Firestore Timestamp values are normalized here. */
export function fromFirestore<T>(id: string, data: DocumentData): T {
  const normalized = Object.fromEntries(Object.entries(data).map(([key, value]) =>
    [key, value instanceof Timestamp ? value.toDate().toISOString() : value]));
  return { ...normalized, id } as T;
}
export function assertId(id: string) {
  if (!id.trim() || id.includes('/')) throw new Error('A valid document ID is required.');
}
export function createRepository<T extends { id: string }>(collectionName: string) {
  return {
    async getById(id: string): Promise<T | null> {
      assertId(id);
      const snapshot = await getDoc(doc(db, collectionName, id));
      return snapshot.exists() ? fromFirestore<T>(snapshot.id, snapshot.data()) : null;
    },
    // Bounded reads: add cursor pagination when connecting production screens.
    async listBy(field: keyof T & string, value: string): Promise<T[]> {
      assertId(value);
      const snapshot = await getDocs(query(collection(db, collectionName), where(field, '==', value), limit(100)));
      return snapshot.docs.map(item => fromFirestore<T>(item.id, item.data()));
    },
    async save(record: T): Promise<void> {
      assertId(record.id);
      const { id, ...data } = record;
      const serialized = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, (key === 'createdAt' || key === 'updatedAt') && typeof value === 'string' ? Timestamp.fromDate(new Date(value)) : value]));
      await setDoc(doc(db, collectionName, id), serialized, { merge: true });
    },
  };
}
