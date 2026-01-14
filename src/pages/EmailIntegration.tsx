import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Calendar,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  ArrowRight,
  Settings,
  Shield,
  Inbox,
  Send,
  Activity,
} from 'lucide-react';

interface EmailAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'other';
  email: string;
  connected: boolean;
  lastSync?: string;
  syncEnabled: boolean;
  autoLog: boolean;
}

interface SyncedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  linkedTo?: {
    type: 'lead' | 'deal' | 'client';
    name: string;
    id: string;
  };
  status: 'synced' | 'pending' | 'error';
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  linkedTo?: {
    type: 'lead' | 'deal' | 'client';
    name: string;
  };
}

// Mock data
const mockAccounts: EmailAccount[] = [
  {
    id: '1',
    provider: 'gmail',
    email: 'sales@example.com',
    connected: true,
    lastSync: '2026-01-14 10:30',
    syncEnabled: true,
    autoLog: true,
  },
  {
    id: '2',
    provider: 'outlook',
    email: 'team@company.co.jp',
    connected: false,
    syncEnabled: false,
    autoLog: false,
  },
];

const mockEmails: SyncedEmail[] = [
  {
    id: '1',
    from: 'tanaka@techinnovation.co.jp',
    to: 'sales@example.com',
    subject: 'Re: 御社サービスについてのお問い合わせ',
    date: '2026-01-14 09:45',
    linkedTo: { type: 'lead', name: '株式会社テックイノベーション', id: 'lead-1' },
    status: 'synced',
  },
  {
    id: '2',
    from: 'sales@example.com',
    to: 'yamamoto@globalsolutions.jp',
    subject: '見積書送付のご連絡',
    date: '2026-01-13 16:20',
    linkedTo: { type: 'deal', name: 'グローバルソリューションズ案件', id: 'deal-1' },
    status: 'synced',
  },
  {
    id: '3',
    from: 'info@newcompany.com',
    to: 'sales@example.com',
    subject: '製品デモのご依頼',
    date: '2026-01-13 11:00',
    status: 'pending',
  },
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '商談ミーティング',
    date: '2026-01-15',
    time: '14:00-15:00',
    attendees: ['tanaka@techinnovation.co.jp'],
    linkedTo: { type: 'deal', name: 'テックイノベーション案件' },
  },
  {
    id: '2',
    title: '製品デモ',
    date: '2026-01-16',
    time: '10:00-11:30',
    attendees: ['sato@startupABC.com', 'suzuki@startupABC.com'],
    linkedTo: { type: 'lead', name: 'スタートアップABC' },
  },
];

const providerLogos: Record<string, string> = {
  gmail: '📧',
  outlook: '📬',
  other: '✉️',
};

