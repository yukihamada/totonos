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
  }> | null;
  status: string;
  related_type: string | null;
  related_id: string | null;
  assigned_to: string | null;
  tags: string[] | null;
  is_read: boolean;
  is_starred: boolean;
  is_spam: boolean;
  is_archived: boolean;
  // AI analysis fields
  ai_summary: string | null;
  ai_category: string | null;
  ai_urgency: string | null;
  ai_sentiment: string | null;
  ai_extracted_deadline: string | null;
  email_address_id: string | null;
  auto_created_entity_type: string | null;
  auto_created_entity_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useInboundEmails(options?: { status?: string; isRead?: boolean; isStarred?: boolean; isSpam?: boolean; isArchived?: boolean }) {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['inbound-emails', currentCompany?.id, options],
    queryFn: async (): Promise<InboundEmail[]> => {
      if (!currentCompany?.id) return [];

      let query = supabase
        .from('inbound_emails')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (options?.isRead !== undefined) {
        query = query.eq('is_read', options.isRead);
      }
      if (options?.isStarred !== undefined) {
        query = query.eq('is_starred', options.isStarred);
      }
      if (options?.isSpam !== undefined) {
        query = query.eq('is_spam', options.isSpam);
      }
      if (options?.isArchived !== undefined) {
        query = query.eq('is_archived', options.isArchived);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as InboundEmail[];
    },
    enabled: !!currentCompany?.id,
  });
}

export function useInboundEmail(id: string) {
  return useQuery({
    queryKey: ['inbound-email', id],
    queryFn: async (): Promise<InboundEmail | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('inbound_emails')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as InboundEmail;
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
      queryClient.invalidateQueries({ queryKey: ['inbound-emails-unread-count'] });
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
        .update({ is_archived: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
      toast.success('メールをアーカイブしました');
    },
    onError: (error: Error) => {
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
    onSuccess: (_: void, { isSpam }: { id: string; isSpam: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
      toast.success(isSpam ? 'スパムとしてマークしました' : 'スパムを解除しました');
    },
  });
}

export function useUnreadCount() {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['inbound-emails-unread-count', currentCompany?.id],
    queryFn: async (): Promise<number> => {
      if (!currentCompany?.id) return 0;

      const { count, error } = await supabase
        .from('inbound_emails')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', currentCompany.id)
        .eq('is_read', false)
        .eq('is_archived', false)
        .eq('is_spam', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!currentCompany?.id,
    refetchInterval: 30000,
  });
}
