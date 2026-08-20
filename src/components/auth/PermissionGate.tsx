import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { PermissionKey } from '../../types';

interface PermissionGateProps {
  permission: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission } = usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll
    ? permissions.every(p => hasPermission(p))
    : permissions.some(p => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
