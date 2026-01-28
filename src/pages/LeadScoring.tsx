import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Brain,
  TrendingUp,
  Target,
  Flame,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Settings,
  BarChart3,
  Users,
  Phone,
  Mail,
  Calendar,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeadScoring, ScoredLead } from '@/hooks/useLeadScoring';
import { Skeleton } from '@/components/ui/skeleton';

// Removed mock data - now using useLeadScoring hook

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-red-100 text-red-800';
  let label = 'Low';

  if (score >= 80) {
    color = 'bg-green-100 text-green-800';
    label = 'Hot';
  } else if (score >= 60) {
    color = 'bg-yellow-100 text-yellow-800';
    label = 'Warm';
  } else if (score >= 40) {
    color = 'bg-blue-100 text-blue-800';
    label = 'Cool';
  }

  return (
    <Badge className={`${color} hover:${color}`}>
      {label}
    </Badge>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-600" />;
  if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

function ScoreFactors({ factors }: { factors: ScoredLead['factors'] }) {
  const factorLabels = {
    engagement: 'エンゲージメント',
    fitScore: '適合度',
    activityRecency: '活動頻度',
    companySize: '企業規模',
    budget: '予算適合',
  };

  return (
    <div className="space-y-2">
      {Object.entries(factors).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-24">
            {factorLabels[key as keyof typeof factorLabels]}
          </span>
          <Progress value={value} className="h-2 flex-1" />
          <span className="text-xs font-medium w-8">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function LeadScoring() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: scoredLeads = [], isLoading, refetch } = useLeadScoring();

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  };

  const hotLeads = scoredLeads.filter(l => l.score >= 80);
  const warmLeads = scoredLeads.filter(l => l.score >= 60 && l.score < 80);
  const avgScore = scoredLeads.length > 0 ? Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length) : 0;
  const avgConversion = scoredLeads.length > 0 ? Math.round(scoredLeads.reduce((sum, l) => sum + l.predictedConversion, 0) / scoredLeads.length) : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
              AIリードスコアリング
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              AIがリードの成約確率を予測・ランク付け
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              スコア更新
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                ホットリード
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{hotLeads.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Target className="h-4 w-4 text-yellow-500" />
                ウォームリード
              </CardDescription>
              <CardTitle className="text-2xl">{warmLeads.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                平均スコア
              </CardDescription>
              <CardTitle className="text-2xl">{avgScore}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                平均成約率予測
              </CardDescription>
              <CardTitle className="text-2xl">{avgConversion}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* High Priority Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              今すぐアクションが必要なリード
            </CardTitle>
            <CardDescription>
              スコア80以上のホットリード
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hotLeads.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                現在ホットリードはありません
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {hotLeads.map(lead => (
                  <div key={lead.id} className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{lead.companyName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">{lead.score}</span>
                        <TrendIcon trend={lead.trend} />
                      </div>
                    </div>
                    <div className="p-2 bg-background rounded border mb-3">
                      <p className="text-sm font-medium text-orange-600">
                        推奨アクション: {lead.recommendedAction}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        電話
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        メール
                      </Button>
                      <Link to="/leads">
                        <Button size="sm" variant="ghost">
                          詳細
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              全リードスコア一覧
            </CardTitle>
            <CardDescription>
              スコア順にソート（高い順）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">企業名</TableHead>
                      <TableHead className="whitespace-nowrap">担当者</TableHead>
                      <TableHead className="whitespace-nowrap">ソース</TableHead>
                      <TableHead className="text-center whitespace-nowrap">スコア</TableHead>
                      <TableHead className="text-center whitespace-nowrap">成約予測</TableHead>
                      <TableHead className="whitespace-nowrap">スコア要因</TableHead>
                      <TableHead className="whitespace-nowrap">推奨アクション</TableHead>
                      <TableHead className="whitespace-nowrap">最終活動</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...scoredLeads].sort((a, b) => b.score - a.score).map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium whitespace-nowrap">{lead.companyName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{lead.contactName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-bold">{lead.score}</span>
                            <TrendIcon trend={lead.trend} />
                            <ScoreBadge score={lead.score} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{lead.predictedConversion}%</span>
                            <Progress value={lead.predictedConversion} className="h-1 w-16 mt-1" />
                          </div>
                        </TableCell>
                        <TableCell className="w-48">
                          <ScoreFactors factors={lead.factors} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm whitespace-nowrap">{lead.recommendedAction}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {lead.lastActivity}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Info */}
        <Card>
          <CardHeader>
            <CardTitle>AIスコアリングモデルについて</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">エンゲージメント</p>
                <p className="text-xs">メール開封率、サイト訪問頻度</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">適合度</p>
                <p className="text-xs">業種、課題の一致度</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">活動頻度</p>
                <p className="text-xs">直近のアクション数</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">企業規模</p>
                <p className="text-xs">従業員数、売上規模</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">予算適合</p>
                <p className="text-xs">想定予算との適合度</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
