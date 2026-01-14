import { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component version
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: Permission,
  FallbackComponent?: React.ComponentType<P>
) {
  return function PermissionWrappedComponent(props: P) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}
