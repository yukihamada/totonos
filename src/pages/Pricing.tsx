import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Check,
  Sparkles,
  Zap,
  Building2,
  Rocket,
  Crown,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCredits, useChangePlan, PLANS, type PlanType } from '@/hooks/useCredits';

const PLAN_FEATURES = {
  free: [
    '月100クレジット',
    'AIチャット',
    '基本的な会計機能',
    '請求書作成（月5件）',
    'メールサポート',
  ],
  starter: [
    '月500クレジット',
    'AIチャット（無制限）',
    'AI売上予測',
    '請求書作成（月50件）',
    'PDF出力',
    'メールサポート（24時間）',
  ],
  standard: [
    '月2,000クレジット',
    'すべてのAI機能',
    '請求書作成（無制限）',
    '領収書OCR',
    'チームメンバー（5名）',
    'API アクセス',
    '優先サポート',
  ],
  pro: [
    '月10,000クレジット',
    'すべての機能',
    'チームメンバー（無制限）',
    'SSO連携',
    '監査ログ',
    '専任サポート',
    'SLA保証（99.9%）',
  ],
  enterprise: [
    '無制限クレジット',
    'カスタム機能開発',
    'オンプレミス対応',
    '専任アカウントマネージャー',
    'セキュリティ監査対応',
    '導入支援',
  ],
};

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  free: <Zap className="h-6 w-6" />,
  starter: <Rocket className="h-6 w-6" />,
  standard: <Sparkles className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />,
};

export default function Pricing() {
  const { credits, isLoading } = useCredits();
  const { changePlan, isLoading: isChanging } = useChangePlan();
  const [isYearly, setIsYearly] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const currentPlan = credits?.plan || 'free';

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  };

  const handleSelectPlan = (plan: PlanType) => {
    if (plan === currentPlan) return;
    if (plan === 'enterprise') {
      toast.info('エンタープライズプランはお問い合わせください');
      return;
    }
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;

    const success = await changePlan(selectedPlan);
    if (success) {
      toast.success(`${PLANS[selectedPlan].name}プランに変更しました`);
      setConfirmDialogOpen(false);
      setSelectedPlan(null);
      // ページをリロードして状態を更新
      window.location.reload();
    } else {
      toast.error('プラン変更に失敗しました');
    }
  };

  const getPlanStatus = (plan: PlanType) => {
    if (plan === currentPlan) return 'current';
    const planOrder = ['free', 'starter', 'standard', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const planIndex = planOrder.indexOf(plan);
    return planIndex > currentIndex ? 'upgrade' : 'downgrade';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">料金プラン</h1>
          <p className="text-muted-foreground mt-2">
            ビジネスの規模に合わせて最適なプランをお選びください
          </p>

          {/* 年額/月額切り替え */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Label htmlFor="billing-toggle" className={!isYearly ? 'font-bold' : ''}>
              月額
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className={isYearly ? 'font-bold' : ''}>
              年額
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                20% OFF
              </Badge>
            </Label>
          </div>
        </div>

        {/* プランカード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(PLANS) as PlanType[]).map((plan) => {
            const planInfo = PLANS[plan];
            const features = PLAN_FEATURES[plan];
            const status = getPlanStatus(plan);
            const price = isYearly && planInfo.price > 0
              ? getYearlyPrice(planInfo.price)
              : planInfo.price;
            const isPopular = plan === 'standard';

            return (
              <Card
                key={plan}
                className={`relative ${
                  status === 'current'
                    ? 'border-primary border-2'
                    : isPopular
                    ? 'border-blue-500 border-2'
                    : ''
                }`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                    人気
                  </Badge>
                )}
                {status === 'current' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    現在のプラン
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-3 bg-muted rounded-full w-fit">
                    {PLAN_ICONS[plan]}
                  </div>
                  <CardTitle>{planInfo.name}</CardTitle>
                  <CardDescription>
                    月{planInfo.monthlyCredits === Infinity ? '無制限' : planInfo.monthlyCredits.toLocaleString()}クレジット
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-4">
                    {plan === 'enterprise' ? (
                      <p className="text-2xl font-bold">お問い合わせ</p>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          ¥{price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          /{isYearly ? '年' : '月'}
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2 text-sm text-left">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={status === 'current' ? 'outline' : isPopular ? 'default' : 'outline'}
                    disabled={status === 'current' || isChanging}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {status === 'current'
                      ? '現在のプラン'
                      : status === 'upgrade'
                      ? 'アップグレード'
                      : plan === 'enterprise'
                      ? 'お問い合わせ'
                      : 'ダウングレード'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              よくある質問
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">クレジットは翌月に繰り越せますか？</h4>
              <p className="text-sm text-muted-foreground">
                月間クレジットは翌月にリセットされます。ただし、チャージしたクレジットは繰り越し可能です。
              </p>
            </div>
            <div>
              <h4 className="font-medium">プランの変更はいつでもできますか？</h4>
              <p className="text-sm text-muted-foreground">
                はい、いつでもプランの変更が可能です。アップグレードは即時反映、ダウングレードは次の請求サイクルから適用されます。
              </p>
            </div>
            <div>
              <h4 className="font-medium">クレジットが足りなくなったらどうなりますか？</h4>
              <p className="text-sm text-muted-foreground">
                クレジットが不足すると、AI機能などの有料機能が利用できなくなります。追加クレジットをチャージするか、プランをアップグレードしてください。
              </p>
            </div>
            <div>
              <h4 className="font-medium">無料トライアルはありますか？</h4>
              <p className="text-sm text-muted-foreground">
                Freeプランで月100クレジットまで無料でご利用いただけます。有料機能をお試しいただくのに十分なクレジット数です。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            ご不明な点がございましたら、お気軽にお問い合わせください
          </p>
          <Button variant="outline" asChild>
            <Link to="/settings">
              お問い合わせ <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* プラン変更確認ダイアログ */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プラン変更の確認</DialogTitle>
              <DialogDescription>
                {selectedPlan && (
                  <>
                    {PLANS[currentPlan].name}プランから
                    {PLANS[selectedPlan].name}プランに変更します。
                    {getPlanStatus(selectedPlan) === 'upgrade' && (
                      <p className="mt-2">
                        月間クレジットが{PLANS[selectedPlan].monthlyCredits.toLocaleString()}に増加します。
                      </p>
                    )}
                    {getPlanStatus(selectedPlan) === 'downgrade' && (
                      <p className="mt-2 text-yellow-600">
                        ダウングレードは次の請求サイクルから適用されます。
                      </p>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleConfirmChange} disabled={isChanging}>
                {isChanging ? '処理中...' : '変更する'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
