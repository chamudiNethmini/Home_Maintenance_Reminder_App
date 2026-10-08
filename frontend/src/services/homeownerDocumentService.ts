import { Platform } from 'react-native';

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

export type SelectedWarrantyDocument = {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size?: number;
};

export type SavedWarrantyDocument = {
  id: string;
  fileName: string;
  fileUrl: string;
  publicId: string;
  resourceType: string;
  mimeType: string;
};

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  error?: {
    message?: string;
  };
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export async function uploadHomeownerDocument(
  warrantyId: string,
  file: SelectedWarrantyDocument,
): Promise<SavedWarrantyDocument> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Please log in first.');
  }

  const customerId = user.uid;

  if (!warrantyId?.trim()) {
    throw new Error('Please save the warranty before uploading documents.');
  }

  if (!file.id || !file.uri || !file.name) {
    throw new Error('Please select a valid document.');
  }

  if (!ALLOWED_TYPES.includes(file.mimeType)) {
    throw new Error('Please select a JPG, PNG, WEBP image or PDF.');
  }

  if (file.size !== undefined && file.size > MAX_FILE_SIZE) {
    throw new Error('Document size must be 5 MB or less.');
  }

  const cloudName =
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const uploadPreset =
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName?.trim() || !uploadPreset?.trim()) {
    throw new Error(
      'Cloudinary configuration is missing. Check frontend/.env and restart Expo.',
    );
  }

  const warrantyRef = doc(
    db,
    'homeownerWarranties',
    warrantyId,
  );

  const warrantySnapshot = await getDoc(warrantyRef);

  if (!warrantySnapshot.exists()) {
    throw new Error('Warranty was not found.');
  }

  const warrantyData = warrantySnapshot.data();

  if (warrantyData.customerId !== customerId) {
    throw new Error('You cannot upload documents for this warranty.');
  }

  const existingDocuments: SavedWarrantyDocument[] =
    Array.isArray(warrantyData.documents)
      ? warrantyData.documents
      : [];

  const existingDocument = existingDocuments.find(
    (document) => document.id === file.id,
  );

  if (existingDocument) {
    return existingDocument;
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const fileResponse = await fetch(file.uri);

    if (!fileResponse.ok) {
      throw new Error('Could not read the selected document.');
    }

    const blob = await fileResponse.blob();

    if (blob.size > MAX_FILE_SIZE) {
      throw new Error('Document size must be 5 MB or less.');
    }

    formData.append('file', blob, file.name);
  } else {
    // React Native accepts a local file object for FormData.
    formData.append(
      'file',
      {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as unknown as Blob,
    );
  }

  formData.append('upload_preset', uploadPreset.trim());

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName.trim()}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const result: CloudinaryResponse = await response.json();

  if (
    !response.ok ||
    !result.secure_url ||
    !result.public_id
  ) {
    throw new Error(
      result.error?.message ?? 'Document upload failed. Please try again.',
    );
  }

  const savedDocument: SavedWarrantyDocument = {
    id: file.id,
    fileName: file.name,
    fileUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type ?? 'image',
    mimeType: file.mimeType,
  };

  await runTransaction(db, async (transaction) => {
    if (auth.currentUser?.uid !== customerId) {
      throw new Error('Your session changed. Please log in again.');
    }

    const latestSnapshot = await transaction.get(warrantyRef);

    if (!latestSnapshot.exists()) {
      throw new Error('Warranty was deleted before the document could be saved.');
    }

    const latestData = latestSnapshot.data();

    if (latestData.customerId !== customerId) {
      throw new Error('You cannot update this warranty.');
    }

    const documents: SavedWarrantyDocument[] =
      Array.isArray(latestData.documents)
        ? latestData.documents
        : [];

    const alreadySaved = documents.some(
      (document) => document.id === file.id,
    );

    if (!alreadySaved) {
      transaction.update(warrantyRef, {
        documents: [...documents, savedDocument],
        updatedAt: serverTimestamp(),
      });
    }
  });

  return savedDocument;
}