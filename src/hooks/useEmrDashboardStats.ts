import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { format, startOfMonth, endOfMonth } from "date-fns";

export interface EmrDashboardStats {
  // Daily patients
  todayPatients: number;
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
  firstVisitCount: number;
  returnVisitCount: number;
  
  // Insurance claims
  monthlyReceiptCount: number;
  monthlyTotalPoints: number;
  draftCount: number;
  submittedCount: number;
  approvedCount: number;
  returnedCount: number;
}

export function useEmrDashboardStats() {
  const { data: currentCompany } = useCurrentCompany();
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['emr-dashboard-stats', currentCompany?.id, today],
    queryFn: async (): Promise<EmrDashboardStats> => {
      if (!currentCompany?.id) {
        return {
          todayPatients: 0,
          waitingCount: 0,
          inProgressCount: 0,
          completedCount: 0,
          firstVisitCount: 0,
          returnVisitCount: 0,
          monthlyReceiptCount: 0,
          monthlyTotalPoints: 0,
          draftCount: 0,
          submittedCount: 0,
          approvedCount: 0,
          returnedCount: 0,
        };
      }

      // Fetch today's receptions
      const { data: receptions, error: receptionError } = await supabase
        .from('emr_receptions')
        .select('status, visit_type')
        .eq('company_id', currentCompany.id)
        .eq('reception_date', today);

      if (receptionError) {
        console.error('Error fetching receptions:', receptionError);
      }

      // Fetch monthly receipts
      const { data: receipts, error: receiptError } = await supabase
        .from('emr_receipts')
        .select('status, total_points')
        .eq('company_id', currentCompany.id)
        .gte('billing_month', monthStart)
        .lte('billing_month', monthEnd);

      if (receiptError) {
        console.error('Error fetching receipts:', receiptError);
      }

      // Calculate reception stats
      const receptionStats = (receptions || []).reduce(
        (acc, r) => {
          acc.total++;
          if (r.status === 'waiting') acc.waiting++;
          if (r.status === 'in_progress') acc.inProgress++;
          if (r.status === 'completed') acc.completed++;
          if (r.visit_type === 'first_visit') acc.firstVisit++;
          if (r.visit_type === 'return_visit') acc.returnVisit++;
          return acc;
        },
        { total: 0, waiting: 0, inProgress: 0, completed: 0, firstVisit: 0, returnVisit: 0 }
      );

      // Calculate receipt stats
      const receiptStats = (receipts || []).reduce(
        (acc, r) => {
          acc.total++;
          acc.totalPoints += r.total_points || 0;
          if (r.status === 'draft') acc.draft++;
          if (r.status === 'submitted') acc.submitted++;
          if (r.status === 'approved') acc.approved++;
          if (r.status === 'returned') acc.returned++;
          return acc;
        },
        { total: 0, totalPoints: 0, draft: 0, submitted: 0, approved: 0, returned: 0 }
      );

      return {
        todayPatients: receptionStats.total,
        waitingCount: receptionStats.waiting,
        inProgressCount: receptionStats.inProgress,
        completedCount: receptionStats.completed,
        firstVisitCount: receptionStats.firstVisit,
        returnVisitCount: receptionStats.returnVisit,
        monthlyReceiptCount: receiptStats.total,
        monthlyTotalPoints: receiptStats.totalPoints,
        draftCount: receiptStats.draft,
        submittedCount: receiptStats.submitted,
        approvedCount: receiptStats.approved,
        returnedCount: receiptStats.returned,
      };
    },
    enabled: !!currentCompany?.id,
    staleTime: 30000,
  });
}
