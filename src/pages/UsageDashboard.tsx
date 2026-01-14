import { useState } from 'react';
import {
  BarChart3,
  Database,
  Users,
  Key,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from 'recharts';
import { useUsageMetrics } from '@/hooks/useUsageMetrics';
import { Link } from 'react-router-dom';

export function UsageDashboard() {
  const {
    metrics,
    isLoading,
    error,
    refresh,
    usagePercentages,
    isNearLimit,
    formatBytes,
  } = useUsageMetrics();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">使用量ダッシュボード</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error || 'データを読み込めませんでした'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { api, storage, members, apiKeys, plan } = metrics;

  // Calculate trends
  const apiTrend = api.previousMonth.total > 0
    ? Math.round(((api.currentMonth.total - api.previousMonth.total) / api.previousMonth.total) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">使用量ダッシュボード</h1>
          <p className="text-muted-foreground">
            現在のプラン: <Badge variant="outline" className="ml-1">{plan.name.toUpperCase()}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button asChild>
            <Link to="/settings?tab=billing">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              プランをアップグレード
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts for near-limit usage */}
      {(isNearLimit.api || isNearLimit.storage || isNearLimit.members) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>使用量警告</AlertTitle>
          <AlertDescription>
            {isNearLimit.api && 'APIリクエスト数が上限に近づいています。'}
            {isNearLimit.storage && 'ストレージ使用量が上限に近づいています。'}
            {isNearLimit.members && 'メンバー数が上限に近づいています。'}
            プランのアップグレードをご検討ください。
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APIリクエスト</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {api.currentMonth.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              / {plan.limits.apiRequestsPerMonth.toLocaleString()} 今月
            </p>
            <Progress value={usagePercentages.api} className="mt-2 h-2" />
            <div className="flex items-center mt-2 text-xs">
              {apiTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={apiTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {apiTrend >= 0 ? '+' : ''}{apiTrend}%
              </span>
              <span className="text-muted-foreground ml-1">前月比</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ストレージ</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(storage.totalBytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              / {formatBytes(plan.limits.storageBytes)}
            </p>
            <Progress value={usagePercentages.storage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {storage.files.toLocaleString()} ファイル
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">チームメンバー</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.current}
            </div>
            <p className="text-xs text-muted-foreground">
              / {members.limit === -1 ? '無制限' : members.limit}
            </p>
            {members.limit !== -1 && (
              <Progress value={usagePercentages.members} className="mt-2 h-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APIキー</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.active} <span className="text-sm font-normal text-muted-foreground">有効</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.current} / {apiKeys.limit} 作成済み
            </p>
            <Progress value={(apiKeys.current / apiKeys.limit) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* API Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>APIリクエスト推移</CardTitle>
          <CardDescription>過去30日間のリクエスト数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={api.daily}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            リクエスト: {payload[0]?.value?.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requestCount"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>APIパフォーマンス</CardTitle>
            <CardDescription>今月の統計</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">平均レスポンス時間</span>
              <span className="font-medium">{Math.round(api.currentMonth.avgLatency)} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">エラー数</span>
              <span className="font-medium">{api.currentMonth.errors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">エラー率</span>
              <span className="font-medium">
                {api.currentMonth.total > 0
                  ? ((api.currentMonth.errors / api.currentMonth.total) * 100).toFixed(2)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">成功率</span>
              <span className="font-medium text-green-600">
                {api.currentMonth.total > 0
                  ? (100 - (api.currentMonth.errors / api.currentMonth.total) * 100).toFixed(2)
                  : 100}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ストレージ内訳</CardTitle>
            <CardDescription>ファイルタイプ別</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(storage.byType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(storage.byType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([type, bytes]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{type}</Badge>
                      </div>
                      <span className="text-sm font-medium">{formatBytes(bytes)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                ファイルがありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
