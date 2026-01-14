import { useState } from 'react';
import {
  Webhook,
  Plus,
  Trash2,
  MoreVertical,
  RefreshCw,
  Play,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  useWebhooks,
  WEBHOOK_EVENTS,
  type WebhookEvent,
  type Webhook as WebhookType,
  type WebhookDelivery,
} from '@/hooks/useWebhooks';

export function WebhookSettings() {
  const {
    webhooks,
    isLoading,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    regenerateSecret,
    getDeliveries,
    testWebhook,
    refresh,
  } = useWebhooks();

  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null);
  const [viewingDeliveries, setViewingDeliveries] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<WebhookEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormEvents([]);
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (webhook: WebhookType) => {
    setFormName(webhook.name);
    setFormUrl(webhook.url);
    setFormEvents(webhook.events);
    setEditingWebhook(webhook);
    setCreateDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formUrl.trim() || formEvents.length === 0) {
      toast({
        title: 'エラー',
        description: '全ての必須項目を入力してください',
        variant: 'destructive',
      });
      return;
    }

    // Validate URL
    try {
      new URL(formUrl);
    } catch {
      toast({
        title: 'エラー',
        description: '有効なURLを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingWebhook) {
        await updateWebhook(editingWebhook.id, {
          name: formName,
          url: formUrl,
          events: formEvents,
        });
        toast({ title: 'Webhookを更新しました' });
      } else {
        await createWebhook({
          name: formName,
          url: formUrl,
          events: formEvents,
        });
        toast({ title: 'Webhookを作成しました' });
      }
      setCreateDialogOpen(false);
      setEditingWebhook(null);
      resetForm();
    } catch (err) {
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このWebhookを削除してもよろしいですか？')) return;

    const success = await deleteWebhook(id);
    if (success) {
      toast({ title: 'Webhookを削除しました' });
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleWebhook(id, enabled);
    toast({ title: enabled ? 'Webhookを有効にしました' : 'Webhookを無効にしました' });
  };

  const handleTest = async (id: string) => {
    const success = await testWebhook(id);
    if (success) {
      toast({ title: 'テストリクエストを送信しました' });
    }
  };

  const handleRegenerateSecret = async (id: string) => {
    if (!confirm('シークレットを再生成すると、古いシークレットは無効になります。続けますか？')) return;

    const newSecret = await regenerateSecret(id);
    if (newSecret) {
      toast({ title: 'シークレットを再生成しました' });
    }
  };

  const handleCopySecret = async (secret: string, webhookId: string) => {
    await navigator.clipboard.writeText(secret);
    setCopiedSecret(webhookId);
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const handleViewDeliveries = async (webhookId: string) => {
    setViewingDeliveries(webhookId);
    setLoadingDeliveries(true);
    const data = await getDeliveries(webhookId);
    setDeliveries(data);
    setLoadingDeliveries(false);
  };

  const eventToggle = (event: WebhookEvent) => {
    if (formEvents.includes(event)) {
      setFormEvents(formEvents.filter(e => e !== event));
    } else {
      setFormEvents([...formEvents, event]);
    }
  };

  // Group events by category
  const groupedEvents = WEBHOOK_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof WEBHOOK_EVENTS>);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6" />
            Webhook設定
          </h1>
          <p className="text-muted-foreground">
            外部サービスにイベントを通知するWebhookを管理します
          </p>
        </div>
        <Button onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Webhookを追加
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Webhookがありません</h3>
            <p className="text-muted-foreground text-center mt-2">
              Webhookを作成して、イベント発生時に外部サービスに通知を送信しましょう
            </p>
            <Button className="mt-4" onClick={handleCreateOpen}>
              <Plus className="mr-2 h-4 w-4" />
              最初のWebhookを作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={webhook.enabled}
                      onCheckedChange={(checked) => handleToggle(webhook.id, checked)}
                    />
                    <div>
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {webhook.url}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditOpen(webhook)}>
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTest(webhook.id)}>
                        <Play className="mr-2 h-4 w-4" />
                        テスト送信
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDeliveries(webhook.id)}>
                        <Clock className="mr-2 h-4 w-4" />
                        配信履歴
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRegenerateSecret(webhook.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        シークレット再生成
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(webhook.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    配信: {webhook.totalDeliveries}回
                  </span>
                  <span className="text-green-600">
                    成功: {webhook.successfulDeliveries}
                  </span>
                  <span className="text-red-600">
                    失敗: {webhook.failedDeliveries}
                  </span>
                  <span>
                    成功率: {webhook.successRate}%
                  </span>
                  {webhook.lastTriggeredAt && (
                    <span>
                      最終: {new Date(webhook.lastTriggeredAt).toLocaleString('ja-JP')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Webhookを編集' : '新しいWebhook'}
            </DialogTitle>
            <DialogDescription>
              イベント発生時に通知を送信するエンドポイントを設定します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">名前</Label>
              <Input
                id="webhook-name"
                placeholder="例: Slack通知"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://example.com/webhook"
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>イベント</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {events.map(event => (
                        <div key={event.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.value}
                            checked={formEvents.includes(event.value)}
                            onCheckedChange={() => eventToggle(event.value)}
                          />
                          <Label
                            htmlFor={event.value}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : editingWebhook ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliveries Dialog */}
      <Dialog open={!!viewingDeliveries} onOpenChange={() => setViewingDeliveries(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>配信履歴</DialogTitle>
            <DialogDescription>
              最近のWebhook配信の状態を確認できます
            </DialogDescription>
          </DialogHeader>

          {loadingDeliveries ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">配信履歴がありません</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>状態</TableHead>
                    <TableHead>イベント</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>レスポンス時間</TableHead>
                    <TableHead>日時</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map(delivery => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        {delivery.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {WEBHOOK_EVENTS.find(e => e.value === delivery.event)?.label || delivery.event}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {delivery.statusCode ? (
                          <Badge variant={delivery.statusCode < 400 ? 'default' : 'destructive'}>
                            {delivery.statusCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {delivery.durationMs ? `${delivery.durationMs}ms` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(delivery.triggeredAt).toLocaleString('ja-JP')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
