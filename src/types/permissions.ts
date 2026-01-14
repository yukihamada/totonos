// Permission modules and actions
export const PERMISSION_MODULES = [
  'leads',
  'deals',
  'clients',
  'invoices',
  'estimates',
  'contracts',
  'employees',
  'attendance',
  'payroll',
  'accounting',
  'wiki',
  'projects',
  'recruiting',
  'expenses',
  'settings',
  'team',
  'reports',
] as const;

export type PermissionModule = typeof PERMISSION_MODULES[number];

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'export',
  'approve',
] as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[number];

export type Permission = `${PermissionModule}:${PermissionAction}`;

// Role definitions
export interface RolePermissions {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
}

// Default roles
export const DEFAULT_ROLES: RolePermissions[] = [
  {
    id: 'owner',
    name: 'オーナー',
    description: '全ての機能にアクセス可能',
    isSystem: true,
    permissions: PERMISSION_MODULES.flatMap((module) =>
      PERMISSION_ACTIONS.map((action) => `${module}:${action}` as Permission)
    ),
  },
  {
    id: 'admin',
    name: '管理者',
    description: '設定以外の全ての機能にアクセス可能',
    isSystem: true,
    permissions: PERMISSION_MODULES.filter((m) => m !== 'settings').flatMap((module) =>
      PERMISSION_ACTIONS.map((action) => `${module}:${action}` as Permission)
    ),
  },
  {
    id: 'manager',
    name: 'マネージャー',
    description: 'チームの管理と承認が可能',
    isSystem: true,
    permissions: [
      // CRM
      'leads:view', 'leads:create', 'leads:edit',
      'deals:view', 'deals:create', 'deals:edit', 'deals:approve',
      'clients:view', 'clients:create', 'clients:edit',
      // Sales
      'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:approve',
      'estimates:view', 'estimates:create', 'estimates:edit', 'estimates:approve',
      'contracts:view', 'contracts:create', 'contracts:edit', 'contracts:approve',
      // HR
      'employees:view',
      'attendance:view', 'attendance:approve',
      'payroll:view',
      // Other
      'wiki:view', 'wiki:create', 'wiki:edit',
      'projects:view', 'projects:create', 'projects:edit',
      'reports:view', 'reports:export',
      'team:view',
    ],
  },
  {
    id: 'member',
    name: 'メンバー',
    description: '基本的な閲覧と作成が可能',
    isSystem: true,
    permissions: [
      // CRM
      'leads:view', 'leads:create', 'leads:edit',
      'deals:view', 'deals:create',
      'clients:view', 'clients:create',
      // Sales
      'invoices:view',
      'estimates:view', 'estimates:create',
      'contracts:view',
      // HR (self only)
      'attendance:view', 'attendance:create',
      // Other
      'wiki:view', 'wiki:create',
      'projects:view',
      'reports:view',
    ],
  },
  {
    id: 'viewer',
    name: '閲覧者',
    description: '閲覧のみ可能',
    isSystem: true,
    permissions: PERMISSION_MODULES.map((module) => `${module}:view` as Permission),
  },
];

// Permission labels for UI
export const MODULE_LABELS: Record<PermissionModule, string> = {
  leads: 'リード',
  deals: '商談',
  clients: '取引先',
  invoices: '請求書',
  estimates: '見積書',
  contracts: '契約',
  employees: '従業員',
  attendance: '勤怠',
  payroll: '給与',
  accounting: '会計',
  wiki: 'Wiki',
  projects: 'プロジェクト',
  recruiting: '採用',
  expenses: '経費',
  settings: '設定',
  team: 'チーム',
  reports: 'レポート',
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: '閲覧',
  create: '作成',
  edit: '編集',
  delete: '削除',
  export: 'エクスポート',
  approve: '承認',
};

// Helper functions
export function hasPermission(
  userPermissions: Permission[],
  module: PermissionModule,
  action: PermissionAction
): boolean {
  return userPermissions.includes(`${module}:${action}`);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  module: PermissionModule
): boolean {
  return userPermissions.some((p) => p.startsWith(`${module}:`));
}

export function getModulePermissions(
  permissions: Permission[],
  module: PermissionModule
): PermissionAction[] {
  return permissions
    .filter((p) => p.startsWith(`${module}:`))
    .map((p) => p.split(':')[1] as PermissionAction);
}
