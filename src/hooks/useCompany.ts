import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type {
  Company,
  CompanyInsert,
  CompanyMember,
  CompanyInvitation,
  MemberRole,
  PermissionType,
  CompanyMemberWithUser,
} from "@/types/company";

// 現在の会社を取得
export function useCurrentCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-company", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: currentCompany, error: currentError } = await supabase
        .from("user_current_company")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (currentError) throw currentError;

      if (currentCompany?.company_id) {
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("*, company_credits(*)")
          .eq("id", currentCompany.company_id)
          .single();

        if (companyError) throw companyError;
        return company;
      }

      return null;
    },
    enabled: !!user,
  });
}

// ユーザーが所属する全会社を取得
export function useUserCompanies() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-companies", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: memberships, error } = await supabase
        .from("company_members")
        .select(`
          company_id,
          role,
          companies (
            id,
            name,
            display_name,
            logo_url
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      return memberships;
    },
    enabled: !!user,
  });
}

// 会社を切り替える
export function useSwitchCompany() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyId: string) => {
      if (!user) throw new Error("認証が必要です");

      const { error } = await supabase
        .from("user_current_company")
        .upsert(
          { user_id: user.id, company_id: companyId, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-company"] });
      toast.success("会社を切り替えました");
    },
    onError: (error) => {
      toast.error("会社の切り替えに失敗しました", { description: error.message });
    },
  });
}

// 会社を作成
export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<CompanyInsert, "created_by">) => {
      if (!user) throw new Error("認証が必要です");

      const { data: company, error } = await supabase
        .from("companies")
        .insert({ ...data, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
      queryClient.invalidateQueries({ queryKey: ["current-company"] });
      toast.success("会社を登録しました");
    },
    onError: (error) => {
      toast.error("会社の登録に失敗しました", { description: error.message });
    },
  });
}

// 会社を更新
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Company>) => {
      const { error } = await supabase.from("companies").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
      queryClient.invalidateQueries({ queryKey: ["current-company"] });
      toast.success("会社情報を更新しました");
    },
    onError: (error) => {
      toast.error("会社情報の更新に失敗しました", { description: error.message });
    },
  });
}

// 会社メンバーを取得
export function useCompanyMembers(companyId?: string) {
  return useQuery({
    queryKey: ["company-members", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from("company_members")
        .select(`
          *,
          member_permissions (*)
        `)
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (error) throw error;

      // Get user emails through a separate query since we can't join auth.users
      const userIds = data.map((m) => m.user_id);
      const membersWithEmail: CompanyMemberWithUser[] = data.map((member) => ({
        ...member,
        permissions: member.member_permissions,
      }));

      return membersWithEmail;
    },
    enabled: !!companyId,
  });
}

// メンバーの役割を更新
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: MemberRole;
    }) => {
      const { error } = await supabase
        .from("company_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      toast.success("役割を更新しました");
    },
    onError: (error) => {
      toast.error("役割の更新に失敗しました", { description: error.message });
    },
  });
}

// メンバーの権限を更新
export function useUpdateMemberPermissions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      memberId,
      permissions,
    }: {
      memberId: string;
      permissions: PermissionType[];
    }) => {
      if (!user) throw new Error("認証が必要です");

      // 既存の権限を削除
      await supabase.from("member_permissions").delete().eq("member_id", memberId);

      // 新しい権限を追加
      if (permissions.length > 0) {
        const { error } = await supabase.from("member_permissions").insert(
          permissions.map((permission) => ({
            member_id: memberId,
            permission,
            granted_by: user.id,
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      toast.success("権限を更新しました");
    },
    onError: (error) => {
      toast.error("権限の更新に失敗しました", { description: error.message });
    },
  });
}

// メンバーを削除 (非アクティブ化)
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("company_members")
        .update({ is_active: false })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      toast.success("メンバーを削除しました");
    },
    onError: (error) => {
      toast.error("メンバーの削除に失敗しました", { description: error.message });
    },
  });
}

// 招待を作成
export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      companyId,
      email,
      role,
      permissions,
    }: {
      companyId: string;
      email: string;
      role: MemberRole;
      permissions?: PermissionType[];
    }) => {
      if (!user) throw new Error("認証が必要です");

      const { data, error } = await supabase
        .from("company_invitations")
        .insert({
          company_id: companyId,
          email,
          role,
          permissions: permissions || [],
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invitations"] });
      toast.success("招待を送信しました");
    },
    onError: (error) => {
      toast.error("招待の送信に失敗しました", { description: error.message });
    },
  });
}

// 招待一覧を取得
export function useCompanyInvitations(companyId?: string) {
  return useQuery({
    queryKey: ["company-invitations", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from("company_invitations")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
}

// 招待を受諾
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!user) throw new Error("認証が必要です");

      // 招待を取得
      const { data: invitation, error: invError } = await supabase
        .from("company_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (invError || !invitation) throw new Error("無効な招待です");

      // 有効期限チェック
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error("招待の有効期限が切れています");
      }

      // メンバーとして追加
      const { data: member, error: memberError } = await supabase
        .from("company_members")
        .insert({
          company_id: invitation.company_id,
          user_id: user.id,
          role: invitation.role,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // 権限を追加
      if (invitation.permissions && invitation.permissions.length > 0) {
        await supabase.from("member_permissions").insert(
          invitation.permissions.map((permission: PermissionType) => ({
            member_id: member.id,
            permission,
            granted_by: invitation.invited_by,
          }))
        );
      }

      // 招待を更新
      await supabase
        .from("company_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-invitations"] });
      toast.success("招待を受諾しました");
    },
    onError: (error) => {
      toast.error("招待の受諾に失敗しました", { description: error.message });
    },
  });
}

// 招待をキャンセル
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("company_invitations")
        .update({ status: "expired" })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invitations"] });
      toast.success("招待をキャンセルしました");
    },
    onError: (error) => {
      toast.error("招待のキャンセルに失敗しました", { description: error.message });
    },
  });
}
