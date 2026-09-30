import { collection, doc, serverTimestamp, setDoc, type WriteBatch } from 'firebase/firestore';
import { db } from '../config/firebase';

/** A supplied batch queues the write; its caller owns committing it. */
export async function createProviderRecord(collectionName: string, data: Record<string, unknown>, batch?: WriteBatch): Promise<string> {
  const reference = doc(collection(db, collectionName));
  const record = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  if (batch) batch.set(reference, record);
  else await setDoc(reference, record);
  return reference.id;
}
