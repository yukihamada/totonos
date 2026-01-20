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
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";
import type { DailySalesSummary, InsuranceType } from "@/types/emr";
import { SalesBarChart } from "@/components/emr/SalesBarChart";
import { InsuranceTypePieChart } from "@/components/emr/InsuranceTypePieChart";
import { KpiCard } from "@/components/emr/KpiCard";

// Helper to generate mock daily sales data
function generateMockDailySales(days: number): DailySalesSummary[] {
  const summaries: DailySalesSummary[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const patientCount = Math.floor(Math.random() * 15) + 20;
    const firstVisitCount = Math.floor(Math.random() * 5) + 2;
    const returnVisitCount = patientCount - firstVisitCount;
    const totalPoints = Math.floor(Math.random() * 15000) + 30000;
    const selfPayRatio = Math.random() * 0.15 + 0.05; // 5-20%
    const insuranceRevenue = Math.round(totalPoints * 10 * (1 - selfPayRatio));
    const selfPayRevenue = Math.round(totalPoints * 10 * selfPayRatio);
    const cashRatio = Math.random() * 0.4 + 0.5; // 50-90%

    summaries.push({
      date: format(date, "yyyy-MM-dd"),
      patient_count: patientCount,
      first_visit_count: firstVisitCount,
      return_visit_count: returnVisitCount,
      total_points: totalPoints,
      total_amount: insuranceRevenue + selfPayRevenue,
      insurance_revenue: insuranceRevenue,
      self_pay_revenue: selfPayRevenue,
      cash_collected: Math.round((insuranceRevenue + selfPayRevenue) * 0.3 * cashRatio),
      card_collected: Math.round((insuranceRevenue + selfPayRevenue) * 0.3 * (1 - cashRatio)),
      by_insurance_type: [
        { type: "employee_health" as InsuranceType, count: Math.floor(patientCount * 0.4), amount: Math.round(insuranceRevenue * 0.45) },
        { type: "national_health" as InsuranceType, count: Math.floor(patientCount * 0.25), amount: Math.round(insuranceRevenue * 0.25) },
        { type: "late_elderly" as InsuranceType, count: Math.floor(patientCount * 0.2), amount: Math.round(insuranceRevenue * 0.2) },
        { type: "welfare" as InsuranceType, count: Math.floor(patientCount * 0.05), amount: Math.round(insuranceRevenue * 0.05) },
        { type: "self_pay" as InsuranceType, count: Math.floor(patientCount * 0.1), amount: selfPayRevenue },
      ],
    });
  }

  return summaries;
}

// Period options
type PeriodOption = "today" | "week" | "month";

export default function EmrSalesReport() {
  const [period, setPeriod] = useState<PeriodOption>("week");

  // Get mock data based on period
  const getDaysForPeriod = (p: PeriodOption) => {
    switch (p) {
      case "today": return 1;
      case "week": return 7;
      case "month": return 30;
      default: return 7;
    }
  };

  const mockData = generateMockDailySales(getDaysForPeriod(period));

  // Calculate totals
  const totals = mockData.reduce(
    (acc, day) => ({
      patient_count: acc.patient_count + day.patient_count,
      first_visit_count: acc.first_visit_count + day.first_visit_count,
      return_visit_count: acc.return_visit_count + day.return_visit_count,
      total_amount: acc.total_amount + day.total_amount,
      insurance_revenue: acc.insurance_revenue + day.insurance_revenue,
      self_pay_revenue: acc.self_pay_revenue + day.self_pay_revenue,
      cash_collected: acc.cash_collected + day.cash_collected,
      card_collected: acc.card_collected + day.card_collected,
    }),
    {
      patient_count: 0,
      first_visit_count: 0,
      return_visit_count: 0,
      total_amount: 0,
      insurance_revenue: 0,
      self_pay_revenue: 0,
      cash_collected: 0,
      card_collected: 0,
    }
  );

  // Calculate return visit rate
  const returnVisitRate = totals.patient_count > 0
    ? Math.round((totals.return_visit_count / totals.patient_count) * 100)
    : 0;

  // Aggregate insurance type data
  const insuranceTypeData = mockData.reduce((acc, day) => {
    day.by_insurance_type.forEach((item) => {
      const existing = acc.find((a) => a.type === item.type);
      if (existing) {
        existing.count += item.count;
        existing.amount += item.amount;
      } else {
        acc.push({ ...item });
      }
    });
    return acc;
  }, [] as { type: InsuranceType; count: number; amount: number }[]);

  // Prepare chart data
  const chartData = mockData.map((day) => ({
    date: format(new Date(day.date), "M/d", { locale: ja }),
    insurance_revenue: day.insurance_revenue,
    self_pay_revenue: day.self_pay_revenue,
  }));

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
            subtitle={`${Math.round((totals.insurance_revenue / totals.total_amount) * 100)}% of total`}
            icon={ShieldCheck}
            iconColor="text-blue-600"
          />
          <KpiCard
            title="自費収入"
            value={`¥${totals.self_pay_revenue.toLocaleString()}`}
            subtitle={`${Math.round((totals.self_pay_revenue / totals.total_amount) * 100)}% of total`}
            icon={Banknote}
            iconColor="text-purple-600"
          />
          <KpiCard
            title="現金入金"
            value={`¥${totals.cash_collected.toLocaleString()}`}
            subtitle={`カード: ¥${totals.card_collected.toLocaleString()}`}
            icon={CreditCard}
            iconColor="text-amber-600"
          />
        </div>

        {/* Patient Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="新患数"
            value={totals.first_visit_count}
            subtitle={`${Math.round((totals.first_visit_count / totals.patient_count) * 100)}% of total`}
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
            value={`¥${Math.round(totals.total_amount / totals.patient_count).toLocaleString()}`}
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
            <CardDescription>期間内の日別売上データ</CardDescription>
          </CardHeader>
          <CardContent>
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
                {mockData.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">
                      {format(new Date(day.date), "M/d (E)", { locale: ja })}
                    </TableCell>
                    <TableCell className="text-right">{day.patient_count}</TableCell>
                    <TableCell className="text-right text-blue-600">{day.first_visit_count}</TableCell>
                    <TableCell className="text-right text-green-600">{day.return_visit_count}</TableCell>
                    <TableCell className="text-right">
                      ¥{day.insurance_revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{day.self_pay_revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{day.total_amount.toLocaleString()}
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
                    ¥{totals.insurance_revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{totals.self_pay_revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{totals.total_amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
