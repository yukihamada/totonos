import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';
import { toast } from 'sonner';

export type EmailPurpose = 'lead_capture' | 'support' | 'invoice' | 'contract' | 'recruit' | 'general';
export type NotifyMode = 'assigned_only' | 'all_members' | 'admins_only';

export interface CompanyEmailAddress {
  id: string;
  company_id: string;
  address_prefix: string;
  purpose: EmailPurpose;
  display_name: string | null;
  is_active: boolean;
  auto_create_entity: boolean;
  ai_processing_enabled: boolean;
  assigned_to: string | null;
  notify_mode: NotifyMode;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailAddressInput {
  address_prefix: string;
  purpose: EmailPurpose;
  display_name?: string;
  is_active?: boolean;
  auto_create_entity?: boolean;
  ai_processing_enabled?: boolean;
  assigned_to?: string;
  notify_mode?: NotifyMode;
  webhook_url?: string;
}

export interface UpdateEmailAddressInput {
  id: string;
  address_prefix?: string;
  purpose?: EmailPurpose;
  display_name?: string;
  is_active?: boolean;
  auto_create_entity?: boolean;
  ai_processing_enabled?: boolean;
  assigned_to?: string | null;
  notify_mode?: NotifyMode;
  webhook_url?: string;
}

export function useCompanyEmailAddresses() {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['company-email-addresses', currentCompany?.id],
    queryFn: async (): Promise<CompanyEmailAddress[]> => {
      if (!currentCompany?.id) return [];

      const { data, error } = await supabase
        .from('company_email_addresses')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as CompanyEmailAddress[];
    },
    enabled: !!currentCompany?.id,
  });
}

export function useCreateEmailAddress() {
  const queryClient = useQueryClient();
  const { data: currentCompany } = useCurrentCompany();

  return useMutation({
    mutationFn: async (input: CreateEmailAddressInput) => {
      if (!currentCompany?.id) throw new Error('会社が選択されていません');

      const { data, error } = await supabase
        .from('company_email_addresses')
        .insert({
          company_id: currentCompany.id,
          address_prefix: input.address_prefix,
          purpose: input.purpose,
          display_name: input.display_name,
          is_active: input.is_active ?? true,
          auto_create_entity: input.auto_create_entity ?? false,
          ai_processing_enabled: input.ai_processing_enabled ?? true,
          assigned_to: input.assigned_to,
          notify_mode: input.notify_mode ?? 'assigned_only',
          webhook_url: input.webhook_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-email-addresses'] });
      toast.success('メールアドレスを作成しました');
    },
    onError: (error: Error) => {
      toast.error('メールアドレスの作成に失敗しました', { description: error.message });
    },
  });
}

export function useUpdateEmailAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateEmailAddressInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('company_email_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-email-addresses'] });
      toast.success('メールアドレスを更新しました');
    },
    onError: (error: Error) => {
      toast.error('メールアドレスの更新に失敗しました', { description: error.message });
    },
  });
}

export function useDeleteEmailAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_email_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-email-addresses'] });
      toast.success('メールアドレスを削除しました');
    },
    onError: (error: Error) => {
      toast.error('メールアドレスの削除に失敗しました', { description: error.message });
    },
  });
}

// ヘルパー: 用途ごとのラベル
export const EMAIL_PURPOSE_LABELS: Record<EmailPurpose, { label: string; description: string; icon: string }> = {
  lead_capture: { label: 'リード獲得', description: 'lead@で新規リードを自動登録', icon: 'UserPlus' },
  support: { label: 'サポート', description: 'support@でサポートチケット管理', icon: 'HelpCircle' },
  invoice: { label: '請求書', description: 'invoice@で請求書・領収書を受信', icon: 'Receipt' },
  contract: { label: '契約', description: 'contract@で契約関連の連絡', icon: 'FileText' },
  recruit: { label: '採用', description: 'recruit@で採用応募を受付', icon: 'Users' },
  general: { label: '一般', description: '汎用的な連絡用', icon: 'Mail' },
};

// ヘルパー: 通知モードごとのラベル
export const NOTIFY_MODE_LABELS: Record<NotifyMode, { label: string; description: string }> = {
  assigned_only: { label: '担当者のみ', description: '設定された担当者にのみ通知' },
  admins_only: { label: '管理者全員', description: '会社の管理者全員に通知' },
  all_members: { label: 'メンバー全員', description: '会社のメンバー全員に通知' },
};
