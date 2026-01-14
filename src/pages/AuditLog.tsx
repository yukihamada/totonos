import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuditLog, AuditLogEntry, AuditActionType } from '@/hooks/useAuditLog';
import {
  Shield,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Upload,
  FileDown,
  Clock,
  User,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const actionConfig: Record<AuditActionType, { label: string; icon: typeof Plus; color: string }> = {
  create: { label: '作成', icon: Plus, color: 'text-green-600' },
  read: { label: '閲覧', icon: Eye, color: 'text-blue-600' },
  update: { label: '更新', icon: Pencil, color: 'text-yellow-600' },
  delete: { label: '削除', icon: Trash2, color: 'text-red-600' },
  login: { label: 'ログイン', icon: LogIn, color: 'text-purple-600' },
  logout: { label: 'ログアウト', icon: LogOut, color: 'text-gray-600' },
  export: { label: 'エクスポート', icon: FileDown, color: 'text-cyan-600' },
  import: { label: 'インポート', icon: Upload, color: 'text-orange-600' },
};

const resourceLabels: Record<string, string> = {
  invoices: '請求書',
  contracts: '契約書',
  employees: '従業員',
  leads: 'リード',
  deals: '商談',
  payroll: '給与',
  auth: '認証',
  settings: '設定',
};

function ActionBadge({ action }: { action: AuditActionType }) {
  const config = actionConfig[action];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: 'success' | 'failure' }) {
  if (status === 'success') {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" />
        成功
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3 mr-1" />
      失敗
    </Badge>
  );
}

export default function AuditLog() {
  const { logs, isLoading, filters, setFilters, stats, resourceTypes } = useAuditLog();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, searchQuery: value });
  };

  const handleExport = () => {
    const csv = [
      ['日時', 'ユーザー', 'メール', 'アクション', 'リソース', '詳細', 'IPアドレス', 'ステータス'].join(','),
      ...logs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.userName,
        log.userEmail,
        actionConfig[log.action].label,
        resourceLabels[log.resource] || log.resource,
        log.details || '',
        log.ipAddress,
        log.status === 'success' ? '成功' : '失敗',
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyyMMdd-HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              監査ログ
            </h1>
            <p className="text-muted-foreground">
              システム操作の履歴を記録・監視
            </p>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            CSVエクスポート
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総ログ数</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                成功
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.success}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                失敗
              </CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.failure}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                本日のログ
              </CardDescription>
              <CardTitle className="text-2xl">{stats.today}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.action || 'all'}
                onValueChange={(v) => setFilters({ ...filters, action: v === 'all' ? undefined : v as AuditActionType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="アクション" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのアクション</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.resource || 'all'}
                onValueChange={(v) => setFilters({ ...filters, resource: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="リソース" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのリソース</SelectItem>
                  {resourceTypes.map(resource => (
                    <SelectItem key={resource} value={resource}>
                      {resourceLabels[resource] || resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v as 'success' | 'failure' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのステータス</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failure">失敗</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>ログ一覧</CardTitle>
            <CardDescription>{logs.length}件のログ</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                該当するログがありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日時</TableHead>
                    <TableHead>ユーザー</TableHead>
                    <TableHead>アクション</TableHead>
                    <TableHead>リソース</TableHead>
                    <TableHead>詳細</TableHead>
                    <TableHead>IPアドレス</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className={log.status === 'failure' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(log.timestamp), 'MM/dd HH:mm:ss', { locale: ja })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{log.userName}</p>
                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {resourceLabels[log.resource] || log.resource}
                        </Badge>
                        {log.resourceName && (
                          <p className="text-xs text-muted-foreground mt-1">{log.resourceName}</p>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {log.ipAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
