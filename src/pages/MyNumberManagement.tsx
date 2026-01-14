import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Shield,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Search,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Trash2,
  History,
  Settings,
  Info,
} from 'lucide-react';

interface MyNumberRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  hasMyNumber: boolean;
  registeredAt?: string;
  lastAccessedAt?: string;
  lastAccessedBy?: string;
  status: 'registered' | 'pending' | 'expired';
}

interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'view' | 'register' | 'update' | 'delete';
  employeeId: string;
  employeeName: string;
  reason: string;
}

// Mock data
const mockRecords: MyNumberRecord[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    employeeName: '山田 太郎',
    department: '営業部',
    hasMyNumber: true,
    registeredAt: '2025-04-01',
    lastAccessedAt: '2026-01-10',
    lastAccessedBy: '管理者',
    status: 'registered',
  },
  {
    id: '2',
    employeeId: 'EMP-002',
    employeeName: '佐藤 花子',
    department: '開発部',
    hasMyNumber: true,
    registeredAt: '2025-04-15',
    lastAccessedAt: '2025-12-25',
    lastAccessedBy: '管理者',
    status: 'registered',
  },
  {
    id: '3',
    employeeId: 'EMP-003',
    employeeName: '鈴木 一郎',
    department: '管理部',
    hasMyNumber: false,
    status: 'pending',
  },
  {
    id: '4',
    employeeId: 'EMP-004',
    employeeName: '田中 美咲',
    department: '人事部',
    hasMyNumber: true,
    registeredAt: '2025-06-01',
    lastAccessedAt: '2026-01-05',
    lastAccessedBy: '管理者',
    status: 'registered',
  },
];

const mockAccessLogs: AccessLog[] = [
  {
    id: '1',
    timestamp: '2026-01-10 14:30:00',
    userId: 'admin-001',
    userName: '管理者',
    action: 'view',
    employeeId: 'EMP-001',
    employeeName: '山田 太郎',
    reason: '年末調整処理',
  },
  {
    id: '2',
    timestamp: '2026-01-05 10:15:00',
    userId: 'admin-001',
    userName: '管理者',
    action: 'view',
    employeeId: 'EMP-004',
    employeeName: '田中 美咲',
    reason: '社会保険届出',
  },
  {
    id: '3',
    timestamp: '2025-12-25 09:00:00',
    userId: 'admin-001',
    userName: '管理者',
    action: 'view',
    employeeId: 'EMP-002',
    employeeName: '佐藤 花子',
    reason: '年末調整処理',
  },
];

function StatusBadge({ status }: { status: MyNumberRecord['status'] }) {
  const config = {
    registered: { label: '登録済み', variant: 'default' as const, icon: CheckCircle },
    pending: { label: '未登録', variant: 'secondary' as const, icon: AlertTriangle },
    expired: { label: '要更新', variant: 'destructive' as const, icon: AlertTriangle },
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

function ActionBadge({ action }: { action: AccessLog['action'] }) {
  const labels = {
    view: '閲覧',
    register: '登録',
    update: '更新',
    delete: '削除',
  };
  return <Badge variant="outline">{labels[action]}</Badge>;
}

export default function MyNumberManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<MyNumberRecord | null>(null);
  const [viewReason, setViewReason] = useState('');
  const [showNumber, setShowNumber] = useState(false);

  const filteredRecords = mockRecords.filter(record => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return record.employeeName.toLowerCase().includes(query) ||
      record.employeeId.toLowerCase().includes(query) ||
      record.department.toLowerCase().includes(query);
  });

  const stats = {
    total: mockRecords.length,
    registered: mockRecords.filter(r => r.hasMyNumber).length,
    pending: mockRecords.filter(r => !r.hasMyNumber).length,
  };

  const handleViewNumber = (record: MyNumberRecord) => {
    setSelectedEmployee(record);
    setViewReason('');
    setShowViewDialog(true);
  };

  const confirmViewNumber = () => {
    if (viewReason.length < 5) {
      alert('閲覧理由を入力してください');
      return;
    }
    setShowNumber(true);
    // In real app, log this access
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              マイナンバー管理
            </h1>
            <p className="text-muted-foreground">
              従業員のマイナンバーを安全に管理
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              アクセスログ
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">セキュリティについて</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  マイナンバーは暗号化して保存されています。
                  閲覧時は理由の入力が必須で、すべてのアクセスが記録されます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>従業員数</CardDescription>
              <CardTitle className="text-2xl">{stats.total}名</CardTitle>
            </CardHeader>
          </Card>
          <Card className={stats.registered === stats.total ? 'border-green-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                登録済み
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.registered}名</CardTitle>
            </CardHeader>
          </Card>
          <Card className={stats.pending > 0 ? 'border-yellow-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                未登録
              </CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{stats.pending}名</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="従業員名、ID、部署で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>マイナンバー登録状況</CardTitle>
            <CardDescription>{filteredRecords.length}名の従業員</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>従業員</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead>最終アクセス</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{record.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell>
                      {record.registeredAt ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {record.registeredAt}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.lastAccessedAt ? (
                        <div className="text-sm">
                          <p>{record.lastAccessedAt}</p>
                          <p className="text-xs text-muted-foreground">by {record.lastAccessedBy}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.hasMyNumber ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewNumber(record)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              閲覧
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(record);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(record);
                              setShowRegisterDialog(true);
                            }}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            登録
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Access Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              最近のアクセスログ
            </CardTitle>
            <CardDescription>直近のマイナンバーアクセス記録</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>アクセス者</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>対象従業員</TableHead>
                  <TableHead>理由</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAccessLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{log.timestamp}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      <ActionBadge action={log.action} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{log.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{log.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マイナンバー登録</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.employeeName}さんのマイナンバーを登録します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">従業員情報</p>
              <p className="font-medium">{selectedEmployee?.employeeName}</p>
              <p className="text-sm">{selectedEmployee?.employeeId} / {selectedEmployee?.department}</p>
            </div>
            <div className="space-y-2">
              <Label>マイナンバー（12桁）</Label>
              <Input
                type="password"
                placeholder="000000000000"
                maxLength={12}
              />
              <p className="text-xs text-muted-foreground">
                入力されたマイナンバーは暗号化して保存されます
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={() => {
              alert('マイナンバーを登録しました');
              setShowRegisterDialog(false);
            }}>
              登録
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={(open) => {
        setShowViewDialog(open);
        if (!open) {
          setShowNumber(false);
          setViewReason('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              マイナンバー閲覧
            </DialogTitle>
            <DialogDescription>
              閲覧理由を入力してください（記録されます）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">対象従業員</p>
              <p className="font-medium">{selectedEmployee?.employeeName}</p>
              <p className="text-sm">{selectedEmployee?.employeeId}</p>
            </div>
            {!showNumber ? (
              <div className="space-y-2">
                <Label>閲覧理由 *</Label>
                <Input
                  value={viewReason}
                  onChange={(e) => setViewReason(e.target.value)}
                  placeholder="例: 年末調整処理、社会保険届出"
                />
              </div>
            ) : (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">マイナンバー</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-widest">
                    1234-5678-9012
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNumber(false)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              閉じる
            </Button>
            {!showNumber && (
              <Button onClick={confirmViewNumber}>
                <Eye className="h-4 w-4 mr-2" />
                閲覧する
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>マイナンバーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedEmployee?.employeeName}さんのマイナンバーを削除します。
              この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                alert('マイナンバーを削除しました');
                setShowDeleteConfirm(false);
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
