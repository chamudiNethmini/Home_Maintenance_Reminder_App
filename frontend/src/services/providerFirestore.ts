import { doc, getDoc, getDocs, collection, query, type QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';
import { firestoreError, type RecordData } from '../utils/providerFirestoreMapping';
export function assertId(id: string) {
  if (!id.trim() || id.includes('/')) throw new Error('A valid document ID is required.');
}
export async function firestoreOperation<T>(operation: string, work: () => Promise<T>): Promise<T> {
  try { return await work(); }
  catch (error) { throw new Error(operation + ': ' + firestoreError(error)); }
}
export function readById<T>(name: string, id: string, parse: (id: string, data: RecordData) => T) {
  return firestoreOperation('Load ' + name, async () => {
    assertId(id);
    const snapshot = await getDoc(doc(db, name, id));
    if (snapshot.metadata.fromCache) throw new Error('Could not confirm this record with Firestore. Check your connection and retry.');
    return snapshot.exists() ? parse(snapshot.id, snapshot.data()) : null;
  });
}
export function readCollection<T>(name: string, parse: (id: string, data: RecordData) => T, constraints: QueryConstraint[] = []) {
  return firestoreOperation('Load ' + name, async () => {
    // No arbitrary limit: counts and filters include every accessible request.
    const snapshot = await getDocs(query(collection(db, name), ...constraints));
    if (snapshot.metadata.fromCache) throw new Error('Could not confirm the collection with Firestore. Check your connection and retry.');
    return snapshot.docs.map(item => {
      try { return parse(item.id, item.data()); }
      catch (error) { throw new Error(name + '/' + item.id + ': ' + firestoreError(error)); }
    });
  });
}
