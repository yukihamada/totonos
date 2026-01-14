import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitBranch,
  Plus,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalStep {
  id: string;
  order: number;
  type: 'single' | 'any' | 'all';
  approvers: { id: string; name: string; role: string }[];
  conditions?: { field: string; operator: string; value: string }[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

interface PendingApproval {
  id: string;
  type: string;
  title: string;
  requester: string;
  requestDate: string;
  amount?: number;
  currentStep: number;
  totalSteps: number;
  status: 'pending' | 'approved' | 'rejected';
  dueDate?: string;
  details: Record<string, string>;
}

const mockTemplates: WorkflowTemplate[] = [
  {
    id: '1',
    name: '経費申請フロー',
    description: '経費精算の承認ワークフロー',
    category: '経費',
    isActive: true,
    steps: [
      {
        id: 's1',
        order: 1,
        type: 'single',
        approvers: [{ id: 'u1', name: '直属上長', role: 'マネージャー' }],
        conditions: [{ field: 'amount', operator: '<', value: '50000' }],
      },
      {
        id: 's2',
        order: 2,
        type: 'single',
        approvers: [{ id: 'u2', name: '部長', role: '部長' }],
        conditions: [{ field: 'amount', operator: '>=', value: '50000' }],
      },
      {
        id: 's3',
        order: 3,
        type: 'single',
        approvers: [{ id: 'u3', name: '経理部', role: '経理担当' }],
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: '2',
    name: '見積承認フロー',
    description: '見積書の社内承認ワークフロー',
    category: '営業',
    isActive: true,
    steps: [
      {
        id: 's1',
        order: 1,
        type: 'single',
        approvers: [{ id: 'u1', name: '営業マネージャー', role: 'マネージャー' }],
      },
      {
        id: 's2',
        order: 2,
        type: 'any',
        approvers: [
          { id: 'u2', name: '営業部長', role: '部長' },
          { id: 'u3', name: '副部長', role: '副部長' },
        ],
        conditions: [{ field: 'amount', operator: '>=', value: '1000000' }],
      },
      {
        id: 's3',
        order: 3,
        type: 'single',
        approvers: [{ id: 'u4', name: '取締役', role: '役員' }],
        conditions: [{ field: 'amount', operator: '>=', value: '5000000' }],
      },
    ],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-20T14:00:00Z',
  },
  {
    id: '3',
    name: '休暇申請フロー',
    description: '有給休暇・特別休暇の申請承認',
    category: '人事',
    isActive: true,
    steps: [
      {
        id: 's1',
        order: 1,
        type: 'single',
        approvers: [{ id: 'u1', name: '直属上長', role: 'マネージャー' }],
      },
      {
        id: 's2',
        order: 2,
        type: 'single',
        approvers: [{ id: 'u2', name: '人事部', role: '人事担当' }],
        conditions: [{ field: 'days', operator: '>=', value: '5' }],
      },
    ],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
];

const mockPendingApprovals: PendingApproval[] = [
  {
    id: '1',
    type: '経費申請',
    title: '交通費精算（3月分）',
    requester: '山田太郎',
    requestDate: '2024-03-15T10:00:00Z',
    amount: 35000,
    currentStep: 1,
    totalSteps: 3,
    status: 'pending',
    dueDate: '2024-03-20',
    details: {
      '期間': '2024年3月1日〜3月31日',
      '内訳': '電車代 25,000円、タクシー代 10,000円',
    },
  },
  {
    id: '2',
    type: '見積承認',
    title: 'ABC社向けシステム開発見積',
    requester: '鈴木花子',
    requestDate: '2024-03-14T14:00:00Z',
    amount: 3500000,
    currentStep: 2,
    totalSteps: 3,
    status: 'pending',
    details: {
      '顧客': '株式会社ABC',
      '案件': 'ERPシステム導入',
      '納期': '2024年9月末',
    },
  },
  {
    id: '3',
    type: '休暇申請',
    title: '有給休暇（4/1-4/5）',
    requester: '田中一郎',
    requestDate: '2024-03-13T09:00:00Z',
    currentStep: 1,
    totalSteps: 2,
    status: 'pending',
    dueDate: '2024-03-25',
    details: {
      '種類': '有給休暇',
      '日数': '5日間',
      '理由': '帰省のため',
    },
  },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '経費': DollarSign,
  '営業': FileText,
  '人事': Calendar,
};

const stepTypeLabels = {
  single: '単一承認者',
  any: 'いずれか1名',
  all: '全員承認',
};

export default function ApprovalWorkflow() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApprove = () => {
    // Implement approval logic
    setShowApprovalDialog(false);
    setSelectedApproval(null);
    setApprovalComment('');
  };

  const handleReject = () => {
    // Implement rejection logic
    setShowApprovalDialog(false);
    setSelectedApproval(null);
    setApprovalComment('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GitBranch className="h-8 w-8 text-primary" />
              承認ワークフロー
            </h1>
            <p className="text-muted-foreground">
              複数承認者対応のワークフロー管理
            </p>
          </div>
          <Button onClick={() => setShowNewTemplateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新規テンプレート
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">承認待ち</p>
                  <p className="text-2xl font-bold">
                    {mockPendingApprovals.filter((a) => a.status === 'pending').length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">今日の期限</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">今月承認済</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">有効テンプレート</p>
                  <p className="text-2xl font-bold">
                    {mockTemplates.filter((t) => t.isActive).length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="pending">承認待ち</TabsTrigger>
            <TabsTrigger value="templates">テンプレート</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>あなたの承認待ち</CardTitle>
                <CardDescription>承認が必要な申請一覧</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingApprovals.map((approval) => {
                    const CategoryIcon = categoryIcons[approval.type.replace('申請', '').replace('承認', '')] || FileText;
                    return (
                      <div
                        key={approval.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowApprovalDialog(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{approval.title}</h4>
                                <Badge variant="outline">{approval.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                申請者: {approval.requester} • {formatDate(approval.requestDate)}
                              </p>
                              {approval.amount && (
                                <p className="text-lg font-semibold mt-1">
                                  {formatCurrency(approval.amount)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-muted-foreground">ステップ</span>
                              <Badge variant="secondary">
                                {approval.currentStep}/{approval.totalSteps}
                              </Badge>
                            </div>
                            {approval.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                期限: {approval.dueDate}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-2 mt-4">
                          {Array.from({ length: approval.totalSteps }).map((_, i) => (
                            <div key={i} className="flex items-center">
                              <div
                                className={cn(
                                  'h-6 w-6 rounded-full flex items-center justify-center text-xs',
                                  i < approval.currentStep - 1
                                    ? 'bg-green-500 text-white'
                                    : i === approval.currentStep - 1
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                )}
                              >
                                {i < approval.currentStep - 1 ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  i + 1
                                )}
                              </div>
                              {i < approval.totalSteps - 1 && (
                                <div
                                  className={cn(
                                    'h-0.5 w-8',
                                    i < approval.currentStep - 1 ? 'bg-green-500' : 'bg-gray-200'
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {mockPendingApprovals.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>承認待ちの申請はありません</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="space-y-4">
              {mockTemplates.map((template) => {
                const CategoryIcon = categoryIcons[template.category] || FileText;
                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CategoryIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                {template.isActive ? '有効' : '無効'}
                              </Badge>
                            </div>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={template.isActive} />
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.steps.map((step, i) => (
                          <div key={step.id} className="flex items-center">
                            <div className="border rounded-lg p-3 bg-muted/50">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">ステップ {step.order}</span>
                                <Badge variant="outline" className="text-xs">
                                  {stepTypeLabels[step.type]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 flex-wrap">
                                {step.approvers.map((approver, j) => (
                                  <Badge key={j} variant="secondary" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    {approver.name}
                                  </Badge>
                                ))}
                              </div>
                              {step.conditions && step.conditions.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  条件: {step.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(', ')}
                                </p>
                              )}
                            </div>
                            {i < template.steps.length - 1 && (
                              <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        最終更新: {formatDate(template.updatedAt)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>承認履歴</CardTitle>
                <CardDescription>過去の承認・却下の履歴</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申請</TableHead>
                      <TableHead>申請者</TableHead>
                      <TableHead>結果</TableHead>
                      <TableHead>処理日</TableHead>
                      <TableHead>コメント</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div>
                          <p className="font-medium">交通費精算（2月分）</p>
                          <p className="text-xs text-muted-foreground">経費申請</p>
                        </div>
                      </TableCell>
                      <TableCell>山田太郎</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          承認
                        </Badge>
                      </TableCell>
                      <TableCell>2024/03/05</TableCell>
                      <TableCell className="text-sm text-muted-foreground">問題ありません</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div>
                          <p className="font-medium">XYZ社向け見積</p>
                          <p className="text-xs text-muted-foreground">見積承認</p>
                        </div>
                      </TableCell>
                      <TableCell>鈴木花子</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          却下
                        </Badge>
                      </TableCell>
                      <TableCell>2024/03/03</TableCell>
                      <TableCell className="text-sm text-muted-foreground">価格の再検討が必要</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div>
                          <p className="font-medium">有給休暇（3/10-3/12）</p>
                          <p className="text-xs text-muted-foreground">休暇申請</p>
                        </div>
                      </TableCell>
                      <TableCell>佐藤次郎</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          承認
                        </Badge>
                      </TableCell>
                      <TableCell>2024/03/01</TableCell>
                      <TableCell className="text-sm text-muted-foreground">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedApproval?.title}</DialogTitle>
            <DialogDescription>
              {selectedApproval?.type} • 申請者: {selectedApproval?.requester}
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4 py-4">
              {selectedApproval.amount && (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">申請金額</p>
                  <p className="text-3xl font-bold">{formatCurrency(selectedApproval.amount)}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">詳細情報</h4>
                {Object.entries(selectedApproval.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium">コメント（任意）</label>
                <Textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="承認・却下の理由やコメントを入力..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              却下
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              承認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規ワークフローテンプレート</DialogTitle>
            <DialogDescription>
              承認フローのテンプレートを作成します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">テンプレート名</label>
                <Input placeholder="例: 経費申請フロー" className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">カテゴリ</label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">経費</SelectItem>
                    <SelectItem value="sales">営業</SelectItem>
                    <SelectItem value="hr">人事</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">説明</label>
              <Textarea placeholder="ワークフローの説明を入力..." className="mt-2" />
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">承認ステップ</h4>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  ステップ追加
                </Button>
              </div>

              <div className="space-y-3">
                <div className="border rounded p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ステップ 1</span>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="single">
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">単一承認者</SelectItem>
                          <SelectItem value="any">いずれか1名</SelectItem>
                          <SelectItem value="all">全員承認</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="承認者を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">直属上長</SelectItem>
                        <SelectItem value="dept_head">部長</SelectItem>
                        <SelectItem value="accounting">経理部</SelectItem>
                        <SelectItem value="hr">人事部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
              キャンセル
            </Button>
            <Button>作成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
