import type { Database } from "@/integrations/supabase/types";

// 基本型をDBから取得
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
export type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

export type CompanyMember = Database["public"]["Tables"]["company_members"]["Row"];
export type CompanyCredits = Database["public"]["Tables"]["company_credits"]["Row"];
export type UserCredits = Database["public"]["Tables"]["user_credits"]["Row"];
export type CreditTransaction = Database["public"]["Tables"]["credit_transactions"]["Row"];
export type CompanyInvitation = Database["public"]["Tables"]["company_invitations"]["Row"];
export type MemberPermission = Database["public"]["Tables"]["member_permissions"]["Row"];

// Enums
export type PermissionType = Database["public"]["Enums"]["permission_type"];
export type MemberRole = Database["public"]["Enums"]["member_role"];
export type InvitationStatus = Database["public"]["Enums"]["invitation_status"];

// 拡張型
export interface CompanyMemberWithUser extends CompanyMember {
  user?: {
    email: string;
  };
  permissions?: MemberPermission[];
}

export interface CompanyWithCredits extends Company {
  company_credits?: CompanyCredits;
}

// 権限グループ定義
export const PERMISSION_GROUPS = {
  invoices: {
    label: "請求書",
    permissions: ["invoices_view", "invoices_create", "invoices_edit", "invoices_delete"] as PermissionType[],
  },
  contracts: {
    label: "契約書",
    permissions: ["contracts_view", "contracts_create", "contracts_edit", "contracts_delete", "contracts_sign"] as PermissionType[],
  },
  crm: {
    label: "CRM",
    permissions: ["crm_view", "crm_create", "crm_edit", "crm_delete"] as PermissionType[],
  },
  hr: {
    label: "人事労務",
    permissions: ["hr_view", "hr_create", "hr_edit", "hr_delete", "hr_payroll"] as PermissionType[],
  },
  accounting: {
    label: "会計",
    permissions: ["accounting_view", "accounting_create", "accounting_edit", "accounting_delete"] as PermissionType[],
  },
  wiki: {
    label: "Wiki",
    permissions: ["wiki_view", "wiki_create", "wiki_edit", "wiki_delete"] as PermissionType[],
  },
  it_assets: {
    label: "IT資産",
    permissions: ["it_assets_view", "it_assets_create", "it_assets_edit", "it_assets_delete"] as PermissionType[],
  },
  settings: {
    label: "設定",
    permissions: ["settings_view", "settings_edit"] as PermissionType[],
  },
  team: {
    label: "チーム",
    permissions: ["team_view", "team_invite", "team_edit", "team_remove"] as PermissionType[],
  },
  credits: {
    label: "クレジット",
    permissions: ["credits_view", "credits_purchase", "credits_manage"] as PermissionType[],
  },
} as const;

export const PERMISSION_LABELS: Record<PermissionType, string> = {
  invoices_view: "閲覧",
  invoices_create: "作成",
  invoices_edit: "編集",
  invoices_delete: "削除",
  contracts_view: "閲覧",
  contracts_create: "作成",
  contracts_edit: "編集",
  contracts_delete: "削除",
  contracts_sign: "署名",
  crm_view: "閲覧",
  crm_create: "作成",
  crm_edit: "編集",
  crm_delete: "削除",
  hr_view: "閲覧",
  hr_create: "作成",
  hr_edit: "編集",
  hr_delete: "削除",
  hr_payroll: "給与管理",
  accounting_view: "閲覧",
  accounting_create: "作成",
  accounting_edit: "編集",
  accounting_delete: "削除",
  wiki_view: "閲覧",
  wiki_create: "作成",
  wiki_edit: "編集",
  wiki_delete: "削除",
  it_assets_view: "閲覧",
  it_assets_create: "作成",
  it_assets_edit: "編集",
  it_assets_delete: "削除",
  settings_view: "閲覧",
  settings_edit: "編集",
  team_view: "閲覧",
  team_invite: "招待",
  team_edit: "編集",
  team_remove: "削除",
  credits_view: "閲覧",
  credits_purchase: "購入",
  credits_manage: "管理",
  admin: "管理者",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "オーナー",
  admin: "管理者",
  member: "メンバー",
  viewer: "閲覧者",
};
