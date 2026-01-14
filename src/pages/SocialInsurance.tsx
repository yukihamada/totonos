import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  Shield,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
  UserPlus,
  UserMinus,
  RefreshCw,
  Download,
  Eye,
  Plus,
  Search,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  type: string;
  category: 'health_pension' | 'employment' | 'workers_comp';
  employeeName: string;
  employeeId: string;
  status: 'draft' | 'pending' | 'submitted' | 'completed' | 'rejected';
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  receiptNumber?: string;
  note?: string;
}

interface ProcedureType {
  id: string;
  name: string;
  category: 'health_pension' | 'employment' | 'workers_comp';
  description: string;
  requiredDocs: string[];
  deadline?: string;
}

const procedureTypes: ProcedureType[] = [
  {
    id: 'hp-join',
    name: '健康保険・厚生年金保険 資格取得届',
    category: 'health_pension',
    description: '従業員が入社した際に届出',
    requiredDocs: ['マイナンバー', '年金手帳基礎年金番号', '被扶養者情報（該当者のみ）'],
    deadline: '入社日から5日以内',
  },
  {
    id: 'hp-leave',
    name: '健康保険・厚生年金保険 資格喪失届',
    category: 'health_pension',
    description: '従業員が退職した際に届出',
    requiredDocs: ['健康保険証', 'マイナンバー'],
    deadline: '退職日から5日以内',
  },
  {
    id: 'hp-dependent',
    name: '被扶養者（異動）届',
    category: 'health_pension',
    description: '扶養家族に変更があった際に届出',
    requiredDocs: ['マイナンバー', '収入証明', '続柄証明'],
    deadline: '異動日から5日以内',
  },
  {
    id: 'hp-monthly',
    name: '算定基礎届',
    category: 'health_pension',
    description: '毎年7月の定時決定',
    requiredDocs: ['4〜6月の給与データ'],
    deadline: '7月10日まで',
  },
  {
    id: 'emp-join',
    name: '雇用保険 資格取得届',
    category: 'employment',
    description: '従業員が入社した際に届出',
    requiredDocs: ['マイナンバー', '雇用保険被保険者番号（再取得の場合）'],
    deadline: '入社日の翌月10日まで',
  },
  {
    id: 'emp-leave',
    name: '雇用保険 資格喪失届・離職証明書',
    category: 'employment',
    description: '従業員が退職した際に届出',
    requiredDocs: ['離職理由', '賃金データ（過去6ヶ月）'],
    deadline: '退職日の翌日から10日以内',
  },
  {
    id: 'wc-join',
    name: '労災保険 適用事業届',
    category: 'workers_comp',
    description: '新規に従業員を雇用した場合',
    requiredDocs: ['事業所情報', '従業員数'],
    deadline: '事業開始から10日以内',
  },
];

const mockApplications: Application[] = [
  {
    id: '1',
    type: '健康保険・厚生年金保険 資格取得届',
    category: 'health_pension',
    employeeName: '山田太郎',
    employeeId: 'EMP001',
    status: 'completed',
    createdAt: '2024-03-01T10:00:00Z',
    submittedAt: '2024-03-01T11:00:00Z',
    completedAt: '2024-03-05T09:00:00Z',
    receiptNumber: 'R2024030500001',
  },
  {
    id: '2',
    type: '雇用保険 資格取得届',
    category: 'employment',
    employeeName: '山田太郎',
    employeeId: 'EMP001',
    status: 'completed',
    createdAt: '2024-03-01T10:30:00Z',
    submittedAt: '2024-03-01T11:30:00Z',
    completedAt: '2024-03-03T14:00:00Z',
    receiptNumber: 'R2024030300015',
  },
  {
    id: '3',
    type: '被扶養者（異動）届',
    category: 'health_pension',
    employeeName: '鈴木花子',
    employeeId: 'EMP002',
    status: 'submitted',
    createdAt: '2024-03-10T09:00:00Z',
    submittedAt: '2024-03-10T10:00:00Z',
    receiptNumber: 'R2024031000042',
  },
  {
    id: '4',
    type: '健康保険・厚生年金保険 資格喪失届',
    category: 'health_pension',
    employeeName: '田中一郎',
    employeeId: 'EMP003',
    status: 'pending',
    createdAt: '2024-03-12T14:00:00Z',
    note: '健康保険証の回収待ち',
  },
  {
    id: '5',
    type: '雇用保険 資格喪失届・離職証明書',
    category: 'employment',
    employeeName: '田中一郎',
    employeeId: 'EMP003',
    status: 'draft',
    createdAt: '2024-03-12T14:30:00Z',
    note: '離職理由の確認が必要',
  },
];

