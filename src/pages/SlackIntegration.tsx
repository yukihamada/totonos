import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Settings,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Bell,
  FileText,
  Users,
  DollarSign,
  Package,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWebhooks, WEBHOOK_EVENTS, type WebhookEvent } from '@/hooks/useWebhooks';

// Slack通知に推奨されるイベント
const SLACK_RECOMMENDED_EVENTS = [
  { event: 'invoice.created' as WebhookEvent, label: '請求書作成', icon: FileText, category: '請求' },
  { event: 'invoice.paid' as WebhookEvent, label: '請求書支払完了', icon: DollarSign, category: '請求' },
  { event: 'invoice.overdue' as WebhookEvent, label: '請求書支払期限超過', icon: Calendar, category: '請求' },
  { event: 'contract.signed' as WebhookEvent, label: '契約締結', icon: FileText, category: '契約' },
  { event: 'contract.expiring' as WebhookEvent, label: '契約期限接近', icon: Calendar, category: '契約' },
  { event: 'deal.won' as WebhookEvent, label: '商談成約', icon: DollarSign, category: '営業' },
  { event: 'lead.created' as WebhookEvent, label: 'リード獲得', icon: Users, category: '営業' },
  { event: 'expense.submitted' as WebhookEvent, label: '経費申請', icon: Package, category: '経費' },
  { event: 'expense.approved' as WebhookEvent, label: '経費承認', icon: CheckCircle, category: '経費' },
];

export default function SlackIntegration() {
  const {
    webhooks,
    isLoading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
  } = useWebhooks();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // 既存のSlack webhookを探す
  const existingSlackWebhook = webhooks.find(w =>
    w.name === 'Slack通知' || w.url.includes('hooks.slack.com')
  );

  // 既存のwebhookがあればフォームに反映
  useEffect(() => {
    if (existingSlackWebhook) {
      setWebhookUrl(existingSlackWebhook.url);
      setSelectedEvents(existingSlackWebhook.events);
    }
  }, [existingSlackWebhook]);

  const handleEventToggle = (event: WebhookEvent) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const handleSelectAll = () => {
    const allEvents = SLACK_RECOMMENDED_EVENTS.map(e => e.event);
    if (selectedEvents.length === allEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(allEvents);
    }
  };

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Webhook URLを入力してください');
      return;
    }

    // URL validation
    if (!webhookUrl.includes('hooks.slack.com')) {
      toast.error('SlackのWebhook URLを入力してください', {
        description: 'URLは https://hooks.slack.com/services/... の形式です',
      });
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error('通知するイベントを1つ以上選択してください');
      return;
    }

    setIsSaving(true);
    try {
      if (existingSlackWebhook) {
        await updateWebhook(existingSlackWebhook.id, {
          url: webhookUrl,
          events: selectedEvents,
        });
        toast.success('Slack連携を更新しました');
      } else {
        await createWebhook({
          name: 'Slack通知',
          url: webhookUrl,
          events: selectedEvents,
        });
        toast.success('Slack連携を設定しました');
      }
    } catch {
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!existingSlackWebhook) {
      toast.error('まず設定を保存してください');
      return;
    }

    setIsTesting(true);
    try {
      const success = await testWebhook(existingSlackWebhook.id);
      if (success) {
        toast.success('テストメッセージを送信しました', {
          description: 'Slackチャンネルを確認してください',
        });
      } else {
        toast.error('テスト送信に失敗しました');
      }
    } catch {
      toast.error('テスト送信に失敗しました');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingSlackWebhook) return;

    if (!confirm('Slack連携を解除してもよろしいですか？')) return;

    try {
      await deleteWebhook(existingSlackWebhook.id);
      setWebhookUrl('');
      setSelectedEvents([]);
      toast.success('Slack連携を解除しました');
    } catch {
      toast.error('解除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Slack連携
            </h1>
            <p className="text-muted-foreground">
              重要なイベントをSlackに通知します
            </p>
          </div>
          {existingSlackWebhook && (
            <Badge variant={existingSlackWebhook.enabled ? 'default' : 'secondary'}>
              {existingSlackWebhook.enabled ? '有効' : '無効'}
            </Badge>
          )}
        </div>

        {/* Connection Status */}
        {existingSlackWebhook && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Slack連携が設定されています
              {existingSlackWebhook.lastTriggeredAt && (
                <span className="ml-2 text-sm text-green-600">
                  (最終通知: {new Date(existingSlackWebhook.lastTriggeredAt).toLocaleString('ja-JP')})
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                設定方法
              </CardTitle>
              <CardDescription>
                Slack Webhook URLの取得方法
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>
                  <a
                    href="https://api.slack.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Slack App管理ページ
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  にアクセス
                </li>
                <li>「Create New App」→「From scratch」を選択</li>
                <li>アプリ名とワークスペースを選択して作成</li>
                <li>「Incoming Webhooks」を有効化</li>
                <li>「Add New Webhook to Workspace」をクリック</li>
                <li>通知を送信するチャンネルを選択</li>
                <li>生成されたWebhook URLをコピー</li>
              </ol>

              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Slack Webhookドキュメント
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook設定</CardTitle>
              <CardDescription>
                SlackのWebhook URLを入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {existingSlackWebhook ? '更新' : '保存'}
                </Button>
                {existingSlackWebhook && (
                  <>
                    <Button variant="outline" onClick={handleTest} disabled={isTesting}>
                      {isTesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      テスト
                    </Button>
                    <Button variant="destructive" onClick={handleDisconnect}>
                      解除
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  通知イベント
                </CardTitle>
                <CardDescription>
                  Slackに通知するイベントを選択してください
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedEvents.length === SLACK_RECOMMENDED_EVENTS.length
                  ? 'すべて解除'
                  : 'すべて選択'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {['請求', '契約', '営業', '経費'].map(category => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                  {SLACK_RECOMMENDED_EVENTS
                    .filter(e => e.category === category)
                    .map(({ event, label, icon: Icon }) => (
                      <div
                        key={event}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedEvents.includes(event)
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => handleEventToggle(event)}
                      >
                        <Checkbox
                          checked={selectedEvents.includes(event)}
                          onCheckedChange={() => handleEventToggle(event)}
                        />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {existingSlackWebhook && (
          <Card>
            <CardHeader>
              <CardTitle>通知統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{existingSlackWebhook.totalDeliveries}</p>
                  <p className="text-sm text-muted-foreground">総通知数</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{existingSlackWebhook.successfulDeliveries}</p>
                  <p className="text-sm text-muted-foreground">成功</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{existingSlackWebhook.failedDeliveries}</p>
                  <p className="text-sm text-muted-foreground">失敗</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{existingSlackWebhook.successRate}%</p>
                  <p className="text-sm text-muted-foreground">成功率</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
