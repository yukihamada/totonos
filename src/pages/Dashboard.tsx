import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrustPassportMini } from "@/components/dashboard/TrustPassportMini";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Wallet, FileText, Clock, Zap } from "lucide-react";
import { formatCurrency } from "@/types/database";

// Demo data
const demoActivities = [
  { id: '1', type: 'payment' as const, title: '株式会社ABC', amount: 550000, date: '2026-01-13' },
  { id: '2', type: 'invoice' as const, title: '請求書 #INV202601-0003', amount: 1200000, status: 'sent' as const, date: '2026-01-12' },
  { id: '3', type: 'boost' as const, title: 'Boost完了', amount: 800000, date: '2026-01-10' },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="利用可能キャッシュ"
            value={formatCurrency(5250000)}
            description="手元資金 + 請求済み未入金"
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            trend={{ value: "12%", positive: true }}
          />
          <StatsCard
            title="今月の請求額"
            value={formatCurrency(3800000)}
            description="8件の請求書"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="入金待ち"
            value={formatCurrency(2100000)}
            description="3件"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Boost可能額"
            value={formatCurrency(1800000)}
            description="最低手数料 1.5%"
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TrustPassportMini score={782} rank="A" previousScore={759} />
          <RecentActivity activities={demoActivities} />
        </div>
      </div>
    </AppLayout>
  );
}