const statusConfig = {
  draft: { label: '下書き', icon: FileText, color: 'bg-gray-100 text-gray-700' },
  pending: { label: '準備中', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  submitted: { label: '申請済', icon: Send, color: 'bg-blue-100 text-blue-700' },
  completed: { label: '完了', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  rejected: { label: '差戻し', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

const categoryConfig = {
  health_pension: { label: '健康保険・厚生年金', color: 'bg-blue-500' },
  employment: { label: '雇用保険', color: 'bg-green-500' },
  workers_comp: { label: '労災保険', color: 'bg-orange-500' },
};

export default function SocialInsurance() {
  const [selectedTab, setSelectedTab] = useState('applications');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    draft: mockApplications.filter((a) => a.status === 'draft').length,
    pending: mockApplications.filter((a) => a.status === 'pending').length,
    submitted: mockApplications.filter((a) => a.status === 'submitted').length,
    completed: mockApplications.filter((a) => a.status === 'completed').length,
  };

  const filteredApplications = mockApplications.filter(
    (app) =>
      app.employeeName.includes(searchQuery) ||
      app.type.includes(searchQuery) ||
      app.employeeId.includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              社会保険電子申請
            </h1>
            <p className="text-muted-foreground">
              e-Gov連携による社会保険・労働保険の電子申請
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="https://www.e-gov.go.jp/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                e-Gov
              </a>
            </Button>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新規申請
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">下書き</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">準備中</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
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
                  <p className="text-sm text-muted-foreground">申請済</p>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">完了</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="applications">申請一覧</TabsTrigger>
            <TabsTrigger value="procedures">手続き種類</TabsTrigger>
            <TabsTrigger value="settings">e-Gov設定</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>申請一覧</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="従業員名・手続きで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>手続き</TableHead>
                      <TableHead>従業員</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>作成日</TableHead>
                      <TableHead>受付番号</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const StatusIcon = statusConfig[app.status].icon;
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-1 h-10 rounded',
                                  categoryConfig[app.category].color
                                )}
                              />
                              <div>
                                <p className="font-medium text-sm">{app.type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {categoryConfig[app.category].label}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{app.employeeId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[app.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[app.status].label}
                            </Badge>
                            {app.note && (
                              <p className="text-xs text-muted-foreground mt-1">{app.note}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{formatDate(app.createdAt)}</p>
                            {app.completedAt && (
                              <p className="text-xs text-muted-foreground">
                                完了: {formatDate(app.completedAt)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {app.receiptNumber ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {app.receiptNumber}
                              </code>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {app.status === 'draft' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              {app.status === 'completed' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procedures" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Health & Pension */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    健康保険・厚生年金
                  </CardTitle>
                  <CardDescription>日本年金機構への届出</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {procedureTypes
                    .filter((p) => p.category === 'health_pension')
                    .map((proc) => (
                      <div
                        key={proc.id}
                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setSelectedProcedure(proc.id);
                          setShowNewDialog(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{proc.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {proc.description}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {proc.deadline && (
                          <p className="text-xs text-amber-600 mt-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {proc.deadline}
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Employment Insurance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    雇用保険
                  </CardTitle>
                  <CardDescription>ハローワークへの届出</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {procedureTypes
                    .filter((p) => p.category === 'employment')
                    .map((proc) => (
                      <div
                        key={proc.id}
                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setSelectedProcedure(proc.id);
                          setShowNewDialog(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{proc.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {proc.description}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {proc.deadline && (
                          <p className="text-xs text-amber-600 mt-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {proc.deadline}
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Workers Comp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    労災保険
                  </CardTitle>
                  <CardDescription>労働基準監督署への届出</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {procedureTypes
                    .filter((p) => p.category === 'workers_comp')
                    .map((proc) => (
                      <div
                        key={proc.id}
                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setSelectedProcedure(proc.id);
                          setShowNewDialog(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{proc.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {proc.description}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {proc.deadline && (
                          <p className="text-xs text-amber-600 mt-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {proc.deadline}
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>e-Gov連携設定</CardTitle>
                <CardDescription>
                  e-Gov APIを利用した電子申請の設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">e-Gov連携について</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        e-Gov APIを利用するには、GビズIDの取得が必要です。
                        また、電子証明書の設定も必要となる場合があります。
                      </p>
                      <Button variant="link" className="px-0 mt-2" asChild>
                        <a
                          href="https://www.e-gov.go.jp/help/shinsei/procedure/api.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          詳しくはこちら
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">GビズID</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input placeholder="gbizid_xxxx@example.com" className="max-w-md" />
                      <Badge variant="outline" className="text-amber-600">
                        未認証
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">事業所番号</label>
                    <Input placeholder="例: 13-0123456" className="max-w-md mt-2" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">電子証明書</label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline">
                        証明書をアップロード
                      </Button>
                      <span className="text-sm text-muted-foreground">未設定</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button>設定を保存</Button>
                  <Button variant="outline">接続テスト</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Application Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新規申請作成</DialogTitle>
            <DialogDescription>
              申請する手続きと従業員を選択してください
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">手続き種類</label>
              <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="手続きを選択" />
                </SelectTrigger>
                <SelectContent>
                  {procedureTypes.map((proc) => (
                    <SelectItem key={proc.id} value={proc.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            categoryConfig[proc.category].color
                          )}
                        />
                        {proc.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">対象従業員</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="従業員を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp001">山田太郎 (EMP001)</SelectItem>
                  <SelectItem value="emp002">鈴木花子 (EMP002)</SelectItem>
                  <SelectItem value="emp003">田中一郎 (EMP003)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedProcedure && (
              <div className="border rounded-lg p-3 bg-muted/50">
                <h4 className="text-sm font-medium mb-2">必要書類</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {procedureTypes
                    .find((p) => p.id === selectedProcedure)
                    ?.requiredDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        {doc}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              キャンセル
            </Button>
            <Button disabled={!selectedProcedure}>
              申請を作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
