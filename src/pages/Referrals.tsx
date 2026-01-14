import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Users,
  Gift,
  Copy,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  QrCode,
  Trophy,
  Medal,
  Star,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useReferral, REFERRAL_REWARDS, REFERRAL_BADGES } from '@/hooks/useReferral';

export default function Referrals() {
  const { state, isLoading, getShareUrls, getStats } = useReferral();
  const [showQR, setShowQR] = useState(false);

  if (isLoading || !state) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const shareUrls = getShareUrls();
  const stats = getStats();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(state.referralLink);
    toast.success('招待リンクをコピーしました');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(state.referralCode);
    toast.success('招待コードをコピーしました');
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'line' | 'linkedin') => {
    if (!shareUrls) return;
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // 次のバッジまでの進捗
  const getNextBadgeProgress = () => {
    const currentReferrals = state.totalReferrals;
    for (const badge of REFERRAL_BADGES) {
      if (currentReferrals < badge.minReferrals) {
        return {
          badge,
          progress: Math.round((currentReferrals / badge.minReferrals) * 100),
          remaining: badge.minReferrals - currentReferrals,
        };
      }
    }
    return null;
  };

  const nextBadge = getNextBadgeProgress();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            招待中
          </Badge>
        );
      case 'signup':
        return (
          <Badge variant="default" className="bg-blue-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            登録済み
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-500">
            <DollarSign className="mr-1 h-3 w-3" />
            有料契約
          </Badge>
        );
      case 'churned':
        return (
          <Badge variant="outline">
            解約
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            友達招待プログラム
          </h1>
          <p className="text-muted-foreground">
            友達を招待してクレジットをゲット
          </p>
        </div>

        {/* 招待報酬説明 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-purple-500" />
                新規登録
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-600">+{REFERRAL_REWARDS.signup.referrer}</span>
                <span className="text-muted-foreground">クレジット</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                招待された友達も+{REFERRAL_REWARDS.signup.referee}クレジット
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-blue-500" />
                有料プラン契約
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600">+{REFERRAL_REWARDS.paid.referrer}</span>
                <span className="text-muted-foreground">クレジット</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                招待された友達も+{REFERRAL_REWARDS.paid.referee}クレジット
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-green-500" />
                3ヶ月継続
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-green-600">+{REFERRAL_REWARDS.retention.referrer}</span>
                <span className="text-muted-foreground">クレジット</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                長期利用ボーナス
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 招待リンク・コード */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              招待リンク
            </CardTitle>
            <CardDescription>
              リンクをシェアして友達を招待しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={state.referralLink}
                className="font-mono text-sm"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>リンクをコピー</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setShowQR(!showQR)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>QRコード表示</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <span className="text-sm text-muted-foreground">招待コード:</span>
                <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                  {state.referralCode}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* SNSシェアボタン */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700"
                onClick={() => handleShare('line')}
              >
                LINE
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
            </div>

            {showQR && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 border rounded flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    このQRコードをスキャンして登録
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 統計 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>招待人数</CardDescription>
              <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>登録済み</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats?.signedUp || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有料契約</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats?.paid || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>獲得クレジット</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                +{stats?.totalEarned.toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* バッジ・ランク */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5" />
              招待バッジ
            </CardTitle>
            <CardDescription>
              招待人数に応じてバッジを獲得できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 justify-center">
              {REFERRAL_BADGES.map((badge) => {
                const isEarned = state.totalReferrals >= badge.minReferrals;
                return (
                  <TooltipProvider key={badge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`p-4 rounded-full text-4xl ${
                            isEarned
                              ? 'bg-yellow-100'
                              : 'bg-gray-100 grayscale opacity-50'
                          }`}
                        >
                          {badge.icon}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {badge.name} ({badge.minReferrals}人以上)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {nextBadge && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    次のバッジ: {nextBadge.badge.icon} {nextBadge.badge.name}
                  </span>
                  <span>あと{nextBadge.remaining}人</span>
                </div>
                <Progress value={nextBadge.progress} className="h-2" />
              </div>
            )}

            {state.badge && (
              <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 rounded-lg">
                <span className="text-3xl">{state.badge.icon}</span>
                <span className="font-bold text-yellow-800">
                  {state.badge.name}ランク達成！
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 招待履歴 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              招待履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.referrals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>招待日</TableHead>
                    <TableHead className="text-right">獲得クレジット</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-mono">
                        {referral.refereeEmail.replace(/(.{3}).*(@.*)/, '$1***$2')}
                      </TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(referral.createdAt, 'M/d', { locale: ja })}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        +{referral.earnedCredits}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>まだ招待履歴がありません</p>
                <p className="text-sm">上のリンクをシェアして友達を招待しましょう</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
