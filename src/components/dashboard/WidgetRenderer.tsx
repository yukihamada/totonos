import { RevenueChart } from "./RevenueChart";
import { PipelineOverview } from "./PipelineOverview";
import { UnpaidInvoicesAlert } from "./UnpaidInvoicesAlert";
import { ActivityFeed } from "./ActivityFeed";
import { InventoryAlertWidget } from "./InventoryAlertWidget";
import { TrustPassportMini } from "./TrustPassportMini";
import { StatsCard } from "./StatsCard";
import { DashboardWidgetConfig } from "@/config/dashboard-widgets";
import { formatCurrency } from "@/types/database";
import { FileText, Wallet, Target, TrendingUp, Users, Stethoscope, Calendar, Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// Placeholder widget for unimplemented types
function PlaceholderWidget({ title, icon: Icon, description }: { title: string; icon: React.ElementType; description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">-</div>
        <p className="text-xs text-muted-foreground">{description || "データを取得中..."}</p>
      </CardContent>
    </Card>
  );
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

    // Industry-specific widgets (placeholders for now)
    case "daily-patients":
      return <PlaceholderWidget title="本日の患者数" icon={Stethoscope} description="本日の来院予定を表示" />;

    case "insurance-claims":
      return <PlaceholderWidget title="保険請求状況" icon={FileText} description="レセプト処理状況を表示" />;

    case "today-appointments":
      return <PlaceholderWidget title="本日の予約" icon={Calendar} description="本日の予約一覧を表示" />;

    case "active-projects":
      return <PlaceholderWidget title="進行中プロジェクト" icon={Briefcase} description="アクティブなプロジェクトを表示" />;

    case "billable-hours":
      return <PlaceholderWidget title="請求可能時間" icon={Clock} description="今月の稼働時間を表示" />;

    default:
      return <PlaceholderWidget title={widget.title} icon={FileText} description="このウィジェットは準備中です" />;
  }
}
