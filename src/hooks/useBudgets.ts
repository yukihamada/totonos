import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  company_id: string;
  user_id: string;
  account_id: string;
  year: number;
  month: number;
  amount: number;
  budget_type: 'expense' | 'revenue';
  created_at: string;
  updated_at: string;
}

interface CreateBudgetInput {
  account_id: string;
  year: number;
  month: number;
  amount: number;
  budget_type?: 'expense' | 'revenue';
}

interface UpdateBudgetInput {
  id?: string;
  account_id: string;
  year: number;
  month: number;
  amount: number;
  budget_type?: 'expense' | 'revenue';
}

export function useBudgets(year: number, month: number) {
  const { data: currentCompany } = useCurrentCompany();

  return useQuery({
    queryKey: ['budgets', currentCompany?.id, year, month],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('year', year)
        .eq('month', month);

      if (error) throw error;
      return (data || []) as Budget[];
    },
    enabled: !!currentCompany?.id,
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  const { data: currentCompany } = useCurrentCompany();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateBudgetInput) => {
      if (!currentCompany?.id) throw new Error('会社が選択されていません');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインしていません');

      // Check if budget exists
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('company_id', currentCompany.id)
        .eq('account_id', input.account_id)
        .eq('year', input.year)
        .eq('month', input.month)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('budgets')
          .update({ amount: input.amount })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            company_id: currentCompany.id,
            user_id: user.id,
            account_id: input.account_id,
            year: input.year,
            month: input.month,
            amount: input.amount,
            budget_type: input.budget_type || 'expense',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentCompany?.id, variables.year, variables.month] });
      toast({
        title: '予算を保存しました',
      });
    },
    onError: (error) => {
      toast({
        title: '予算の保存に失敗しました',
        description: error instanceof Error ? error.message : '不明なエラー',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { data: currentCompany } = useCurrentCompany();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: '予算を削除しました',
      });
    },
    onError: (error) => {
      toast({
        title: '予算の削除に失敗しました',
        description: error instanceof Error ? error.message : '不明なエラー',
        variant: 'destructive',
      });
    },
  });
}
