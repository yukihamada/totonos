import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';
import { toast } from 'sonner';

export interface EmailVerificationRequest {
  id: string;
  company_id: string;
  inbound_email_id: string | null;
  from_email: string;
  from_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function useEmailVerificationRequests() {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['email-verification-requests', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      const { data, error } = await supabase
        .from('email_verification_requests')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailVerificationRequest[];
    },
    enabled: !!currentCompany?.id,
  });
}

export function usePendingVerificationCount() {
  const { data: requests = [] } = useEmailVerificationRequests();
  return requests.filter(r => r.status === 'pending').length;
}

export function useApproveEmailVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      // Get the request first
      const { data: request, error: fetchError } = await supabase
        .from('email_verification_requests')
        .select('*, companies(verified_email_addresses)')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) throw new Error('リクエストが見つかりません');

      // Update the request
      const { error: updateError } = await supabase
        .from('email_verification_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add email to verified list
      const currentVerified = (request.companies as any)?.verified_email_addresses || [];
      if (!currentVerified.includes(request.from_email)) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            verified_email_addresses: [...currentVerified, request.from_email],
          })
          .eq('id', request.company_id);

        if (companyError) throw companyError;
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['current-company'] });
      toast.success('メールアドレスを承認しました');
    },
    onError: (error: Error) => {
      toast.error('承認に失敗しました', { description: error.message });
    },
  });
}

export function useRejectEmailVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const { error } = await supabase
        .from('email_verification_requests')
        .update({
          status: 'rejected',
          rejected_reason: reason || null,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-verification-requests'] });
      toast.success('リクエストを拒否しました');
    },
    onError: (error: Error) => {
      toast.error('拒否に失敗しました', { description: error.message });
    },
  });
}
