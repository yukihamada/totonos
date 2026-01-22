import { RevenueChart } from "./RevenueChart";
import { PipelineOverview } from "./PipelineOverview";
import { UnpaidInvoicesAlert } from "./UnpaidInvoicesAlert";
import { ActivityFeed } from "./ActivityFeed";
import { InventoryAlertWidget } from "./InventoryAlertWidget";
import { TrustPassportMini } from "./TrustPassportMini";
import { StatsCard } from "./StatsCard";
import { DashboardWidgetConfig } from "@/config/dashboard-widgets";
import { formatCurrency } from "@/types/database";
import { FileText, Wallet, Target, TrendingUp, Users } from "lucide-react";

// Industry-specific widgets
import { DailyPatientsWidget } from "./widgets/DailyPatientsWidget";
import { InsuranceClaimsWidget } from "./widgets/InsuranceClaimsWidget";
import { ActiveProjectsWidget } from "./widgets/ActiveProjectsWidget";
import { BillableHoursWidget } from "./widgets/BillableHoursWidget";
import { TodayAppointmentsWidget } from "./widgets/TodayAppointmentsWidget";

interface WidgetRendererProps {
  widget: DashboardWidgetConfig;
  stats?: {
    monthlyInvoiced?: number;
    totalInvoiced?: number;
    unpaidAmount?: number;
    unpaidCount?: number;
    overdueAmount?: number;
    overdueCount?: number;
    pipelineValue?: number;
    dealsCount?: number;
    wonDealsValue?: number;
    monthlyRevenue?: { month: string; amount: number; paid: number }[];
    pipelineByStage?: { stage: string; value: number; count: number }[];
  };
  clientsCount?: number;
  isLoading?: boolean;
}

export function WidgetRenderer({ widget, stats, clientsCount, isLoading }: WidgetRendererProps) {
  switch (widget.type) {
    // Stats cards (small widgets)
    case "stats-invoiced":
      return (
        <StatsCard
          title="今月の請求額"
          value={isLoading ? "-" : formatCurrency(stats?.monthlyInvoiced || 0)}
          description={isLoading ? "-" : `合計: ${formatCurrency(stats?.totalInvoiced || 0)}`}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      );

    case "stats-unpaid":
      return (
        <StatsCard
          title="入金待ち"
          value={isLoading ? "-" : formatCurrency(stats?.unpaidAmount || 0)}
          description={isLoading ? "-" : `${stats?.unpaidCount || 0}件`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          trend={stats?.overdueCount ? { value: `${stats.overdueCount}件期限超過`, positive: false } : undefined}
          isLoading={isLoading}
        />
      );

    case "stats-pipeline":
      return (
        <StatsCard
          title="パイプライン"
          value={isLoading ? "-" : formatCurrency(stats?.pipelineValue || 0)}
          description={isLoading ? "-" : `${stats?.dealsCount || 0}件の商談`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      );

    case "stats-won":
      return (
        <StatsCard
          title="成約済み"
          value={isLoading ? "-" : formatCurrency(stats?.wonDealsValue || 0)}
          description="今期の成約"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={stats?.wonDealsValue ? { value: "成約", positive: true } : undefined}
          isLoading={isLoading}
        />
      );

    case "stats-clients":
      return (
        <StatsCard
          title="取引先数"
          value={isLoading ? "-社" : `${clientsCount || 0}社`}
          description="登録済み取引先"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      );

    // Chart widgets (large)
    case "revenue-chart":
      return <RevenueChart data={stats?.monthlyRevenue || []} />;

    case "pipeline-overview":
      return (
        <PipelineOverview
          data={stats?.pipelineByStage || []}
          totalValue={stats?.pipelineByStage?.reduce((sum, item) => sum + item.value, 0) || 0}
        />
      );

    // Medium widgets
    case "unpaid-invoices":
      return (
        <UnpaidInvoicesAlert
          unpaidAmount={stats?.unpaidAmount || 0}
          unpaidCount={stats?.unpaidCount || 0}
          overdueAmount={stats?.overdueAmount || 0}
          overdueCount={stats?.overdueCount || 0}
        />
      );

    case "inventory-alerts":
      return <InventoryAlertWidget />;

    case "trust-passport":
      return <TrustPassportMini score={782} rank="A" previousScore={759} />;

    case "activity-feed":
      return <ActivityFeed limit={5} />;

    // Healthcare industry widgets
    case "daily-patients":
      return <DailyPatientsWidget />;

    case "insurance-claims":
      return <InsuranceClaimsWidget />;

    // Service industry widgets
    case "today-appointments":
      return <TodayAppointmentsWidget />;

    // Project management widgets (IT, Construction, Consulting)
    case "active-projects":
      return <ActiveProjectsWidget />;

    case "billable-hours":
      return <BillableHoursWidget />;

    default:
      return null;
  }
}
