import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Users,
  ClipboardCheck,
  FileHeart,
  KeySquare,
  Clock,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  UserRoundPlus,
  RotateCw,
  BarChart3,
  Percent,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { VisitTypeIndicator } from "@/components/emr/VisitTypeIndicator";
import { KpiCard } from "@/components/emr/KpiCard";
import { InsuranceTypePieChart } from "@/components/emr/InsuranceTypePieChart";
import { useEmrReceptions } from "@/hooks/emr/useEmrReceptions";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";
import { useTodayRecordStats } from "@/hooks/emr/useEmrRecords";

type ReceptionStatus = "waiting" | "in_progress" | "completed" | "cancelled";

const statusConfig: Record<ReceptionStatus, { label: string; color: string }> = {
  waiting: { label: "待機中", color: "bg-yellow-500" },
  in_progress: { label: "診察中", color: "bg-green-500" },
  completed: { label: "完了", color: "bg-gray-500" },
  cancelled: { label: "キャンセル", color: "bg-red-500" },
};

const visitTypeMapping: Record<string, "first_visit" | "return_visit"> = {
  initial: "first_visit",
  follow_up: "return_visit",
  emergency: "return_visit",
};

type AnalyticsPeriod = "today" | "week" | "month";

export default function EmrDashboard() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("today");
  
  const { receptions, isLoading: receptionsLoading } = useEmrReceptions();
  const { patients, isLoading: patientsLoading } = useEmrPatients();
  const { data: recordStats } = useTodayRecordStats();

  const isLoading = receptionsLoading || patientsLoading;

  // Calculate stats from real data
  const waitingCount = receptions.filter((r) => r.status === "waiting").length;
  const inProgressCount = receptions.filter((r) => r.status === "in_progress").length;
  const completedCount = receptions.filter((r) => r.status === "completed").length;
  const totalTodayPatients = receptions.length;
  const initialCount = receptions.filter((r) => r.visit_type === "initial").length;
  const followUpCount = receptions.filter((r) => r.visit_type === "follow_up" || r.visit_type === "emergency").length;

  // Calculate return rate
  const returnRate = totalTodayPatients > 0 
    ? Math.round((followUpCount / totalTodayPatients) * 100) 
    : 0;

  // Calculate average age from patients
  const calculateAverageAge = () => {
    const patientsWithAge = patients.filter(p => p.birth_date);
    if (patientsWithAge.length === 0) return 0;
    
    const totalAge = patientsWithAge.reduce((sum, p) => {
      const birthDate = new Date(p.birth_date!);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return sum + age;
    }, 0);
    
    return Math.round(totalAge / patientsWithAge.length);
  };

  // Get insurance distribution from patients
  const getInsuranceDistribution = () => {
    const distribution: Record<string, { count: number; amount: number }> = {};
    
    patients.forEach(p => {
      const type = p.insurance_type || "self_pay";
      if (!distribution[type]) {
        distribution[type] = { count: 0, amount: 0 };
      }
      distribution[type].count++;
      distribution[type].amount += 10000; // Placeholder amount
    });
    
    return Object.entries(distribution).map(([type, data]) => ({
      type: type as any,
      count: data.count,
      amount: data.amount,
    }));
  };

  // Get active receptions (waiting or in progress)
  const activeReceptions = receptions.filter(
    (r) => r.status === "waiting" || r.status === "in_progress"
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="h-6 w-6" />
              電子カルテ
            </h1>
            <p className="text-muted-foreground">
              本日の診療状況を確認します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/emr/sales">
                <TrendingUp className="h-4 w-4 mr-2" />
                売上レポート
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/emr/hpki">
                <KeySquare className="h-4 w-4 mr-2" />
                HPKI署名
              </Link>
            </Button>
            <Button asChild>
              <Link to="/emr/reception">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                受付
              </Link>
            </Button>
          </div>
        </div>

        {/* Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                電子カルテ機能
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                患者データ、受付、カルテはデータベースに保存されます。
                HPKI署名機能を使用するにはローカルブリッジサーバーの起動が必要です。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">本日の患者数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTodayPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(), "yyyy年MM月dd日 (E)", { locale: ja })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">待機中</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {waitingCount}
                  </div>
                  <Button variant="link" className="px-0 h-auto" asChild>
                    <Link to="/emr/reception">
                      受付一覧 <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">診察中</CardTitle>
                  <Stethoscope className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {inProgressCount}
                  </div>
                  <p className="text-xs text-muted-foreground">現在診療中</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">診察完了</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <p className="text-xs text-muted-foreground">本日完了分</p>
                </CardContent>
              </Card>
            </div>

            {/* KPI Analytics Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    患者統計・KPI
                  </CardTitle>
                  <CardDescription>来院状況の分析</CardDescription>
                </div>
                <Select value={analyticsPeriod} onValueChange={(v) => setAnalyticsPeriod(v as AnalyticsPeriod)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">本日</SelectItem>
                    <SelectItem value="week">今週</SelectItem>
                    <SelectItem value="month">今月</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <KpiCard
                    title="新患数"
                    value={initialCount}
                    subtitle={`総来院数: ${totalTodayPatients}名`}
                    icon={UserRoundPlus}
                    iconColor="text-blue-600"
                  />
                  <KpiCard
                    title="再診数"
                    value={followUpCount}
                    icon={RotateCw}
                    iconColor="text-green-600"
                  />
                  <KpiCard
                    title="再診率"
                    value={`${returnRate}%`}
                    subtitle="リピート率"
                    icon={Percent}
                    iconColor="text-purple-600"
                    variant="highlight"
                  />
                  <KpiCard
                    title="登録患者数"
                    value={patients.length}
                    subtitle="総患者数"
                    icon={Users}
                    iconColor="text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Current Queue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>待機・診察中</CardTitle>
                    <CardDescription>
                      現在の受付状況
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/emr/reception">すべて見る</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeReceptions.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      現在待機中・診察中の患者はいません
                    </div>
                  ) : (
                    activeReceptions.slice(0, 5).map((reception, index) => (
                      <div
                        key={reception.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{reception.patient?.name}</p>
                              {reception.visit_type && (
                                <VisitTypeIndicator 
                                  visitType={visitTypeMapping[reception.visit_type] || "return_visit"} 
                                  size="sm" 
                                />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reception.chief_complaint || "主訴なし"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            statusConfig[reception.status]?.color || "bg-gray-500"
                          } text-white`}
                        >
                          {statusConfig[reception.status]?.label || reception.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Insurance Distribution */}
              <InsuranceTypePieChart
                data={getInsuranceDistribution()}
                title="保険種別分布"
                showAmount={false}
              />
            </div>
          </>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクセス</CardTitle>
            <CardDescription>
              よく使う機能へのショートカット
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/emr/reception">
                <ClipboardCheck className="h-5 w-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">受付</p>
                  <p className="text-xs text-muted-foreground">
                    待ち順管理
                  </p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/emr/patients">
                <Users className="h-5 w-5 mr-3 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">患者管理</p>
                  <p className="text-xs text-muted-foreground">
                    登録・検索
                  </p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/emr/records">
                <FileHeart className="h-5 w-5 mr-3 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">カルテ</p>
                  <p className="text-xs text-muted-foreground">
                    作成・閲覧
                  </p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/emr/sales">
                <TrendingUp className="h-5 w-5 mr-3 text-emerald-500" />
                <div className="text-left">
                  <p className="font-medium">売上レポート</p>
                  <p className="text-xs text-muted-foreground">
                    経営分析
                  </p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/emr/hpki">
                <KeySquare className="h-5 w-5 mr-3 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium">HPKI署名</p>
                  <p className="text-xs text-muted-foreground">
                    電子署名
                  </p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
