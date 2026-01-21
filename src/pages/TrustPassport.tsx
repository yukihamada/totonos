import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInvoices } from '@/hooks/useInvoices';
import { TrustPassportMini } from '@/components/dashboard/TrustPassportMini';
import { Shield, TrendingUp, Clock, Users, Zap, Star, Award, Target } from 'lucide-react';
import { getRankFromScore, getRankColor, TrustRank } from '@/types/database';

// Mock trust passport data
const mockTrustData = {
  score: 720,
  rank: 'A' as TrustRank,
  paymentAccuracy: 95,
  onTimeRate: 92,
  avgPaymentDays: 28,
  delayFreeMonths: 8,
  transactionVolume: 85,
  monthlyInvoiceAmount: 2500000,
  clientDiversity: 70,
  accountAgeMonths: 14,
  boostUsage: 60,
  boostCount: 5,
  boostCompletionRate: 100,
};

const rankBenefits: Record<TrustRank, string[]> = {
  S: ['Boost手数料 1.5%', '即時審査承認', '専用サポート', 'API利用無制限'],
  A: ['Boost手数料 2.0%', '優先審査', 'チャットサポート', 'API利用拡張'],
  B: ['Boost手数料 2.5%', '標準審査', 'メールサポート', 'API利用可能'],
  C: ['Boost手数料 3.0%', '詳細審査', '基本サポート', 'API制限あり'],
  D: ['Boost利用制限', '厳格審査', '基本サポート', 'API利用不可'],
};

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}

function ScoreCard({ title, score, description, icon }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Progress value={score} className="flex-1" />
          <span className="font-bold text-lg w-12 text-right">{score}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function TrustPassport() {
  const { data: invoices } = useInvoices();

  // Calculate actual metrics from invoices
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
  const totalInvoices = invoices?.length || 0;

  const rank = mockTrustData.rank;
  const benefits = rankBenefits[rank];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-500" />
              Trust Passport
            </h1>
            <p className="text-muted-foreground">あなたの信用スコアとランク</p>
          </div>
        </div>

        {/* Main Score Display */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>信用スコア</CardTitle>
              <CardDescription>取引履歴に基づいて算出されたあなたの信用度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full border-8 border-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{mockTrustData.score}</div>
                      <div className="text-sm text-muted-foreground">/ 1000</div>
                    </div>
                  </div>
                  <div className={`absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                    rank === 'S' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    rank === 'A' ? 'bg-blue-500 text-white' :
                    rank === 'B' ? 'bg-green-500 text-white' :
                    rank === 'C' ? 'bg-gray-400 text-white' :
                    'bg-red-400 text-white'
                  }`}>
                    {rank}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">ランク {rank} の特典</h3>
                  <ul className="space-y-2">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>次のランクまで</CardTitle>
              <CardDescription>ランク S まであと 180 ポイント</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(mockTrustData.score - 700) / 2} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">現在: {mockTrustData.score}</span>
                <span className="font-medium">目標: 900</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">スコアを上げるヒント</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 期日通りの入金を継続する</li>
                  <li>• 取引先を増やす</li>
                  <li>• Boostを活用する</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>スコア内訳</CardTitle>
            <CardDescription>各評価項目の詳細</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ScoreCard
                title="支払い正確性"
                score={mockTrustData.paymentAccuracy}
                description={`期日遵守率: ${mockTrustData.onTimeRate}% / 平均入金日数: ${mockTrustData.avgPaymentDays}日`}
                icon={<Clock className="h-4 w-4 text-blue-500" />}
              />
              <ScoreCard
                title="取引ボリューム"
                score={mockTrustData.transactionVolume}
                description={`月間請求額: ¥${(mockTrustData.monthlyInvoiceAmount / 10000).toFixed(0)}万`}
                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
              />
              <ScoreCard
                title="取引先多様性"
                score={mockTrustData.clientDiversity}
                description={`アカウント年齢: ${mockTrustData.accountAgeMonths}ヶ月`}
                icon={<Users className="h-4 w-4 text-purple-500" />}
              />
              <ScoreCard
                title="Boost活用度"
                score={mockTrustData.boostUsage}
                description={`利用回数: ${mockTrustData.boostCount}回 / 完了率: ${mockTrustData.boostCompletionRate}%`}
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
              />
              <ScoreCard
                title="遅延フリー期間"
                score={Math.min(mockTrustData.delayFreeMonths * 10, 100)}
                description={`連続 ${mockTrustData.delayFreeMonths} ヶ月間、支払い遅延なし`}
                icon={<Award className="h-4 w-4 text-orange-500" />}
              />
              <ScoreCard
                title="信用継続性"
                score={Math.min(mockTrustData.accountAgeMonths * 5, 100)}
                description="長期利用による信頼性評価"
                icon={<Target className="h-4 w-4 text-red-500" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rank Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>ランク別特典比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(['S', 'A', 'B', 'C', 'D'] as TrustRank[]).map((r) => (
                <div
                  key={r}
                  className={`p-4 rounded-lg border-2 ${
                    r === rank ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    r === 'S' ? 'text-yellow-500' :
                    r === 'A' ? 'text-blue-500' :
                    r === 'B' ? 'text-green-500' :
                    r === 'C' ? 'text-gray-500' :
                    'text-red-500'
                  }`}>
                    {r}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {r === 'S' ? '900+' : r === 'A' ? '700-899' : r === 'B' ? '500-699' : r === 'C' ? '300-499' : '0-299'}
                  </div>
                  <ul className="space-y-1">
                    {rankBenefits[r].slice(0, 2).map((b, i) => (
                      <li key={i} className="text-xs">{b}</li>
                    ))}
                  </ul>
                  {r === rank && (
                    <Badge className="mt-2">現在のランク</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総請求書数</CardDescription>
              <CardTitle className="text-2xl">{totalInvoices}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>入金完了</CardDescription>
              <CardTitle className="text-2xl">{paidInvoices.length}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>入金率</CardDescription>
              <CardTitle className="text-2xl">
                {totalInvoices > 0 ? Math.round((paidInvoices.length / totalInvoices) * 100) : 0}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
