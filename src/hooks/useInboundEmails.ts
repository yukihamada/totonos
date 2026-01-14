import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';
import { toast } from 'sonner';

export interface InboundEmail {
  id: string;
  company_id: string | null;
  message_id: string | null;
  from_email: string;
  from_name: string | null;
  to_email: string;
  cc_emails: string[] | null;
  reply_to: string | null;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  attachments: Array<{
    filename: string;
    type: string;
    size: number;
  }>;
  status: 'received' | 'processed' | 'failed' | 'archived';
  processed_at: string | null;
  related_type: string | null;
  related_id: string | null;
  assigned_to: string | null;
  tags: string[];
  is_read: boolean;
  is_starred: boolean;
  is_spam: boolean;
  received_at: string;
  created_at: string;
}

export function useInboundEmails(options?: { status?: string; isRead?: boolean; isStarred?: boolean }) {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['inbound-emails', currentCompany?.id, options],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      let query = supabase
        .from('inbound_emails')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('received_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.isRead !== undefined) {
        query = query.eq('is_read', options.isRead);
      }
      if (options?.isStarred !== undefined) {
        query = query.eq('is_starred', options.isStarred);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InboundEmail[];
    },
    enabled: !!currentCompany?.id,
  });
}

export function useInboundEmail(id: string) {
  return useQuery({
    queryKey: ['inbound-email', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inbound_emails')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as InboundEmail;
    },
    enabled: !!id,
  });
}

export function useMarkEmailAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { error } = await supabase
        .from('inbound_emails')
        .update({ is_read: isRead })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
    },
  });
}

export function useToggleEmailStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      const { error } = await supabase
        .from('inbound_emails')
        .update({ is_starred: isStarred })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
    },
  });
}

export function useArchiveEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inbound_emails')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
      toast.success('メールをアーカイブしました');
    },
    onError: (error) => {
      toast.error('アーカイブに失敗しました', { description: error.message });
    },
  });
}

export function useMarkAsSpam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isSpam }: { id: string; isSpam: boolean }) => {
      const { error } = await supabase
        .from('inbound_emails')
        .update({ is_spam: isSpam })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { isSpam }) => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
      toast.success(isSpam ? 'スパムとしてマークしました' : 'スパムを解除しました');
    },
  });
}

export function useUnreadCount() {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['inbound-emails-unread-count', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return 0;

      const { count, error } = await supabase
        .from('inbound_emails')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', currentCompany.id)
        .eq('is_read', false)
        .eq('is_spam', false)
        .neq('status', 'archived');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!currentCompany?.id,
    refetchInterval: 30000, // 30秒ごとに更新
  });
}
