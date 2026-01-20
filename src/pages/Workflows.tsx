import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Workflow,
  Play,
  Trash2,
  FileText,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  DollarSign,
  Calendar,
  MessageSquare,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useAutomations, useToggleAutomation, useDeleteAutomation, ACTION_TYPE_LABELS, type Automation } from '@/hooks/useAutomations';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const actionIcons: Record<string, typeof FileText> = {
  create_invoice: FileText,
  create_contract: FileText,
  send_email: Mail,
  create_lead: Users,
  create_expense: DollarSign,
  custom: Zap,
};

export default function Workflows() {
  const { data: automations, isLoading } = useAutomations();
  const toggleAutomation = useToggleAutomation();
  const deleteAutomation = useDeleteAutomation();
  
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);

  const activeCount = automations?.filter((a) => a.is_active).length || 0;
  const totalRuns = automations?.reduce((sum, a) => sum + (a.run_count || 0), 0) || 0;

  const handleToggle = (automation: Automation) => {
    toggleAutomation.mutate({ id: automation.id, is_active: !automation.is_active });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAutomation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Workflow className="h-8 w-8" />
              ワークフロー自動化
            </h1>
            <p className="text-muted-foreground">
              AIエージェントで登録した自動タスク
            </p>
          </div>
        </div>

        {/* AI Agent Guide */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              AIエージェントで自動化を登録
            </CardTitle>
            <CardDescription>
              チャットやメール、LINEでAIに指示するだけで自動タスクを登録できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium">チャットで指示</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  「毎月15日にA社へ10万円の請求書を送って」
                </p>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AIが不足情報を確認
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium">メールで指示</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  会社メールに送るだけで自動登録
                </p>
                <Badge variant="secondary" className="text-xs">
                  会社設定からメール確認
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-medium">対応アクション</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">請求書</Badge>
                  <Badge variant="outline" className="text-xs">契約書</Badge>
                  <Badge variant="outline" className="text-xs">メール</Badge>
                  <Badge variant="outline" className="text-xs">経費</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>登録数</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-12" /> : automations?.length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有効</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {isLoading ? <Skeleton className="h-8 w-12" /> : activeCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総実行回数</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalRuns}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>次回実行予定</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  (() => {
                    const nextRun = automations
                      ?.filter((a) => a.is_active && a.next_run_at)
                      .sort((a, b) => 
                        new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime()
                      )[0];
                    return nextRun?.next_run_at
                      ? new Date(nextRun.next_run_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                      : '-';
                  })()
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Example Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              使い方の例
            </CardTitle>
            <CardDescription>AIにこのように指示してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  prompt: '毎月1日にA社へ月額10万円の請求書を自動発行して',
                  action: '請求書',
                  icon: FileText,
                },
                {
                  prompt: 'B社との清掃契約を毎年4月1日に自動更新して',
                  action: '契約書',
                  icon: FileText,
                },
                {
                  prompt: '毎週月曜日に週次レポートをmanager@example.comに送って',
                  action: 'メール',
                  icon: Mail,
                },
                {
                  prompt: '毎月25日に家賃15万円の経費を自動登録して',
                  action: '経費',
                  icon: DollarSign,
                },
              ].map((example, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <example.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">&ldquo;{example.prompt}&rdquo;</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {example.action}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Automations List */}
        <Card>
          <CardHeader>
            <CardTitle>登録済み自動化</CardTitle>
            <CardDescription>
              AIエージェントで登録した自動タスクの一覧
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !automations || automations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">まだ自動化がありません</p>
                <p className="text-sm">
                  AIチャットで「毎月15日にA社へ請求書を送って」のように指示してください
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>自動化</TableHead>
                    <TableHead>アクション</TableHead>
                    <TableHead>スケジュール</TableHead>
                    <TableHead>クライアント</TableHead>
                    <TableHead>実行回数</TableHead>
                    <TableHead>次回実行</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map((automation) => {
                    const ActionIcon = actionIcons[automation.action_type] || Zap;
                    const actionLabel = ACTION_TYPE_LABELS[automation.action_type]?.label || automation.action_type;
                    
                    return (
                      <TableRow key={automation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{automation.name}</p>
                            {automation.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {automation.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <ActionIcon className="h-3 w-3" />
                            {actionLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {automation.schedule_description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {automation.clients?.name || '-'}
                        </TableCell>
                        <TableCell>{automation.run_count}</TableCell>
                        <TableCell>
                          {automation.next_run_at ? (
                            <span className="text-sm">
                              {new Date(automation.next_run_at).toLocaleDateString('ja-JP')}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={() => handleToggle(automation)}
                            />
                            {automation.last_error && (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteTarget(automation)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>自動化を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.name}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
