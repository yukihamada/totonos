import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Permission } from './usePermissions';
import type { Database } from '@/integrations/supabase/types';

// Database permission type (underscore format)
type DbPermissionType = Database['public']['Enums']['permission_type'];

// Convert frontend permission (colon format) to DB format (underscore)
const toDbPermission = (permission: Permission): DbPermissionType => {
  return permission.replace(':', '_') as DbPermissionType;
};

// Convert DB permission (underscore format) to frontend format (colon)
const fromDbPermission = (permission: DbPermissionType): Permission => {
  return permission.replace('_', ':') as Permission;
};

// Preset role permissions mapping
export const rolePermissions: Record<string, Permission[]> = {
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

// DB permission types that actually exist
const dbPermissionTypes: DbPermissionType[] = [
  'invoices_view', 'invoices_create', 'invoices_edit', 'invoices_delete',
  'contracts_view', 'contracts_create', 'contracts_edit', 'contracts_delete', 'contracts_sign',
  'crm_view', 'crm_create', 'crm_edit', 'crm_delete',
  'hr_view', 'hr_create', 'hr_edit', 'hr_delete', 'hr_payroll',
  'accounting_view', 'accounting_create', 'accounting_edit', 'accounting_delete',
  'wiki_view', 'wiki_create', 'wiki_edit', 'wiki_delete',
  'it_assets_view', 'it_assets_create', 'it_assets_edit', 'it_assets_delete',
  'settings_view', 'settings_edit',
  'team_view', 'team_invite', 'team_edit', 'team_remove',
  'credits_view', 'credits_purchase', 'credits_manage',
  'admin',
];

// Map frontend permission to DB permission with validation
const mapToDbPermission = (permission: Permission): DbPermissionType | null => {
  const mapped = permission.replace(':', '_');
  // Map frontend naming to DB naming
  const mappings: Record<string, string> = {
    'invoices_read': 'invoices_view',
    'contracts_read': 'contracts_view',
    'accounting_read': 'accounting_view',
    'leads_read': 'crm_view',
    'leads_create': 'crm_create',
    'leads_edit': 'crm_edit',
    'leads_delete': 'crm_delete',
    'employees_read': 'hr_view',
    'employees_create': 'hr_create',
    'employees_edit': 'hr_edit',
    'employees_delete': 'hr_delete',
    'payroll_read': 'hr_view',
    'payroll_manage': 'hr_payroll',
    'wiki_read': 'wiki_view',
    'settings_read': 'settings_view',
    'members_invite': 'team_invite',
    'members_remove': 'team_remove',
    'members_manage_roles': 'team_edit',
    'organization_manage': 'admin',
    'organization_billing': 'credits_manage',
    'reports_read': 'accounting_view',
    'audit_log_read': 'admin',
  };
  
  const dbPerm = mappings[mapped] || mapped;
  if (dbPermissionTypes.includes(dbPerm as DbPermissionType)) {
    return dbPerm as DbPermissionType;
  }
  return null;
};

// Permission categories for UI grouping
export const permissionCategories = [
  {
    id: 'organization',
    label: '組織管理',
    permissions: ['organization:manage', 'organization:billing'],
  },
  {
    id: 'members',
    label: 'メンバー管理',
    permissions: ['members:invite', 'members:remove', 'members:manage_roles'],
  },
  {
    id: 'invoices',
    label: '請求書',
    permissions: ['invoices:read', 'invoices:create', 'invoices:edit', 'invoices:delete'],
  },
  {
    id: 'contracts',
    label: '契約',
    permissions: ['contracts:read', 'contracts:create', 'contracts:edit', 'contracts:delete'],
  },
  {
    id: 'accounting',
    label: '会計',
    permissions: ['accounting:read', 'accounting:create', 'accounting:edit'],
  },
  {
    id: 'leads',
    label: 'リード・商談',
    permissions: ['leads:read', 'leads:create', 'leads:edit', 'leads:delete'],
  },
  {
    id: 'employees',
    label: '従業員',
    permissions: ['employees:read', 'employees:create', 'employees:edit', 'employees:delete'],
  },
  {
    id: 'payroll',
    label: '給与',
    permissions: ['payroll:read', 'payroll:manage'],
  },
  {
    id: 'wiki',
    label: 'Wiki',
    permissions: ['wiki:read', 'wiki:edit'],
  },
  {
    id: 'other',
    label: 'その他',
    permissions: ['reports:read', 'settings:read', 'settings:edit', 'audit_log:read'],
  },
];

// Permission action labels
export const permissionActionLabels: Record<string, string> = {
  read: '閲覧',
  create: '作成',
  edit: '編集',
  delete: '削除',
  manage: '管理',
  invite: '招待',
  remove: '削除',
  manage_roles: '役割管理',
  billing: '請求管理',
};

// Get permissions for a company member
export function useMemberPermissions(memberId: string | undefined) {
  return useQuery({
    queryKey: ['member-permissions', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      
      const { data, error } = await supabase
        .from('member_permissions')
        .select('*')
        .eq('member_id', memberId);

      if (error) throw error;
      
      // Convert DB permissions to frontend format
      return data?.map(p => {
        const dbPerm = p.permission as string;
        // Reverse mapping
        const reverseMappings: Record<string, string> = {
          'invoices_view': 'invoices:read',
          'invoices_create': 'invoices:create',
          'invoices_edit': 'invoices:edit',
          'invoices_delete': 'invoices:delete',
          'contracts_view': 'contracts:read',
          'contracts_create': 'contracts:create',
          'contracts_edit': 'contracts:edit',
          'contracts_delete': 'contracts:delete',
          'crm_view': 'leads:read',
          'crm_create': 'leads:create',
          'crm_edit': 'leads:edit',
          'crm_delete': 'leads:delete',
          'hr_view': 'employees:read',
          'hr_create': 'employees:create',
          'hr_edit': 'employees:edit',
          'hr_delete': 'employees:delete',
          'hr_payroll': 'payroll:manage',
          'accounting_view': 'accounting:read',
          'accounting_create': 'accounting:create',
          'accounting_edit': 'accounting:edit',
          'accounting_delete': 'accounting:edit',
          'wiki_view': 'wiki:read',
          'wiki_create': 'wiki:edit',
          'wiki_edit': 'wiki:edit',
          'wiki_delete': 'wiki:edit',
          'settings_view': 'settings:read',
          'settings_edit': 'settings:edit',
          'team_invite': 'members:invite',
          'team_edit': 'members:manage_roles',
          'team_remove': 'members:remove',
          'admin': 'organization:manage',
          'credits_manage': 'organization:billing',
        };
        return (reverseMappings[dbPerm] || dbPerm.replace('_', ':')) as Permission;
      }) || [];
    },
    enabled: !!memberId,
  });
}

// Set permissions for a member (replaces all existing permissions)
export function useSetMemberPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      memberId, 
      permissions 
    }: { 
      memberId: string; 
      permissions: Permission[];
    }) => {
      // Delete existing permissions
      await supabase
        .from('member_permissions')
        .delete()
        .eq('member_id', memberId);

      // Convert and filter valid permissions
      const dbPermissions = permissions
        .map(p => mapToDbPermission(p))
        .filter((p): p is DbPermissionType => p !== null);

      // Remove duplicates
      const uniquePermissions = [...new Set(dbPermissions)];

      // Insert new permissions
      if (uniquePermissions.length > 0) {
        const { error } = await supabase
          .from('member_permissions')
          .insert(
            uniquePermissions.map(permission => ({
              member_id: memberId,
              permission,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-permissions', variables.memberId] });
      toast.success('権限を更新しました');
    },
    onError: (error) => {
      console.error('Failed to update permissions:', error);
      toast.error('権限の更新に失敗しました');
    },
  });
}

// Apply preset role permissions
export function useApplyPresetRole() {
  const setPermissions = useSetMemberPermissions();

  return useMutation({
    mutationFn: async ({ 
      memberId, 
      role 
    }: { 
      memberId: string; 
      role: string;
    }) => {
      const permissions = rolePermissions[role] || [];
      return setPermissions.mutateAsync({ memberId, permissions });
    },
  });
}
