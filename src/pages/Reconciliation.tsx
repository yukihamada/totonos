import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/types/database';
import { ArrowLeftRight, Check, AlertTriangle, Search, Upload, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

// Mock bank transactions (in production, these would come from bank API)
const mockBankTransactions = [
  { id: '1', date: '2026-01-10', description: '振込 カブシキガイシャABC', amount: 330000, matched: false },
  { id: '2', date: '2026-01-08', description: '振込 ヤマダタロウ', amount: 110000, matched: false },
  { id: '3', date: '2026-01-05', description: '振込 DEFコーポレーション', amount: 550000, matched: true },
  { id: '4', date: '2026-01-03', description: '振込 スズキハナコ', amount: 88000, matched: false },
];

export default function Reconciliation() {
  const { data: invoices, isLoading } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [bankTransactions] = useState(mockBankTransactions);

  // Get unpaid invoices
  const unpaidInvoices = invoices?.filter(inv => inv.status === 'sent' || inv.status === 'pending') || [];

  // Stats
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalBankUnmatched = bankTransactions.filter(t => !t.matched).reduce((sum, t) => sum + t.amount, 0);
  const matchedCount = bankTransactions.filter(t => t.matched).length;

  // Filter invoices
  const filteredInvoices = unpaidInvoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv as any).client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAutoMatch = () => {
    // In production, this would run matching algorithm
    alert('自動消込を実行しました。マッチング結果を確認してください。');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">自動消込</h1>
            <p className="text-muted-foreground">入金と請求書の自動マッチング</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              銀行明細取込
            </Button>
            <Button onClick={handleAutoMatch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              自動消込実行
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>未入金請求書</CardDescription>
              <CardTitle className="text-2xl">{unpaidInvoices.length}件</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{formatCurrency(totalUnpaid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>未消込入金</CardDescription>
              <CardTitle className="text-2xl">{bankTransactions.filter(t => !t.matched).length}件</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{formatCurrency(totalBankUnmatched)}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">消込済み</CardDescription>
              <CardTitle className="text-2xl text-green-700">{matchedCount}件</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600">今月</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>消込率</CardDescription>
              <CardTitle className="text-2xl">
                {bankTransactions.length > 0
                  ? Math.round((matchedCount / bankTransactions.length) * 100)
                  : 0}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bank Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                入金明細
              </CardTitle>
              <CardDescription>銀行口座への入金一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>状態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{tx.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        {tx.matched ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="mr-1 h-3 w-3" />
                            消込済
                          </Badge>
                        ) : (
                          <Badge variant="outline">未消込</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Unpaid Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>未入金請求書</CardTitle>
              <CardDescription>消込待ちの請求書</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="請求書を検索..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  未入金の請求書はありません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>請求書番号</TableHead>
                      <TableHead>取引先</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>期限</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
                      const isOverdue = daysOverdue > 0;
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                          <TableCell>{(invoice as any).client?.name || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isOverdue && <AlertTriangle className="h-3 w-3 text-destructive" />}
                              <span className={isOverdue ? 'text-destructive' : ''}>
                                {format(new Date(invoice.due_date), 'MM/dd', { locale: ja })}
                              </span>
                            </div>
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

        {/* Matching Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>マッチング候補</CardTitle>
            <CardDescription>金額が一致する入金と請求書のペア</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankTransactions.filter(t => !t.matched).map((tx) => {
                const matchingInvoice = unpaidInvoices.find(inv => inv.total_amount === tx.amount);
                if (!matchingInvoice) return null;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.date} - {formatCurrency(tx.amount)}</p>
                    </div>
                    <ArrowLeftRight className="mx-4 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-right">
                      <p className="font-medium">{matchingInvoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {(matchingInvoice as any).client?.name} - {formatCurrency(matchingInvoice.total_amount)}
                      </p>
                    </div>
                    <Button size="sm" className="ml-4">
                      <Check className="mr-1 h-4 w-4" />
                      消込
                    </Button>
                  </div>
                );
              })}
              {bankTransactions.filter(t => !t.matched).every(tx =>
                !unpaidInvoices.find(inv => inv.total_amount === tx.amount)
              ) && (
                <p className="text-center py-4 text-muted-foreground">
                  金額が一致するマッチング候補がありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