function StatusBadge({ status }: { status: SyncedEmail['status'] }) {
  const config = {
    synced: { label: '同期済み', variant: 'default' as const, icon: CheckCircle },
    pending: { label: '保留中', variant: 'secondary' as const, icon: Clock },
    error: { label: 'エラー', variant: 'destructive' as const, icon: AlertTriangle },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <Badge variant={c.variant}>
      <Icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

function LinkedBadge({ linkedTo }: { linkedTo?: SyncedEmail['linkedTo'] }) {
  if (!linkedTo) {
    return <Badge variant="outline" className="text-muted-foreground">未リンク</Badge>;
  }
  const icons = {
    lead: User,
    deal: Building2,
    client: Building2,
  };
  const Icon = icons[linkedTo.type];
  return (
    <Badge variant="outline" className="text-blue-600">
      <Icon className="h-3 w-3 mr-1" />
      {linkedTo.name}
    </Badge>
  );
}

export default function EmailIntegration() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = (provider: string) => {
    // In real app, this would open OAuth flow
    alert(`${provider}への接続を開始します`);
  };

  const handleDisconnect = (accountId: string) => {
    setAccounts(prev => prev.map(a =>
      a.id === accountId ? { ...a, connected: false } : a
    ));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const connectedAccounts = accounts.filter(a => a.connected);
  const syncedEmailCount = mockEmails.filter(e => e.status === 'synced').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-8 w-8" />
              メール・カレンダー連携
            </h1>
            <p className="text-muted-foreground">
              Gmail/Outlookと連携してメールを自動でCRMに記録
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            同期
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>連携アカウント</CardDescription>
              <CardTitle className="text-2xl">{connectedAccounts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Inbox className="h-4 w-4" />
                同期済みメール
              </CardDescription>
              <CardTitle className="text-2xl">{syncedEmailCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                今週の予定
              </CardDescription>
              <CardTitle className="text-2xl">{mockCalendarEvents.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                自動記録
              </CardDescription>
              <CardTitle className="text-2xl">有効</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              連携アカウント
            </CardTitle>
            <CardDescription>
              メールプロバイダーとの連携設定
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border ${account.connected ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{providerLogos[account.provider]}</span>
                      <div>
                        <p className="font-medium">{account.email}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.provider}
                          {account.connected && account.lastSync && (
                            <span> • 最終同期: {account.lastSync}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {account.connected ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={account.syncEnabled}
                              onCheckedChange={(checked) => {
                                setAccounts(prev => prev.map(a =>
                                  a.id === account.id ? { ...a, syncEnabled: checked } : a
                                ));
                              }}
                            />
                            <Label className="text-sm">自動同期</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={account.autoLog}
                              onCheckedChange={(checked) => {
                                setAccounts(prev => prev.map(a =>
                                  a.id === account.id ? { ...a, autoLog: checked } : a
                                ));
                              }}
                            />
                            <Label className="text-sm">自動記録</Label>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            連携中
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(account.id)}
                          >
                            <Unlink className="h-4 w-4 mr-1" />
                            解除
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => handleConnect(account.provider)}>
                          <Link2 className="h-4 w-4 mr-2" />
                          連携する
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Account */}
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">新しいアカウントを追加</p>
                    <p className="text-sm text-muted-foreground">
                      Gmail、Outlook、その他のメールサービス
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleConnect('gmail')}>
                      <span className="mr-2">📧</span>
                      Gmail
                    </Button>
                    <Button variant="outline" onClick={() => handleConnect('outlook')}>
                      <span className="mr-2">📬</span>
                      Outlook
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              最近の同期メール
            </CardTitle>
            <CardDescription>
              自動で取り込まれたメール
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>件名</TableHead>
                  <TableHead>送信元/送信先</TableHead>
                  <TableHead>日時</TableHead>
                  <TableHead>リンク先</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEmails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell>
                      {email.from.includes('example.com') ? (
                        <Send className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Inbox className="h-4 w-4 text-green-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {email.subject}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{email.from}</p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {email.to}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {email.date}
                    </TableCell>
                    <TableCell>
                      <LinkedBadge linkedTo={email.linkedTo} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={email.status} />
                    </TableCell>
                    <TableCell>
                      {!email.linkedTo && (
                        <Button variant="outline" size="sm">
                          リンク
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Calendar Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              今後の予定
            </CardTitle>
            <CardDescription>
              カレンダーから同期された予定
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCalendarEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center p-2 bg-primary/10 rounded-lg min-w-16">
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm font-medium">{event.time.split('-')[0]}</p>
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        参加者: {event.attendees.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.linkedTo && (
                      <Badge variant="outline" className="text-blue-600">
                        <Building2 className="h-3 w-3 mr-1" />
                        {event.linkedTo.name}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      詳細
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
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
                <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                <p className="font-medium">OAuth 2.0認証</p>
                <p className="text-sm text-muted-foreground">
                  パスワードを保存せず安全に連携
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                <p className="font-medium">暗号化通信</p>
                <p className="text-sm text-muted-foreground">
                  すべてのデータはTLS暗号化
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                <p className="font-medium">権限制限</p>
                <p className="text-sm text-muted-foreground">
                  必要最小限のアクセス権限のみ要求
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
