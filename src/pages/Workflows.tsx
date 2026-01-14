import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  FileText,
  Mail,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  DollarSign,
  Calendar,
  Edit,
} from 'lucide-react';

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'invoice_created' | 'payment_received' | 'contract_signed' | 'deal_won' | 'leave_request' | 'schedule';
    config?: Record<string, unknown>;
  };
  actions: {
    type: 'send_email' | 'create_notification' | 'update_status' | 'assign_task' | 'webhook';
    config: Record<string, unknown>;
  }[];
  enabled: boolean;
  lastRun?: Date;
  runCount: number;
  createdAt: Date;
}

const triggerLabels: Record<WorkflowItem['trigger']['type'], { label: string; icon: typeof FileText }> = {
  invoice_created: { label: '請求書作成時', icon: FileText },
  payment_received: { label: '入金確認時', icon: DollarSign },
  contract_signed: { label: '契約署名完了時', icon: FileText },
  deal_won: { label: '商談成約時', icon: CheckCircle },
  leave_request: { label: '休暇申請時', icon: Calendar },
  schedule: { label: 'スケジュール', icon: Clock },
};

const actionLabels: Record<string, string> = {
  send_email: 'メール送信',
  create_notification: '通知作成',
  update_status: 'ステータス更新',
  assign_task: 'タスク割当',
  webhook: 'Webhook',
};

const mockWorkflows: WorkflowItem[] = [
  {
    id: '1',
    name: '請求書送付通知',
    description: '請求書作成時に担当者へメール通知',
    trigger: { type: 'invoice_created' },
    actions: [
      { type: 'send_email', config: { template: 'invoice_created', to: 'sales' } },
      { type: 'create_notification', config: { type: 'info' } },
    ],
    enabled: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2),
    runCount: 156,
    createdAt: new Date('2024-06-01'),
  },
  {
    id: '2',
    name: '入金完了通知',
    description: '入金確認時に経理と営業に通知',
    trigger: { type: 'payment_received' },
    actions: [
      { type: 'send_email', config: { template: 'payment_received', to: 'accountant' } },
      { type: 'update_status', config: { status: 'paid' } },
      { type: 'create_notification', config: { type: 'success' } },
    ],
    enabled: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 30),
    runCount: 89,
    createdAt: new Date('2024-07-15'),
  },
  {
    id: '3',
    name: '商談成約時アクション',
    description: '商談成約時に契約書作成と通知',
    trigger: { type: 'deal_won' },
    actions: [
      { type: 'create_notification', config: { type: 'success' } },
      { type: 'assign_task', config: { task: 'create_contract' } },
    ],
    enabled: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24),
    runCount: 23,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: '4',
    name: '休暇申請承認フロー',
    description: '休暇申請時にマネージャーへ承認依頼',
    trigger: { type: 'leave_request' },
    actions: [
      { type: 'send_email', config: { template: 'leave_approval', to: 'manager' } },
      { type: 'create_notification', config: { type: 'info' } },
    ],
    enabled: false,
    runCount: 45,
    createdAt: new Date('2024-10-01'),
  },
  {
    id: '5',
    name: '週次レポート生成',
    description: '毎週月曜日に週次サマリーを送信',
    trigger: { type: 'schedule', config: { cron: '0 9 * * 1' } },
    actions: [
      { type: 'send_email', config: { template: 'weekly_report', to: 'all_managers' } },
    ],
    enabled: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    runCount: 12,
    createdAt: new Date('2024-11-01'),
  },
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<WorkflowItem['trigger']['type']>('invoice_created');

  const activeCount = workflows.filter((w) => w.enabled).length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runCount, 0);

  const handleToggle = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
    const workflow = workflows.find((w) => w.id === id);
    if (workflow) {
      toast.success(
        workflow.enabled
          ? `${workflow.name}を無効化しました`
          : `${workflow.name}を有効化しました`
      );
    }
  };

  const handleDelete = (workflow: WorkflowItem) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id));
    toast.success(`${workflow.name}を削除しました`);
  };

  const handleCreate = () => {
    if (!newWorkflowName) {
      toast.error('ワークフロー名を入力してください');
      return;
    }
    const newWorkflow: WorkflowItem = {
      id: crypto.randomUUID(),
      name: newWorkflowName,
      description: '',
      trigger: { type: newWorkflowTrigger },
      actions: [],
      enabled: false,
      runCount: 0,
      createdAt: new Date(),
    };
    setWorkflows((prev) => [newWorkflow, ...prev]);
    setCreateDialogOpen(false);
    setNewWorkflowName('');
    toast.success('ワークフローを作成しました');
  };

  const handleRunManually = (workflow: WorkflowItem) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflow.id
          ? { ...w, lastRun: new Date(), runCount: w.runCount + 1 }
          : w
      )
    );
    toast.success(`${workflow.name}を実行しました`);
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
              {activeCount}個のワークフローが有効
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ワークフローを作成</DialogTitle>
                <DialogDescription>
                  トリガーとアクションを設定して自動化
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>ワークフロー名</Label>
                  <Input
                    placeholder="例: 請求書送付通知"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>トリガー</Label>
                  <Select
                    value={newWorkflowTrigger}
                    onValueChange={(v) => setNewWorkflowTrigger(v as WorkflowItem['trigger']['type'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(triggerLabels).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreate}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総ワークフロー数</CardDescription>
              <CardTitle className="text-2xl">{workflows.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有効</CardDescription>
              <CardTitle className="text-2xl text-green-600">{activeCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総実行回数</CardDescription>
              <CardTitle className="text-2xl">{totalRuns}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今月の実行</CardDescription>
              <CardTitle className="text-2xl">
                {workflows.filter(
                  (w) =>
                    w.lastRun &&
                    w.lastRun.getMonth() === new Date().getMonth()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Workflow Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              クイックテンプレート
            </CardTitle>
            <CardDescription>よく使われるワークフローを簡単に追加</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: '支払期限リマインダー',
                  description: '期限3日前に自動リマインド',
                  icon: Clock,
                },
                {
                  name: '新規リード通知',
                  description: '新規リード登録時に営業へ通知',
                  icon: Users,
                },
                {
                  name: '月次レポート自動生成',
                  description: '毎月1日に前月サマリーを送信',
                  icon: Calendar,
                },
              ].map((template) => (
                <Card key={template.name} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <template.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflows List */}
        <Card>
          <CardHeader>
            <CardTitle>ワークフロー一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ワークフロー</TableHead>
                  <TableHead>トリガー</TableHead>
                  <TableHead>アクション数</TableHead>
                  <TableHead>実行回数</TableHead>
                  <TableHead>最終実行</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => {
                  const TriggerIcon = triggerLabels[workflow.trigger.type].icon;
                  return (
                    <TableRow key={workflow.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workflow.description || '説明なし'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <TriggerIcon className="h-3 w-3" />
                          {triggerLabels[workflow.trigger.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {workflow.actions.slice(0, 3).map((action, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {actionLabels[action.type]}
                            </Badge>
                          ))}
                          {workflow.actions.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{workflow.actions.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{workflow.runCount}</TableCell>
                      <TableCell>
                        {workflow.lastRun
                          ? workflow.lastRun.toLocaleDateString('ja-JP')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={workflow.enabled}
                          onCheckedChange={() => handleToggle(workflow.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRunManually(workflow)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(workflow)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
