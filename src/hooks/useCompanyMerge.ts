import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CompanyMergeRequest {
  id: string;
  source_company_id: string;
  target_company_id: string;
  requested_by: string;
  confirmed_by: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmation_token: string;
  expires_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface CompanyForMerge {
  id: string;
  name: string;
  display_name: string | null;
  created_at: string;
}

export function useSameNameCompanies() {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['same-name-companies', currentCompany?.name],
    queryFn: async () => {
      if (!currentCompany?.name) return [];

      // Find companies with the same name
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, display_name, created_at')
        .eq('name', currentCompany.name)
        .neq('id', currentCompany.id);

      if (error) throw error;

      // Filter to only show companies where current user is owner
      const companiesWithOwnership: CompanyForMerge[] = [];
      for (const company of data || []) {
        const { data: membership } = await supabase
          .from('company_members')
          .select('role')
          .eq('company_id', company.id)
          .eq('role', 'owner')
          .eq('is_active', true)
          .maybeSingle();

        if (membership) {
          companiesWithOwnership.push(company as CompanyForMerge);
        }
      }

      return companiesWithOwnership;
    },
    enabled: !!currentCompany?.name,
  });
}

export function useMergeRequests() {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['company-merge-requests', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      const { data, error } = await supabase
        .from('company_merge_requests')
        .select('*')
        .or(`source_company_id.eq.${currentCompany.id},target_company_id.eq.${currentCompany.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CompanyMergeRequest[];
    },
    enabled: !!currentCompany?.id,
  });
}

export function useCreateMergeRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ targetCompanyId }: { targetCompanyId: string }) => {
      if (!user) throw new Error('認証が必要です');

      const { data: currentCompany } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .eq('is_active', true)
        .single();

      if (!currentCompany) throw new Error('オーナー権限が必要です');

      const { data, error } = await supabase
        .from('company_merge_requests')
        .insert({
          source_company_id: currentCompany.company_id,
          target_company_id: targetCompanyId,
          requested_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-merge-requests'] });
      toast.success('統合リクエストを送信しました', {
        description: '相手側のオーナーが承認すると統合が開始されます',
      });
    },
    onError: (error: Error) => {
      toast.error('リクエストの送信に失敗しました', { description: error.message });
    },
  });
}

export function useConfirmMergeRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('認証が必要です');

      const { error } = await supabase
        .from('company_merge_requests')
        .update({
          status: 'confirmed',
          confirmed_by: user.id,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-merge-requests'] });
      toast.success('統合を承認しました', {
        description: '統合処理が開始されます',
      });
    },
    onError: (error: Error) => {
      toast.error('承認に失敗しました', { description: error.message });
    },
  });
}

export function useCancelMergeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('company_merge_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-merge-requests'] });
      toast.success('統合リクエストをキャンセルしました');
    },
    onError: (error: Error) => {
      toast.error('キャンセルに失敗しました', { description: error.message });
    },
  });
}
