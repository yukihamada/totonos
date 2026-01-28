import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Loader2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalesForecast } from '@/hooks/useSalesForecast';

export default function SalesForecast() {
  const [period, setPeriod] = useState('Q2');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    monthlyForecast,
    dealForecasts,
    totalPredicted,
    weightedPipeline,
    avgConfidence,
    isLoading,
  } = useSalesForecast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The data will auto-refresh via react-query invalidation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              AI売上予測
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              機械学習による売上予測と商談分析
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-28 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1 2024</SelectItem>
                <SelectItem value="Q2">Q2 2024</SelectItem>
                <SelectItem value="Q3">Q3 2024</SelectItem>
                <SelectItem value="Q4">Q4 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
              予測を更新
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">四半期予測売上</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPredicted)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                前年比 +12.5%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">加重パイプライン</p>
                  <p className="text-2xl font-bold">{formatCurrency(weightedPipeline)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                {dealForecasts.length}件の商談
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">予測精度</p>
                  <p className="text-2xl font-bold">{avgConfidence.toFixed(0)}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <Progress value={avgConfidence} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">達成見込み</p>
                  <p className="text-2xl font-bold">目標の87%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                あと{formatCurrency(5200000)}必要
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              月次売上予測
            </CardTitle>
            <CardDescription>過去実績と今後の予測推移</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyForecast.map((forecast, index) => (
                <div key={forecast.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24">{forecast.month}</span>
                      {forecast.trend === 'up' && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      {forecast.trend === 'down' && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      {forecast.trend === 'stable' && (
                        <span className="h-4 w-4 text-gray-500">→</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          予測: {formatCurrency(forecast.predicted)}
                        </p>
                        {forecast.actual && (
                          <p className="text-xs text-muted-foreground">
                            実績: {formatCurrency(forecast.actual)}
                            <span
                              className={cn(
                                'ml-2',
                                forecast.actual >= forecast.predicted
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              )}
                            >
                              ({forecast.actual >= forecast.predicted ? '+' : ''}
                              {(
                                ((forecast.actual - forecast.predicted) / forecast.predicted) *
                                100
                              ).toFixed(1)}
                              %)
                            </span>
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          forecast.confidence >= 90
                            ? 'default'
                            : forecast.confidence >= 75
                            ? 'secondary'
                            : 'outline'
                        }
                        className="w-16 justify-center"
                      >
                        {forecast.confidence}%
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-6 bg-muted rounded">
                    <div
                      className="absolute h-full bg-primary/30 rounded"
                      style={{
                        width: `${(forecast.predicted / 20000000) * 100}%`,
                      }}
                    />
                    {forecast.actual && (
                      <div
                        className="absolute h-full bg-primary rounded"
                        style={{
                          width: `${(forecast.actual / 20000000) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deal Forecasts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI商談分析
            </CardTitle>
            <CardDescription>各商談の成約確率とAIによる洞察</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dealForecasts.map((deal) => (
                <div key={deal.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{deal.name}</h4>
                      <p className="text-sm text-muted-foreground">{deal.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(deal.amount)}</p>
                      <Badge variant="outline">{deal.stage}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>成約確率</span>
                        <span
                          className={cn(
                            'font-medium',
                            deal.probability >= 75
                              ? 'text-green-600'
                              : deal.probability >= 50
                              ? 'text-amber-600'
                              : 'text-red-600'
                          )}
                        >
                          {deal.probability}%
                        </span>
                      </div>
                      <Progress
                        value={deal.probability}
                        className={cn(
                          deal.probability >= 75
                            ? '[&>div]:bg-green-500'
                            : deal.probability >= 50
                            ? '[&>div]:bg-amber-500'
                            : '[&>div]:bg-red-500'
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(deal.expectedCloseDate).toLocaleDateString('ja-JP')}
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="bg-primary/5 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary">AI分析</p>
                        <p className="text-sm text-muted-foreground">{deal.aiInsight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors & Opportunities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {deal.riskFactors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1 mb-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          リスク要因
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {deal.riskFactors.map((risk, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="h-1 w-1 bg-red-500 rounded-full" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {deal.opportunities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1 mb-2 text-green-600">
                          <Lightbulb className="h-4 w-4" />
                          機会
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {deal.opportunities.map((opp, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="h-1 w-1 bg-green-500 rounded-full" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AIレコメンデーション
            </CardTitle>
            <CardDescription>売上目標達成のための推奨アクション</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">重点フォローアップ</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  株式会社XYZの予算会議が4月上旬に予定されています。
                  事前に決裁者との面談をセットし、提案内容を再確認することを推奨します。
                </p>
                <Button size="sm" variant="outline" className="mt-3">
                  商談を開く
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">アップセル機会</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  株式会社GHIの契約更新時に、ユーザー数拡大（+30%）の
                  提案余地があります。過去の利用状況から高い承諾率が見込まれます。
                </p>
                <Button size="sm" variant="outline" className="mt-3">
                  提案書を作成
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h4 className="font-medium">リスク対応</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  株式会社DEFの案件は競合他社（freee）が参入しています。
                  差別化ポイント（API連携、カスタマイズ性）を強調した資料の準備を推奨します。
                </p>
                <Button size="sm" variant="outline" className="mt-3">
                  競合比較資料
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
