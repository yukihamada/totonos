import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  History,
  Download,
  Search,
  Filter,
  Gift,
  Zap,
  CreditCard,
  RefreshCw,
  Users,
  ArrowLeft,
  Calendar,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { CREDIT_COSTS } from '@/hooks/useCredits';

type TransactionType = 'grant' | 'consume' | 'charge' | 'refund' | 'referral' | 'all';

interface CreditLog {
  id: string;
  type: TransactionType;
  amount: number;
  balance: number;
  reason: string;
  action?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export default function CreditLogs() {
  const { currentOrganization } = useOrganization();
  const companyId = currentOrganization?.id;
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // DBからクレジット履歴を取得
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['credit-logs', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) {
        console.error('Failed to fetch credit logs:', error);
        throw error;
      }
      
      return (data || []).map(log => ({
        id: log.id,
        type: log.transaction_type as CreditLog['type'],
        amount: log.amount,
        balance: log.balance_after,
        reason: log.description || log.action || '',
        action: log.action,
        metadata: log.metadata as Record<string, unknown> | undefined,
        createdAt: new Date(log.created_at),
      }));
    },
    enabled: !!companyId,
  });

  // フィルタリング
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // タイプフィルター
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;

      // 検索フィルター
      if (searchQuery && !log.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 日付フィルター
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (log.createdAt < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (log.createdAt > to) return false;
      }

      return true;
    });
  }, [logs, typeFilter, searchQuery, dateFrom, dateTo]);

  // 統計計算
  const stats = useMemo(() => {
    const consumed = filteredLogs
      .filter((l) => l.type === 'consume')
      .reduce((sum, l) => sum + Math.abs(l.amount), 0);
    const charged = filteredLogs
      .filter((l) => l.type === 'charge')
      .reduce((sum, l) => sum + l.amount, 0);
    const referral = filteredLogs
      .filter((l) => l.type === 'referral')
      .reduce((sum, l) => sum + l.amount, 0);
    const granted = filteredLogs
      .filter((l) => l.type === 'grant')
      .reduce((sum, l) => sum + l.amount, 0);

    return { consumed, charged, referral, granted };
  }, [filteredLogs]);

  // CSVエクスポート
  const handleExportCSV = () => {
    const headers = ['日時', 'タイプ', '説明', 'アクション', '金額', '残高'];
    const rows = filteredLogs.map((log) => [
      format(log.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      log.type,
      log.reason,
      log.action || '',
      log.amount.toString(),
      log.balance.toString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-logs-${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSVをダウンロードしました');
  };

  // JSONエクスポート
  const handleExportJSON = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-logs-${format(new Date(), 'yyyyMMdd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('JSONをダウンロードしました');
  };

  const getTypeIcon = (type: CreditLog['type']) => {
    switch (type) {
      case 'grant':
        return <Gift className="h-4 w-4 text-purple-500" />;
      case 'consume':
        return <Zap className="h-4 w-4 text-gray-500" />;
      case 'charge':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-green-500" />;
      case 'referral':
        return <Users className="h-4 w-4 text-pink-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: CreditLog['type']) => {
    const variants: Record<string, { label: string; className: string }> = {
      grant: { label: '付与', className: 'bg-purple-100 text-purple-800' },
      consume: { label: '消費', className: 'bg-gray-100 text-gray-800' },
      charge: { label: 'チャージ', className: 'bg-blue-100 text-blue-800' },
      refund: { label: '返金', className: 'bg-green-100 text-green-800' },
      referral: { label: '招待', className: 'bg-pink-100 text-pink-800' },
    };
    const v = variants[type] || variants.consume;
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  const getActionName = (action?: string) => {
    if (!action) return null;
    const cost = CREDIT_COSTS[action as keyof typeof CREDIT_COSTS];
    return cost?.name || action;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/credits">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  戻る
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8" />
              クレジット利用履歴
            </h1>
            <p className="text-muted-foreground">
              {filteredLogs.length}件の履歴
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>消費</CardDescription>
              <CardTitle className="text-2xl text-gray-600">
                -{stats.consumed.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>チャージ</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                +{stats.charged.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>招待報酬</CardDescription>
              <CardTitle className="text-2xl text-pink-600">
                +{stats.referral.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>プラン付与</CardDescription>
              <CardTitle className="text-2xl text-purple-600">
                +{stats.granted.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* フィルター */}
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="タイプ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="grant">付与</SelectItem>
                  <SelectItem value="consume">消費</SelectItem>
                  <SelectItem value="charge">チャージ</SelectItem>
                  <SelectItem value="refund">返金</SelectItem>
                  <SelectItem value="referral">招待</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">〜</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 履歴テーブル */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>アクション</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead className="text-right">残高</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {format(log.createdAt, 'M/d HH:mm', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          {getTypeBadge(log.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.action && (
                          <Badge variant="outline" className="text-xs">
                            {getActionName(log.action)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.reason}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        log.amount > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {log.amount > 0 ? '+' : ''}{log.amount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {log.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      履歴がありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
