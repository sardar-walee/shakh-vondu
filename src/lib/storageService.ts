import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { generateUUID } from './firestoreUtils';

export interface UploadResult {
  url: string;
  isCloudStorage: boolean;
  error?: string;
}

/**
 * Uploads a file (File object or compressed Base64 Data URL) to Firebase Storage
 * with automatic fallback to client-side data URL if storage is unconfigured.
 */
export async function uploadMediaToFirebaseStorage(
  fileOrDataUrl: File | string,
  folder: 'products' | 'cars' | 'avatars' | 'receipts' | 'documents' = 'products',
  customFileName?: string
): Promise<UploadResult> {
  const fileName = customFileName || `${generateUUID()}_${Date.now()}.jpg`;
  const storagePath = `${folder}/${fileName}`;

  // If storage is not available or storageBucket is placeholder, return dataURL fallback
  if (!storage) {
    if (typeof fileOrDataUrl === 'string') {
      return { url: fileOrDataUrl, isCloudStorage: false };
    }
    const dataUrl = await fileToDataUrl(fileOrDataUrl);
    return { url: dataUrl, isCloudStorage: false };
  }

  try {
    const storageRef = ref(storage, storagePath);

    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('data:')) {
        // Base64 Data URL upload
        const snapshot = await uploadString(storageRef, fileOrDataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return { url: downloadUrl, isCloudStorage: true };
      } else if (fileOrDataUrl.startsWith('http')) {
        // Already a remote URL
        return { url: fileOrDataUrl, isCloudStorage: true };
      }
    } else {
      // File / Blob upload
      const snapshot = await uploadBytes(storageRef, fileOrDataUrl, {
        contentType: fileOrDataUrl.type || 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return { url: downloadUrl, isCloudStorage: true };
    }
  } catch (err: any) {
    console.warn(`Firebase Storage upload to ${storagePath} fallback notice:`, err?.message || err);
  }

  // Graceful fallback: return data URL
  if (typeof fileOrDataUrl === 'string') {
    return { url: fileOrDataUrl, isCloudStorage: false };
  }
  const fallbackDataUrl = await fileToDataUrl(fileOrDataUrl);
  return { url: fallbackDataUrl, isCloudStorage: false };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
