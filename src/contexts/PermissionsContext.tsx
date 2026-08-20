import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { UserRole, PermissionKey, StaffMember, RolePermissionsConfig } from '../types';
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  hasPermission as checkHasPermission, 
  canAccessRoute as checkCanAccessRoute, 
  getDefaultFallbackRoute 
} from '../lib/permissions';
import { logAuditEvent, handleFirestoreError, OperationType } from '../lib/auditService';

interface PermissionsContextType {
  currentRole: UserRole;
  actualRole: UserRole;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  isSimulating: boolean;
  hasPermission: (permission: PermissionKey) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  customMatrix: Record<string, PermissionKey[]>;
  loading: boolean;
  updateRolePermissions: (role: UserRole, permissions: PermissionKey[]) => Promise<void>;
  resetRoleToDefault: (role: UserRole) => Promise<void>;
  staffList: StaffMember[];
  saveStaffMember: (staff: Partial<StaffMember>) => Promise<string>;
  deleteStaffMember: (staffId: string) => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { store } = useStore();

  const [customMatrix, setCustomMatrix] = useState<Record<string, PermissionKey[]>>({});
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(() => {
    const saved = sessionStorage.getItem('mobistore_simulated_role');
    return saved ? (saved as UserRole) : null;
  });

  const actualRole: UserRole = profile?.role || 'owner';
  const isOwnerOrAdmin = actualRole === 'owner' || actualRole === 'superadmin';
  const currentRole: UserRole = (isOwnerOrAdmin && simulatedRole) ? simulatedRole : actualRole;

  const setSimulatedRole = (role: UserRole | null) => {
    if (role) {
      sessionStorage.setItem('mobistore_simulated_role', role);
    } else {
      sessionStorage.removeItem('mobistore_simulated_role');
    }
    setSimulatedRoleState(role);
  };

  // Subscribe to custom role permissions for this store
  useEffect(() => {
    if (!store?.id) {
      setLoading(false);
      return;
    }

    const permsQuery = query(collection(db, `stores/${store.id}/permissions`));
    const unsubPerms = onSnapshot(permsQuery, (snapshot) => {
      const matrix: Record<string, PermissionKey[]> = {};
      snapshot.docs.forEach(d => {
        const data = d.data() as RolePermissionsConfig;
        if (data.role && Array.isArray(data.permissions)) {
          matrix[data.role] = data.permissions;
        }
      });
      setCustomMatrix(matrix);
    }, (error) => {
      console.warn('Could not fetch custom permissions, using defaults:', error);
    });

    // Subscribe to store staff members roster
    const staffQuery = query(collection(db, `stores/${store.id}/staff`));
    const unsubStaff = onSnapshot(staffQuery, (snapshot) => {
      const staffData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StaffMember));
      setStaffList(staffData);
      setLoading(false);
    }, (error) => {
      console.warn('Could not fetch staff list:', error);
      setLoading(false);
    });

    return () => {
      unsubPerms();
      unsubStaff();
    };
  }, [store?.id]);

  const hasPermission = (permission: PermissionKey): boolean => {
    return checkHasPermission(
      currentRole, 
      permission, 
      customMatrix, 
      profile?.customPermissions
    );
  };

  const canAccessRoute = (routePath: string): boolean => {
    return checkCanAccessRoute(
      currentRole, 
      routePath, 
      customMatrix, 
      profile?.customPermissions
    );
  };

  const updateRolePermissions = async (role: UserRole, permissions: PermissionKey[]) => {
    if (!store?.id) return;
    const path = `stores/${store.id}/permissions/${role}`;
    try {
      await setDoc(doc(db, `stores/${store.id}/permissions`, role), {
        role,
        permissions,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'unknown'
      });

      setCustomMatrix(prev => ({ ...prev, [role]: permissions }));

      await logAuditEvent(store.id, {
        entityType: 'user',
        entityId: role,
        action: 'updated',
        title: `Updated ${role.toUpperCase()} Permissions Matrix`,
        details: `Saved ${permissions.length} granular permission switches for ${role} role.`,
        performedBy: user?.uid,
        performedByName: profile?.displayName || user?.email,
        role: actualRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const resetRoleToDefault = async (role: UserRole) => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
    await updateRolePermissions(role, defaults);
  };

  const saveStaffMember = async (staff: Partial<StaffMember>): Promise<string> => {
    if (!store?.id) throw new Error('Store not loaded');
    const path = `stores/${store.id}/staff`;

    try {
      const now = new Date().toISOString();
      if (staff.id) {
        // Update existing
        const docRef = doc(db, `stores/${store.id}/staff/${staff.id}`);
        await updateDoc(docRef, {
          ...staff,
          updatedAt: now
        });

        await logAuditEvent(store.id, {
          entityType: 'user',
          entityId: staff.id,
          action: 'updated',
          title: `Updated Staff Member "${staff.displayName}"`,
          details: `Role: ${staff.role}, Branch: ${staff.branchName || 'HQ'}`,
          performedBy: user?.uid,
          performedByName: profile?.displayName || user?.email,
          role: actualRole
        });
        return staff.id;
      } else {
        // Create new
        const newStaffRef = doc(collection(db, `stores/${store.id}/staff`));
        const newStaff: StaffMember = {
          id: newStaffRef.id,
          displayName: staff.displayName || 'Staff Member',
          email: staff.email || '',
          phone: staff.phone || '',
          role: staff.role || 'cashier',
          branchId: staff.branchId || profile?.branchId || '',
          branchName: staff.branchName || store.name,
          isActive: staff.isActive !== undefined ? staff.isActive : true,
          customPermissions: staff.customPermissions || [],
          createdAt: now
        };

        await setDoc(newStaffRef, newStaff);

        await logAuditEvent(store.id, {
          entityType: 'user',
          entityId: newStaffRef.id,
          action: 'created',
          title: `Added New Staff Member "${newStaff.displayName}"`,
          details: `Assigned Role: ${newStaff.role.toUpperCase()} (${newStaff.email})`,
          performedBy: user?.uid,
          performedByName: profile?.displayName || user?.email,
          role: actualRole
        });
        return newStaffRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  };

  const deleteStaffMember = async (staffId: string) => {
    if (!store?.id) return;
    const path = `stores/${store.id}/staff/${staffId}`;
    try {
      await updateDoc(doc(db, `stores/${store.id}/staff/${staffId}`), {
        isActive: false,
        deletedAt: new Date().toISOString()
      });

      await logAuditEvent(store.id, {
        entityType: 'user',
        entityId: staffId,
        action: 'deleted',
        title: `Deactivated Staff Member (${staffId})`,
        performedBy: user?.uid,
        performedByName: profile?.displayName || user?.email,
        role: actualRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <PermissionsContext.Provider value={{
      currentRole,
      actualRole,
      simulatedRole,
      setSimulatedRole,
      isSimulating: isOwnerOrAdmin && !!simulatedRole,
      hasPermission,
      canAccessRoute,
      customMatrix,
      loading,
      updateRolePermissions,
      resetRoleToDefault,
      staffList,
      saveStaffMember,
      deleteStaffMember
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
