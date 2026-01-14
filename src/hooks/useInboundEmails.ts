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

// Note: This hook requires the inbound_emails table to be created
// The table doesn't exist yet, so returning empty data for now
export function useInboundEmails(_options?: { status?: string; isRead?: boolean; isStarred?: boolean }) {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['inbound-emails', currentCompany?.id, _options],
    queryFn: async (): Promise<InboundEmail[]> => {
      // Table doesn't exist yet - return empty array
      return [];
    },
    enabled: !!currentCompany?.id,
  });
}

export function useInboundEmail(_id: string) {
  return useQuery({
    queryKey: ['inbound-email', _id],
    queryFn: async (): Promise<InboundEmail | null> => {
      // Table doesn't exist yet
      return null;
    },
    enabled: !!_id,
  });
}

export function useMarkEmailAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: { id: string; isRead: boolean }) => {
      // Table doesn't exist yet
      console.warn('inbound_emails table not yet created');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
    },
  });
}

export function useToggleEmailStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: { id: string; isStarred: boolean }) => {
      // Table doesn't exist yet
      console.warn('inbound_emails table not yet created');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-emails'] });
    },
  });
}

export function useArchiveEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string) => {
      // Table doesn't exist yet
      console.warn('inbound_emails table not yet created');
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
    mutationFn: async (_params: { id: string; isSpam: boolean }) => {
      // Table doesn't exist yet
      console.warn('inbound_emails table not yet created');
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
      // Table doesn't exist yet
      return 0;
    },
    enabled: !!currentCompany?.id,
    refetchInterval: 30000,
  });
}
