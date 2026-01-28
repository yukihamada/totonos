import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Download,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Banknote,
  UserRoundPlus,
  RotateCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { SalesBarChart } from "@/components/emr/SalesBarChart";
import { InsuranceTypePieChart } from "@/components/emr/InsuranceTypePieChart";
import { KpiCard } from "@/components/emr/KpiCard";
import { useEmrSalesReport, type PeriodOption } from "@/hooks/useEmrSalesReport";

export default function EmrSalesReport() {
  const [period, setPeriod] = useState<PeriodOption>("week");
  
  const { dailyData, totals, insuranceTypeData, chartData, isLoading, error } = useEmrSalesReport(period);

  // Calculate return visit rate
  const returnVisitRate = totals.patient_count > 0
    ? Math.round((totals.return_visit_count / totals.patient_count) * 100)
    : 0;

  // Safe division helper
  const safePercent = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/emr">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                売上レポート
              </h1>
              <p className="text-muted-foreground">
                診療報酬・会計データの分析
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodOption)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">本日</SelectItem>
                <SelectItem value="week">過去7日</SelectItem>
                <SelectItem value="month">過去30日</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="総売上"
            value={`¥${totals.total_amount.toLocaleString()}`}
            subtitle={`${totals.patient_count}名来院`}
            icon={DollarSign}
            iconColor="text-emerald-600"
            variant="highlight"
          />
          <KpiCard
            title="保険収入"
            value={`¥${totals.insurance_revenue.toLocaleString()}`}
            subtitle={`${safePercent(totals.insurance_revenue, totals.total_amount)}% of total`}
            icon={ShieldCheck}
            iconColor="text-blue-600"
          />
          <KpiCard
            title="自費収入"
            value={`¥${totals.self_pay_revenue.toLocaleString()}`}
            subtitle={`${safePercent(totals.self_pay_revenue, totals.total_amount)}% of total`}
            icon={Banknote}
            iconColor="text-purple-600"
          />
          <KpiCard
            title="現金入金"
            value={`¥${Math.round(totals.cash_collected).toLocaleString()}`}
            subtitle={`カード: ¥${Math.round(totals.card_collected).toLocaleString()}`}
            icon={CreditCard}
            iconColor="text-amber-600"
          />
        </div>

        {/* Patient Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="新患数"
            value={totals.first_visit_count}
            subtitle={`${safePercent(totals.first_visit_count, totals.patient_count)}% of total`}
            icon={UserRoundPlus}
            iconColor="text-blue-600"
          />
          <KpiCard
            title="再診数"
            value={totals.return_visit_count}
            subtitle={`${returnVisitRate}% 再診率`}
            icon={RotateCw}
            iconColor="text-green-600"
          />
          <KpiCard
            title="平均単価"
            value={totals.patient_count > 0 
              ? `¥${Math.round(totals.total_amount / totals.patient_count).toLocaleString()}`
              : '¥0'
            }
            subtitle="患者1人あたり"
            icon={TrendingUp}
            iconColor="text-primary"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesBarChart data={chartData} title="売上推移（保険/自費）" />
          <InsuranceTypePieChart
            data={insuranceTypeData}
            title="保険種別分布"
            showAmount={true}
          />
        </div>

        {/* Daily Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>日別売上明細</CardTitle>
            <CardDescription>
              {dailyData.length > 0 
                ? `期間内の日別売上データ（${dailyData.length}日分）`
                : 'データがありません'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                選択した期間のデータがありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead className="text-right">来院数</TableHead>
                    <TableHead className="text-right">新患</TableHead>
                    <TableHead className="text-right">再診</TableHead>
                    <TableHead className="text-right">保険収入</TableHead>
                    <TableHead className="text-right">自費収入</TableHead>
                    <TableHead className="text-right">合計</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyData.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">
                        {format(new Date(day.date), "M/d (E)", { locale: ja })}
                      </TableCell>
                      <TableCell className="text-right">{day.patient_count}</TableCell>
                      <TableCell className="text-right text-blue-600">{day.first_visit_count}</TableCell>
                      <TableCell className="text-right text-green-600">{day.return_visit_count}</TableCell>
                      <TableCell className="text-right">
                        ¥{Math.round(day.insurance_revenue).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ¥{Math.round(day.self_pay_revenue).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{Math.round(day.total_amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>合計</TableCell>
                    <TableCell className="text-right">{totals.patient_count}</TableCell>
                    <TableCell className="text-right text-blue-600">{totals.first_visit_count}</TableCell>
                    <TableCell className="text-right text-green-600">{totals.return_visit_count}</TableCell>
                    <TableCell className="text-right">
                      ¥{Math.round(totals.insurance_revenue).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{Math.round(totals.self_pay_revenue).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{Math.round(totals.total_amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
