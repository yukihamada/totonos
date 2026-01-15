import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Coins,
  TrendingUp,
  Calendar,
  Zap,
  Gift,
  History,
  CreditCard,
  Sparkles,
  ArrowRight,
  Check,
  Info,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link, useSearchParams } from 'react-router-dom';
import { useCredits, PLANS, CREDIT_COSTS, CHARGE_PACKS } from '@/hooks/useCredits';
import { usePurchaseCredits, useVerifyCreditPurchase } from '@/hooks/useCreditPurchase';

export default function Credits() {
  const { credits, totalRemaining, isLoading, charge, getLogs, refetch } = useCredits();
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const purchaseCredits = usePurchaseCredits();
  const verifyCreditPurchase = useVerifyCreditPurchase();

  // 決済成功後の処理
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    const packId = searchParams.get('pack');
    
    if (success === 'true' && sessionId) {
      // 決済を検証
      verifyCreditPurchase.mutate({ sessionId }, {
        onSuccess: (data) => {
          if (data.paid && data.credits) {
            // ローカルストレージも更新
            charge(packId || '');
            toast.success(`${data.credits}クレジットを購入しました！`);
            refetch();
          }
          // URLパラメータをクリア
          setSearchParams({});
        },
        onError: () => {
          toast.error('決済の確認に失敗しました');
          setSearchParams({});
        }
      });
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('決済がキャンセルされました');
      setSearchParams({});
    }
  }, [searchParams, verifyCreditPurchase, charge, refetch, setSearchParams]);

  const handleCharge = async () => {
    if (!selectedPack) return;
    
    // Stripe決済を開始
    purchaseCredits.mutate({ packId: selectedPack });
    setChargeDialogOpen(false);
    setSelectedPack(null);
  };

  if (isLoading || !credits) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const monthlyRemaining = Math.max(0, credits.monthlyCredits - credits.usedThisMonth);
  const usagePercent = credits.monthlyCredits > 0
    ? Math.round((credits.usedThisMonth / credits.monthlyCredits) * 100)
    : 0;
  const daysUntilReset = differenceInDays(credits.currentPeriodEnd, new Date());
  const recentLogs = getLogs().slice(0, 5);

  const getUsageColor = () => {
    if (usagePercent >= 90) return 'text-red-500';
    if (usagePercent >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Coins className="h-8 w-8" />
              クレジット
            </h1>
            <p className="text-muted-foreground">
              利用状況とクレジット残高の管理
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/credit-logs">
                <History className="mr-2 h-4 w-4" />
                利用履歴
              </Link>
            </Button>
            <Button onClick={() => setChargeDialogOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              チャージ
            </Button>
          </div>
        </div>

        {/* 残高サマリー */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardDescription>総残高</CardDescription>
              <CardTitle className="text-4xl flex items-baseline gap-2">
                <Sparkles className="h-8 w-8 text-yellow-500" />
                {totalRemaining.toLocaleString()}
                <span className="text-lg text-muted-foreground">クレジット</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">月間残り:</span>{' '}
                  <span className="font-medium">{monthlyRemaining.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">チャージ:</span>{' '}
                  <span className="font-medium text-blue-600">{credits.chargedCredits.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>現在のプラン</CardDescription>
              <CardTitle className="text-2xl">{PLANS[credits.plan].name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to="/pricing">
                  プラン変更 <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>次回リセット</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                {daysUntilReset}日後
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {format(credits.currentPeriodEnd, 'M月d日', { locale: ja })}にリセット
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 月間使用状況 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              今月の使用状況
            </CardTitle>
            <CardDescription>
              {format(credits.currentPeriodStart, 'yyyy年M月', { locale: ja })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={getUsageColor()}>
                  {credits.usedThisMonth.toLocaleString()} / {credits.monthlyCredits.toLocaleString()} 使用済み
                </span>
                <span className="text-muted-foreground">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-3" />
            </div>

            {usagePercent >= 80 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Info className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  月間クレジットの{usagePercent}%を使用しました。
                  {usagePercent >= 100 ? 'チャージをご検討ください。' : 'ご注意ください。'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* クレジット消費単価 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              クレジット消費単価
            </CardTitle>
            <CardDescription>
              各機能の利用に必要なクレジット数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(CREDIT_COSTS).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm">{value.name}</span>
                  <Badge variant="secondary">{value.cost} cr</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近の利用履歴 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  最近の利用履歴
                </CardTitle>
                <CardDescription>直近5件</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/credit-logs">すべて見る</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        log.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {log.amount > 0 ? <Gift className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(log.createdAt, 'M/d HH:mm', { locale: ja })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      log.amount > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {log.amount > 0 ? '+' : ''}{log.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                まだ利用履歴がありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* 友達招待バナー */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">友達を招待してクレジットGET!</h3>
                  <p className="text-white/80">
                    招待した友達が登録すると、あなたも友達も50クレジットもらえます
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/referrals">
                  招待する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* チャージダイアログ */}
        <Dialog open={chargeDialogOpen} onOpenChange={setChargeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>クレジットチャージ</DialogTitle>
              <DialogDescription>
                追加クレジットを購入します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {CHARGE_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPack === pack.id
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{pack.credits.toLocaleString()} クレジット</p>
                      <p className="text-sm text-muted-foreground">
                        ¥{pack.pricePerCredit}/クレジット
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">¥{pack.price.toLocaleString()}</p>
                      {pack.discount > 0 && (
                        <Badge variant="destructive" className="bg-red-500">
                          {pack.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedPack === pack.id && (
                    <div className="mt-2 flex items-center gap-1 text-primary">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">選択中</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChargeDialogOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleCharge} 
                disabled={!selectedPack || purchaseCredits.isPending}
              >
                {purchaseCredits.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  '購入する'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
