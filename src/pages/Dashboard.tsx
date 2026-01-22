import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { UnpaidInvoicesAlert } from "@/components/dashboard/UnpaidInvoicesAlert";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TrustPassportMini } from "@/components/dashboard/TrustPassportMini";
import { OnboardingGuide } from "@/components/dashboard/OnboardingGuide";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { InventoryAlertWidget } from "@/components/dashboard/InventoryAlertWidget";
import { IndustryTemplateAppliedDialog } from "@/components/IndustryTemplateAppliedDialog";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Wallet, FileText, Target, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/types/database";
import { useClients } from "@/hooks/useClients";
import { TableSkeleton } from "@/components/TableSkeleton";
import { LoadingWithTips } from "@/components/LoadingWithTips";

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: clients, isLoading: clientsLoading } = useClients();

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-destructive">
          データの読み込みに失敗しました
        </div>
      </AppLayout>
    );
  }

  // Convert recent activities to the format expected by RecentActivity component
  const formattedActivities = stats?.recentActivities.map(activity => ({
    id: activity.id,
    type: activity.type === 'payment' ? 'payment' as const :
          activity.type === 'invoice' ? 'invoice' as const :
          activity.type === 'deal' ? 'boost' as const : 'invoice' as const,
    title: activity.title,
    amount: activity.amount,
    status: activity.status as 'paid' | 'sent' | 'draft' | undefined,
    date: activity.date,
  })) || [];

  // Function to open chat - will be passed to ChatWidget via global event
  const handleChatOpen = () => {
    // Dispatch custom event to open chat
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>

        {/* Onboarding Guide - shows until all steps are completed */}
        <OnboardingGuide onChatOpen={handleChatOpen} />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="今月の請求額"
            value={isLoading ? "-" : formatCurrency(stats?.monthlyInvoiced || 0)}
            description={isLoading ? "-" : `合計: ${formatCurrency(stats?.totalInvoiced || 0)}`}
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="入金待ち"
            value={isLoading ? "-" : formatCurrency(stats?.unpaidAmount || 0)}
            description={isLoading ? "-" : `${stats?.unpaidCount || 0}件`}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            trend={stats?.overdueCount ? { value: `${stats.overdueCount}件期限超過`, positive: false } : undefined}
            isLoading={isLoading}
          />
          <StatsCard
            title="パイプライン"
            value={isLoading ? "-" : formatCurrency(stats?.pipelineValue || 0)}
            description={isLoading ? "-" : `${stats?.dealsCount || 0}件の商談`}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="成約済み"
            value={isLoading ? "-" : formatCurrency(stats?.wonDealsValue || 0)}
            description="今期の成約"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            trend={stats?.wonDealsValue ? { value: "成約", positive: true } : undefined}
            isLoading={isLoading}
          />
          <StatsCard
            title="取引先数"
            value={clientsLoading ? "-社" : `${clients?.length || 0}社`}
            description="登録済み取引先"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            isLoading={clientsLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={stats?.monthlyRevenue || []} />
          <PipelineOverview
            data={stats?.pipelineByStage || []}
            totalValue={stats?.pipelineByStage?.reduce((sum, item) => sum + item.value, 0) || 0}
          />
        </div>

        {/* Alerts and Activity Row */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <UnpaidInvoicesAlert
            unpaidAmount={stats?.unpaidAmount || 0}
            unpaidCount={stats?.unpaidCount || 0}
            overdueAmount={stats?.overdueAmount || 0}
            overdueCount={stats?.overdueCount || 0}
          />
          <InventoryAlertWidget />
          <TrustPassportMini score={782} rank="A" previousScore={759} />
          <ActivityFeed limit={5} />
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="送付中の見積書"
            value={isLoading ? "-" : formatCurrency(stats?.sentEstimates || 0)}
            description="承諾待ち"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="承諾済み見積書"
            value={isLoading ? "-" : formatCurrency(stats?.acceptedEstimates || 0)}
            description="請求書変換可能"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: "変換可能", positive: true }}
            isLoading={isLoading}
          />
          <StatsCard
            title="期限超過"
            value={isLoading ? "-" : formatCurrency(stats?.overdueAmount || 0)}
            description={isLoading ? "-" : `${stats?.overdueCount || 0}件`}
            icon={<Wallet className="h-4 w-4 text-destructive" />}
            className={stats?.overdueCount ? "border-destructive" : ""}
            isLoading={isLoading}
          />
          <StatsCard
            title="合計請求額"
            value={isLoading ? "-" : formatCurrency(stats?.totalInvoiced || 0)}
            description="全期間"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Industry template applied notification */}
      <IndustryTemplateAppliedDialog />
    </AppLayout>
  );
}
