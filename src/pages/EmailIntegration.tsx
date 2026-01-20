import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Calendar,
  Link2,
  Settings,
  Shield,
  Inbox,
  Send,
  Bot,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompanyEmailAddresses } from '@/hooks/useCompanyEmailAddresses';
import { useCurrentCompany } from '@/hooks/useCompany';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmailIntegration() {
  const { data: emailAddresses = [], isLoading: emailLoading } = useCompanyEmailAddresses();
  const { data: currentCompany, isLoading: companyLoading } = useCurrentCompany();

  const isLoading = emailLoading || companyLoading;
  
  // 会社のメールアドレス一覧を生成
  const companyEmails = emailAddresses.map(addr => ({
    ...addr,
    fullAddress: currentCompany?.slug 
      ? `${addr.address_prefix}@${currentCompany.slug}.totonos.jp`
      : null
  }));

  const primaryEmail = companyEmails[0]?.fullAddress;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-8 w-8" />
              メール連携
            </h1>
            <p className="text-muted-foreground">
              Totonos AIメール機能と外部メール連携
            </p>
          </div>
        </div>

        {/* Totonos AI メール機能 */}
        <Card className="border-2 border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Totonos AIメール
                  <Badge variant="default" className="bg-primary">利用可能</Badge>
                </CardTitle>
                <CardDescription>
                  専用メールアドレスに送信するだけでAIが自動処理
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Inbox className="h-4 w-4" />
                あなたの専用メールアドレス
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-72" />
                </div>
              ) : companyEmails.length > 0 ? (
                <div className="space-y-2">
                  {companyEmails.map((email) => (
                    <div key={email.id} className="flex items-center gap-2">
                      <code className="px-3 py-2 bg-background border rounded text-sm font-mono">
                        {email.fullAddress || `${email.address_prefix}@...`}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {email.purpose === 'general' && '一般'}
                        {email.purpose === 'invoice' && '請求書'}
                        {email.purpose === 'support' && 'サポート'}
                        {email.purpose === 'lead_capture' && 'リード獲得'}
                        {email.purpose === 'contract' && '契約'}
                        {email.purpose === 'recruit' && '採用'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  メールアドレスが設定されていません
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">メールで指示</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  「請求書を作成して」「経費を登録」など自然言語で指示
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">添付ファイル処理</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  領収書画像を添付すると自動でOCR処理して経費登録
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link to="/company-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  メールアドレス設定
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/getting-started">
                  使い方を見る
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 外部メール連携（今後対応予定） */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Link2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  外部メール連携
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    今後対応予定
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Gmail・Outlookとの連携は現在開発中です
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-medium">Gmail連携</p>
                    <p className="text-sm text-muted-foreground">準備中</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gmailからメールを自動でCRMに記録、カレンダー連携
                </p>
              </div>
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📬</span>
                  <div>
                    <p className="font-medium">Outlook連携</p>
                    <p className="text-sm text-muted-foreground">準備中</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Outlookとの双方向同期、Microsoft 365連携
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 外部メール連携に興味がありますか？フィードバックをお寄せください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* カレンダー連携（今後対応予定） */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  カレンダー連携
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    今後対応予定
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Googleカレンダー・Outlookカレンダーとの連携
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 border rounded-lg border-dashed">
                <p className="font-medium text-sm">予定の自動同期</p>
                <p className="text-xs text-muted-foreground mt-1">
                  商談・ミーティングを自動でCRMに記録
                </p>
              </div>
              <div className="p-3 border rounded-lg border-dashed">
                <p className="font-medium text-sm">リマインダー</p>
                <p className="text-xs text-muted-foreground mt-1">
                  予定のリマインダーをAIが送信
                </p>
              </div>
              <div className="p-3 border rounded-lg border-dashed">
                <p className="font-medium text-sm">参加者管理</p>
                <p className="text-xs text-muted-foreground mt-1">
                  参加者をリード・顧客と自動リンク
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* セキュリティ情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              セキュリティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <div className="h-5 w-5 text-primary mb-2">🔐</div>
                <p className="font-medium">送信元検証</p>
                <p className="text-sm text-muted-foreground">
                  登録済みメールアドレスからのみ処理を実行
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="h-5 w-5 text-primary mb-2">🛡️</div>
                <p className="font-medium">暗号化通信</p>
                <p className="text-sm text-muted-foreground">
                  すべてのデータはTLS暗号化で保護
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="h-5 w-5 text-primary mb-2">📋</div>
                <p className="font-medium">監査ログ</p>
                <p className="text-sm text-muted-foreground">
                  すべての処理履歴を記録・追跡可能
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
