import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  submittedBy: string;
  approvedBy: string | null;
}

export function useExpenses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async (): Promise<Expense[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('expense_claims')
        .select('id, claim_number, claimant_name, total_amount, status, claim_date, created_at, approved_by')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }

      return (data || []).map((claim) => ({
        id: claim.id,
        title: claim.claimant_name || claim.claim_number || '経費申請',
        category: '経費',
        amount: claim.total_amount || 0,
        date: new Date(claim.claim_date || claim.created_at),
        status: claim.status as Expense['status'],
        submittedBy: claim.claimant_name || '申請者',
        approvedBy: claim.approved_by || null,
      }));
    },
    enabled: !!user?.id,
  });
}
