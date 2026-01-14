import { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Zap,
  Calendar,
  Bell,
  Settings,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useCredits, CREDIT_COSTS, type CreditTransaction } from '@/hooks/useCredits';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

// 原価設定（デモ用の概算値）
const API_COST_PER_CREDIT = 0.005; // $0.005 per credit
const EXCHANGE_RATE = 150; // 1 USD = 150 JPY

interface UsageAlert {
  id: string;
  threshold: number;
  enabled: boolean;
  notifiedAt?: Date;
}

export function CreditAnalyticsDashboard() {
  const { credits, getLogs, totalRemaining } = useCredits();
  const [alerts, setAlerts] = useState<UsageAlert[]>([
    { id: 'warn_80', threshold: 80, enabled: true },
    { id: 'warn_90', threshold: 90, enabled: true },
    { id: 'critical_100', threshold: 100, enabled: true },
  ]);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [customThreshold, setCustomThreshold] = useState('');

  const allLogs = getLogs();

  // 日別の消費傾向を計算
  const dailyUsage = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map((date) => {
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayLogs = allLogs.filter(
        (log) => log.createdAt >= dayStart && log.createdAt < dayEnd && log.type === 'consume'
      );

      const consumed = dayLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
      const cost = consumed * API_COST_PER_CREDIT * EXCHANGE_RATE;

      return {
        date: format(date, 'M/d'),
        consumed,
        cost: Math.round(cost),
        revenue: Math.round(cost * 1.3), // 仮の収益（原価の130%）
      };
    });
  }, [allLogs]);

  // 機能別の消費を計算
  const usageByFeature = useMemo(() => {
    const byAction: Record<string, number> = {};

    allLogs
      .filter((log) => log.type === 'consume' && log.action)
      .forEach((log) => {
        const action = log.action!;
        byAction[action] = (byAction[action] || 0) + Math.abs(log.amount);
      });

    return Object.entries(byAction)
      .map(([action, amount]) => ({
        name: CREDIT_COSTS[action as keyof typeof CREDIT_COSTS]?.name || action,
        value: amount,
        cost: Math.round(amount * API_COST_PER_CREDIT * EXCHANGE_RATE),
      }))
      .sort((a, b) => b.value - a.value);
  }, [allLogs]);

  // 今月の統計
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthLogs = allLogs.filter(
      (log) => log.createdAt >= monthStart && log.type === 'consume'
    );

    const consumed = monthLogs.reduce((sum, log) => sum + Math.abs(log.amount), 0);
    const cost = consumed * API_COST_PER_CREDIT * EXCHANGE_RATE;
    const revenue = cost * 1.3;
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // 日平均
    const daysPassed = Math.max(1, now.getDate());
    const avgPerDay = consumed / daysPassed;

    // 月末予測
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthly = avgPerDay * daysInMonth;

    return {
      consumed,
      cost: Math.round(cost),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      margin: Math.round(margin),
      avgPerDay: Math.round(avgPerDay * 10) / 10,
      projectedMonthly: Math.round(projectedMonthly),
    };
  }, [allLogs]);

  // 使用率の計算
  const usagePercent = credits
    ? Math.round((credits.usedThisMonth / credits.monthlyCredits) * 100)
    : 0;

  // アラートチェック
  const activeAlerts = alerts.filter((a) => a.enabled && usagePercent >= a.threshold);

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleAddCustomAlert = () => {
    const threshold = parseInt(customThreshold, 10);
    if (threshold > 0 && threshold <= 100) {
      setAlerts((prev) => [
        ...prev,
        { id: `custom_${threshold}`, threshold, enabled: true },
      ]);
      setCustomThreshold('');
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      {/* アラート表示 */}
      {activeAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>使用量警告</AlertTitle>
          <AlertDescription>
            月間クレジットの{usagePercent}%を使用しました。
            {usagePercent >= 100 && ' クレジットをチャージしてください。'}
          </AlertDescription>
        </Alert>
      )}

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の消費</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.consumed.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">cr</span>
            </div>
            <p className="text-xs text-muted-foreground">
              日平均: {monthlyStats.avgPerDay} cr
            </p>
            <Progress value={usagePercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">原価</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{monthlyStats.cost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              API利用コスト概算
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">収益</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              ¥{monthlyStats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              利益: ¥{monthlyStats.profit.toLocaleString()} ({monthlyStats.margin}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月末予測</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.projectedMonthly.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">cr</span>
            </div>
            <div className="flex items-center mt-1">
              {monthlyStats.projectedMonthly > (credits?.monthlyCredits || 0) ? (
                <>
                  <TrendingUp className="h-3 w-3 text-destructive mr-1" />
                  <span className="text-xs text-destructive">上限超過の可能性</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-chart-2 mr-1" />
                  <span className="text-xs text-chart-2">上限内</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 消費傾向グラフ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>消費傾向</CardTitle>
              <CardDescription>過去30日間のクレジット消費推移</CardDescription>
            </div>
            <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  アラート設定
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>使用量アラート設定</DialogTitle>
                  <DialogDescription>
                    月間使用量が閾値に達したときに通知します
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.threshold >= 100 ? 'destructive' : 'secondary'}>
                          {alert.threshold}%
                        </Badge>
                        <span className="text-sm">
                          {alert.threshold >= 100 ? '上限到達' : `${alert.threshold}%使用時`}
                        </span>
                      </div>
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Input
                      type="number"
                      placeholder="カスタム閾値（%）"
                      value={customThreshold}
                      onChange={(e) => setCustomThreshold(e.target.value)}
                      className="w-40"
                    />
                    <Button size="sm" onClick={handleAddCustomAlert}>
                      追加
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setAlertDialogOpen(false)}>閉じる</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsage}>
                <defs>
                  <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">消費: {payload[0]?.value?.toLocaleString()} cr</p>
                          <p className="text-sm text-muted-foreground">
                            原価: ¥{payload[0]?.payload?.cost?.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumed"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorConsumed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 原価・利益グラフと機能別内訳 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              原価・利益推移
            </CardTitle>
            <CardDescription>過去30日間</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsage.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const cost = payload.find((p) => p.dataKey === 'cost')?.value as number;
                        const revenue = payload.find((p) => p.dataKey === 'revenue')?.value as number;
                        const profit = revenue - cost;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-destructive">原価: ¥{cost?.toLocaleString()}</p>
                            <p className="text-sm text-chart-2">収益: ¥{revenue?.toLocaleString()}</p>
                            <p className="text-sm font-medium">利益: ¥{profit?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="cost" fill="hsl(var(--destructive))" opacity={0.7} name="原価" />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" opacity={0.7} name="収益" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              機能別消費
            </CardTitle>
            <CardDescription>クレジット消費の内訳</CardDescription>
          </CardHeader>
          <CardContent>
            {usageByFeature.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={usageByFeature.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {usageByFeature.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg shadow-lg p-3">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm">{data.value.toLocaleString()} cr</p>
                              <p className="text-sm text-muted-foreground">
                                原価: ¥{data.cost.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
