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
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useCredits, type CreditTransaction, CREDIT_COSTS } from '@/hooks/useCredits';

type TransactionType = CreditTransaction['type'] | 'all';

export default function CreditLogs() {
  const { getLogs, isLoading } = useCredits();
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const allLogs = getLogs();

  // フィルタリング
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
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
  }, [allLogs, typeFilter, searchQuery, dateFrom, dateTo]);

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
    const headers = ['日時', 'タイプ', '説明', '金額', '残高'];
    const rows = filteredLogs.map((log) => [
      format(log.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      log.type,
      log.reason,
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

  const getTypeIcon = (type: CreditTransaction['type']) => {
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
    }
  };

  const getTypeBadge = (type: CreditTransaction['type']) => {
    const variants: Record<CreditTransaction['type'], { label: string; className: string }> = {
      grant: { label: '付与', className: 'bg-purple-100 text-purple-800' },
      consume: { label: '消費', className: 'bg-gray-100 text-gray-800' },
      charge: { label: 'チャージ', className: 'bg-blue-100 text-blue-800' },
      refund: { label: '返金', className: 'bg-green-100 text-green-800' },
      referral: { label: '招待', className: 'bg-pink-100 text-pink-800' },
    };
    const v = variants[type];
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                      <TableCell>{log.reason}</TableCell>
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
