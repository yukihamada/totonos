import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentCompany } from '@/hooks/useCompany';
import { toast } from 'sonner';

export interface Automation {
  id: string;
  company_id: string;
  user_id: string;
  name: string;
  description: string | null;
  trigger_type: 'schedule' | 'event';
  schedule_cron: string | null;
  schedule_description: string | null;
  event_type: string | null;
  action_type: string;
  action_config: Record<string, unknown>;
  client_id: string | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
}

export function useAutomations() {
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ['automations', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from('ai_automations')
        .select(`
          *,
          clients(name)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Automation[];
    },
    enabled: !!user && !!company?.id,
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('ai_automations')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success(is_active ? '自動化を有効にしました' : '自動化を無効にしました');
    },
    onError: (error) => {
      toast.error('更新に失敗しました: ' + (error as Error).message);
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_automations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('自動化を削除しました');
    },
    onError: (error) => {
      toast.error('削除に失敗しました: ' + (error as Error).message);
    },
  });
}

// Action type labels for display
export const ACTION_TYPE_LABELS: Record<string, { label: string; description: string }> = {
  create_invoice: { label: '請求書作成', description: '請求書を自動生成' },
  create_contract: { label: '契約書作成', description: '契約書を自動生成' },
  send_email: { label: 'メール送信', description: 'メールを自動送信' },
  create_lead: { label: 'リード作成', description: '新規リードを登録' },
  create_expense: { label: '経費登録', description: '経費を自動登録' },
  custom: { label: 'カスタム', description: 'カスタムアクション' },
};
