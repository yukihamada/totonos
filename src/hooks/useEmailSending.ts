import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SendEmailParams {
  type: 'invoice' | 'reminder' | 'payment_confirmation';
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  customMessage?: string;
}

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendEmailParams) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      
      const messages = {
        invoice: '請求書をメールで送信しました',
        reminder: 'リマインダーを送信しました',
        payment_confirmation: '入金確認メールを送信しました',
      };
      toast.success(messages[variables.type]);
    },
    onError: (error: Error) => {
      toast.error('メール送信に失敗しました: ' + error.message);
    },
  });
}

export function useEmailLogs(invoiceId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['email-logs', invoiceId],
    queryFn: async () => {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false });

      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
