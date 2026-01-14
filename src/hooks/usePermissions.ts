import { useOrganization } from '@/contexts/OrganizationContext';

export type Permission =
  | 'organization:manage'
  | 'organization:billing'
  | 'members:invite'
  | 'members:remove'
  | 'members:manage_roles'
  | 'invoices:read'
  | 'invoices:create'
  | 'invoices:edit'
  | 'invoices:delete'
  | 'contracts:read'
  | 'contracts:create'
  | 'contracts:edit'
  | 'contracts:delete'
  | 'accounting:read'
  | 'accounting:create'
  | 'accounting:edit'
  | 'leads:read'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:delete'
  | 'employees:read'
  | 'employees:create'
  | 'employees:edit'
  | 'employees:delete'
  | 'payroll:read'
  | 'payroll:manage'
  | 'wiki:read'
  | 'wiki:edit'
  | 'reports:read'
  | 'settings:read'
  | 'settings:edit'
  | 'audit_log:read';

type Role = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    'organization:manage',
    'organization:billing',
    'members:invite',
    'members:remove',
    'members:manage_roles',
    'invoices:read',
    'invoices:create',
    'invoices:edit',
    'invoices:delete',
    'contracts:read',
    'contracts:create',
    'contracts:edit',
    'contracts:delete',
    'accounting:read',
    'accounting:create',
    'accounting:edit',
    'leads:read',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'employees:read',
    'employees:create',
    'employees:edit',
    'employees:delete',
    'payroll:read',
    'payroll:manage',
    'wiki:read',
    'wiki:edit',
    'reports:read',
    'settings:read',
    'settings:edit',
    'audit_log:read',
  ],
  admin: [
    'organization:manage',
    'members:invite',
    'members:remove',
    'members:manage_roles',
    'invoices:read',
    'invoices:create',
    'invoices:edit',
    'invoices:delete',
    'contracts:read',
    'contracts:create',
    'contracts:edit',
    'contracts:delete',
    'accounting:read',
    'accounting:create',
    'accounting:edit',
    'leads:read',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'employees:read',
    'employees:create',
    'employees:edit',
    'employees:delete',
    'payroll:read',
    'payroll:manage',
    'wiki:read',
    'wiki:edit',
    'reports:read',
    'settings:read',
    'settings:edit',
    'audit_log:read',
  ],
  manager: [
    'members:invite',
    'invoices:read',
    'invoices:create',
    'invoices:edit',
    'contracts:read',
    'contracts:create',
    'contracts:edit',
    'accounting:read',
    'accounting:create',
    'leads:read',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'employees:read',
    'employees:create',
    'employees:edit',
    'wiki:read',
    'wiki:edit',
    'reports:read',
    'settings:read',
  ],
  member: [
    'invoices:read',
    'invoices:create',
    'contracts:read',
    'accounting:read',
    'leads:read',
    'leads:create',
    'leads:edit',
    'employees:read',
    'wiki:read',
    'wiki:edit',
    'reports:read',
  ],
  viewer: [
    'invoices:read',
    'contracts:read',
    'accounting:read',
    'leads:read',
    'employees:read',
    'wiki:read',
    'reports:read',
  ],
};

export function usePermissions() {
  const { membership, organization } = useOrganization();

  const role = membership?.role || 'viewer';
  const permissions = rolePermissions[role] || [];

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(p => permissions.includes(p));
  };

  const isOwner = role === 'owner';
  const isAdmin = role === 'owner' || role === 'admin';
  const isManager = isAdmin || role === 'manager';
  const canEdit = isManager || role === 'member';

  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    isAdmin,
    isManager,
    canEdit,
    organization,
    membership,
  };
}
