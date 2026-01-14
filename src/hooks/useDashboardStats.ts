import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
import { demoDashboardStats } from '@/data/demo-data';

export interface DashboardStats {
  // Invoice stats
  totalInvoiced: number;
  monthlyInvoiced: number;
  unpaidAmount: number;
  unpaidCount: number;
  overdueAmount: number;
  overdueCount: number;

  // Estimate stats
  sentEstimates: number;
  acceptedEstimates: number;

  // Deal stats
  pipelineValue: number;
  dealsCount: number;
  wonDealsValue: number;

  // Monthly revenue data (last 6 months)
  monthlyRevenue: { month: string; amount: number; paid: number }[];

  // Pipeline by stage
  pipelineByStage: { stage: string; count: number; value: number }[];

  // Recent activities
  recentActivities: {
    id: string;
    type: 'invoice' | 'estimate' | 'deal' | 'payment';
    title: string;
    amount: number;
    date: string;
    status?: string;
  }[];
}

export function useDashboardStats() {
  const { user } = useAuth();
  const { isDemoMode } = useDemo();

  return useQuery({
    queryKey: ['dashboard_stats', isDemoMode ? 'demo' : user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      // Return demo data if in demo mode
      if (isDemoMode) {
        return demoDashboardStats;
      }

      if (!user) throw new Error('User not authenticated');

      const today = new Date();
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, title, total_amount, status, issue_date, due_date, paid_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch estimates
      const { data: estimates } = await supabase
        .from('estimates')
        .select('id, title, total_amount, status, issue_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch deals
      const { data: deals } = await supabase
        .from('deals')
        .select('id, deal_name, amount, stage, probability, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const invoiceList = invoices || [];
      const estimateList = estimates || [];
      const dealList = deals || [];

      // Calculate invoice stats
      const totalInvoiced = invoiceList.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const monthlyInvoices = invoiceList.filter(inv => inv.issue_date >= thisMonthStart);
      const monthlyInvoiced = monthlyInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      const unpaidInvoices = invoiceList.filter(inv => inv.status === 'sent' || inv.status === 'draft');
      const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const unpaidCount = unpaidInvoices.length;

      const todayStr = today.toISOString().split('T')[0];
      const overdueInvoices = invoiceList.filter(
        inv => (inv.status === 'sent' || inv.status === 'draft') && inv.due_date < todayStr
      );
      const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const overdueCount = overdueInvoices.length;

      // Calculate estimate stats
      const sentEstimates = estimateList
        .filter(e => e.status === 'sent')
        .reduce((sum, e) => sum + (e.total_amount || 0), 0);
      const acceptedEstimates = estimateList
        .filter(e => e.status === 'accepted')
        .reduce((sum, e) => sum + (e.total_amount || 0), 0);

      // Calculate deal stats
      const openDeals = dealList.filter(d => d.stage !== 'won' && d.stage !== 'lost');
      const pipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0) * ((d.probability || 0) / 100), 0);
      const dealsCount = openDeals.length;
      const wonDealsValue = dealList
        .filter(d => d.stage === 'won')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenue: { month: string; amount: number; paid: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = monthDate.toISOString().split('T')[0];
        const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        const monthEnd = nextMonth.toISOString().split('T')[0];

        const monthInvoices = invoiceList.filter(
          inv => inv.issue_date >= monthStart && inv.issue_date < monthEnd
        );
        const monthPaid = invoiceList.filter(
          inv => inv.paid_date && inv.paid_date >= monthStart && inv.paid_date < monthEnd
        );

        monthlyRevenue.push({
          month: `${monthDate.getMonth() + 1}月`,
          amount: monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
          paid: monthPaid.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        });
      }

      // Pipeline by stage
      const stages = ['initial', 'proposal', 'negotiation', 'contract', 'won'];
      const stageLabels: Record<string, string> = {
        initial: '初期',
        proposal: '提案中',
        negotiation: '交渉中',
        contract: '契約',
        won: '成約',
      };
      const pipelineByStage = stages.map(stage => {
        const stageDeals = dealList.filter(d => d.stage === stage);
        return {
          stage: stageLabels[stage] || stage,
          count: stageDeals.length,
          value: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
        };
      });

      // Recent activities
      const recentActivities: DashboardStats['recentActivities'] = [];

      // Add recent invoices
      invoiceList.slice(0, 5).forEach(inv => {
        recentActivities.push({
          id: inv.id,
          type: inv.status === 'paid' ? 'payment' : 'invoice',
          title: inv.title,
          amount: inv.total_amount || 0,
          date: inv.issue_date,
          status: inv.status,
        });
      });

      // Add recent estimates
      estimateList.slice(0, 3).forEach(est => {
        recentActivities.push({
          id: est.id,
          type: 'estimate',
          title: est.title,
          amount: est.total_amount || 0,
          date: est.issue_date,
          status: est.status,
        });
      });

      // Add recent deals
      dealList.slice(0, 3).forEach(deal => {
        recentActivities.push({
          id: deal.id,
          type: 'deal',
          title: deal.deal_name,
          amount: deal.amount || 0,
          date: deal.created_at.split('T')[0],
          status: deal.stage,
        });
      });

      // Sort by date and take top 10
      recentActivities.sort((a, b) => b.date.localeCompare(a.date));

      return {
        totalInvoiced,
        monthlyInvoiced,
        unpaidAmount,
        unpaidCount,
        overdueAmount,
        overdueCount,
        sentEstimates,
        acceptedEstimates,
        pipelineValue,
        dealsCount,
        wonDealsValue,
        monthlyRevenue,
        pipelineByStage,
        recentActivities: recentActivities.slice(0, 10),
      };
    },
    enabled: isDemoMode || !!user,
    staleTime: 30000, // 30 seconds
  });
}
