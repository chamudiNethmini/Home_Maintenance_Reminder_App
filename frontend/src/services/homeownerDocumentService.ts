import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

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

type UploadResponse = {
  status: number;
  result: CloudinaryResponse;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

function parseUploadResponse(
  body: string,
  status: number,
): CloudinaryResponse {
  try {
    return JSON.parse(body) as CloudinaryResponse;
  } catch {
    throw new Error(
      `Upload server returned an invalid response (${status}).`,
    );
  }
}

async function uploadMobileFile(
  url: string,
  file: SelectedWarrantyDocument,
  uploadPreset: string,
): Promise<UploadResponse> {
  console.log('MOBILE FILESYSTEM UPLOAD V3');

  let uploadUri = file.uri;
  let temporaryUri: string | null = null;

  try {
    // Convert Android content URIs into a local cached file.
    if (!uploadUri.startsWith('file://')) {
      const cacheDirectory = FileSystem.cacheDirectory;

      if (!cacheDirectory) {
        throw new Error(
          'Could not access the device cache.',
        );
      }

      const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_',
      );

      temporaryUri =
        `${cacheDirectory}warranty_` +
        `${Date.now()}_${safeName}`;

      await FileSystem.copyAsync({
        from: file.uri,
        to: temporaryUri,
      });

      uploadUri = temporaryUri;
    }

    const fileInfo = await FileSystem.getInfoAsync(
      uploadUri,
    );

    if (!fileInfo.exists || fileInfo.isDirectory) {
      throw new Error(
        'Selected file was not found. Please select it again.',
      );
    }

    if (fileInfo.size > MAX_FILE_SIZE) {
      throw new Error(
        'Document size must be 5 MB or less.',
      );
    }

    const response = await FileSystem.uploadAsync(
      url,
      uploadUri,
      {
        httpMethod: 'POST',
        uploadType:
          FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: file.mimeType,
        parameters: {
          upload_preset: uploadPreset,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    );

    return {
      status: response.status,
      result: parseUploadResponse(
        response.body,
        response.status,
      ),
    };
  } finally {
    // Only remove the temporary copy created above.
    if (temporaryUri) {
      await FileSystem.deleteAsync(
        temporaryUri,
        { idempotent: true },
      ).catch(() => {});
    }
  }
}

async function uploadWebFile(
  url: string,
  file: SelectedWarrantyDocument,
  uploadPreset: string,
): Promise<UploadResponse> {
  const fileResponse = await fetch(file.uri);

  if (!fileResponse.ok) {
    throw new Error(
      'Could not read the selected document.',
    );
  }

  const blob = await fileResponse.blob();

  if (blob.size > MAX_FILE_SIZE) {
    throw new Error(
      'Document size must be 5 MB or less.',
    );
  }

  const formData = new FormData();

  formData.append('file', blob, file.name);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const body = await response.text();

  return {
    status: response.status,
    result: parseUploadResponse(
      body,
      response.status,
    ),
  };
}

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
    throw new Error(
      'Please save the warranty before uploading documents.',
    );
  }

  if (!file.id || !file.uri || !file.name) {
    throw new Error(
      'Please select a valid document.',
    );
  }

  if (!ALLOWED_TYPES.includes(file.mimeType)) {
    throw new Error(
      'Please select a JPG, PNG, WEBP image or PDF.',
    );
  }

  if (
    file.size !== undefined &&
    file.size > MAX_FILE_SIZE
  ) {
    throw new Error(
      'Document size must be 5 MB or less.',
    );
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

  const warrantySnapshot =
    await getDoc(warrantyRef);

  if (!warrantySnapshot.exists()) {
    throw new Error('Warranty was not found.');
  }

  const warrantyData = warrantySnapshot.data();

  if (warrantyData.customerId !== customerId) {
    throw new Error(
      'You cannot upload documents for this warranty.',
    );
  }

  const existingDocuments: SavedWarrantyDocument[] =
    Array.isArray(warrantyData.documents)
      ? warrantyData.documents
      : [];

  const existingDocument =
    existingDocuments.find(
      (document) => document.id === file.id,
    );

  if (existingDocument) {
    return existingDocument;
  }

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/` +
    `${cloudName.trim()}/auto/upload`;

  const uploadResponse =
    Platform.OS === 'web'
      ? await uploadWebFile(
          uploadUrl,
          file,
          uploadPreset.trim(),
        )
      : await uploadMobileFile(
          uploadUrl,
          file,
          uploadPreset.trim(),
        );

  const { status, result } = uploadResponse;

  if (
    status < 200 ||
    status >= 300 ||
    !result.secure_url ||
    !result.public_id
  ) {
    throw new Error(
      result.error?.message ??
        'Document upload failed. Please try again.',
    );
  }

  const savedDocument: SavedWarrantyDocument = {
    id: file.id,
    fileName: file.name,
    fileUrl: result.secure_url,
    publicId: result.public_id,
    resourceType:
      result.resource_type ?? 'image',
    mimeType: file.mimeType,
  };

  // Return the existing metadata if another upload
  // saved this document ID during our request.
  return runTransaction(
    db,
    async (transaction) => {
      if (
        auth.currentUser?.uid !== customerId
      ) {
        throw new Error(
          'Your session changed. Please log in again.',
        );
      }

      const latestSnapshot =
        await transaction.get(warrantyRef);

      if (!latestSnapshot.exists()) {
        throw new Error(
          'Warranty was deleted before the document could be saved.',
        );
      }

      const latestData = latestSnapshot.data();

      if (
        latestData.customerId !== customerId
      ) {
        throw new Error(
          'You cannot update this warranty.',
        );
      }

      const documents: SavedWarrantyDocument[] =
        Array.isArray(latestData.documents)
          ? latestData.documents
          : [];

      const alreadySaved = documents.find(
        (document) => document.id === file.id,
      );

      if (alreadySaved) {
        return alreadySaved;
      }

      transaction.update(warrantyRef, {
        documents: [
          ...documents,
          savedDocument,
        ],
        updatedAt: serverTimestamp(),
      });

      return savedDocument;
    },
  );
}