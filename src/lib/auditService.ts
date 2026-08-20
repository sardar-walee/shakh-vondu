import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { AuditLog } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function logAuditEvent(
  storeId: string,
  event: {
    entityType: AuditLog['entityType'];
    entityId: string;
    action: AuditLog['action'];
    title: string;
    details?: string;
    performedBy?: string;
    performedByName?: string;
    role?: string;
    changes?: Record<string, { old: any; new: any }>;
  }
): Promise<string | null> {
  if (!storeId) return null;

  try {
    const path = `stores/${storeId}/audit_logs`;
    const docRef = await addDoc(collection(db, path), {
      ...event,
      performedBy: event.performedBy || auth.currentUser?.uid || 'system',
      performedByName: event.performedByName || auth.currentUser?.displayName || auth.currentUser?.email || 'Store User',
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
}
