import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/types/database';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AgingBucket {
  label: string;
  min: number;
  max: number;
  color: string;
}

const agingBuckets: AgingBucket[] = [
  { label: '未到来', min: -9999, max: 0, color: 'bg-green-100 text-green-800' },
  { label: '1-30日', min: 1, max: 30, color: 'bg-yellow-100 text-yellow-800' },
  { label: '31-60日', min: 31, max: 60, color: 'bg-orange-100 text-orange-800' },
  { label: '61-90日', min: 61, max: 90, color: 'bg-red-100 text-red-800' },
  { label: '90日超', min: 91, max: 9999, color: 'bg-red-200 text-red-900' },
];

export default function AccountingReceivables() {
  const { data: invoices, isLoading } = useInvoices();
  const today = new Date();

  // Filter unpaid invoices only
  const unpaidInvoices = invoices?.filter(inv => inv.status === 'sent' || inv.status === 'draft') || [];

  // Calculate days overdue for each invoice
  const invoicesWithAging = unpaidInvoices.map(invoice => {
    const dueDate = new Date(invoice.due_date);
    const daysOverdue = differenceInDays(today, dueDate);
    const bucket = agingBuckets.find(b => daysOverdue >= b.min && daysOverdue <= b.max) || agingBuckets[4];

    return {
      ...invoice,
      daysOverdue,
      bucket,
    };
  });

  // Calculate totals by bucket
  const bucketTotals = agingBuckets.map(bucket => {
    const invoicesInBucket = invoicesWithAging.filter(inv => inv.bucket.label === bucket.label);
    return {
      ...bucket,
      count: invoicesInBucket.length,
      amount: invoicesInBucket.reduce((sum, inv) => sum + inv.total_amount, 0),
    };
  });

  // Overall totals
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const overdueAmount = invoicesWithAging
    .filter(inv => inv.daysOverdue > 0)
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const overdueCount = invoicesWithAging.filter(inv => inv.daysOverdue > 0).length;

  // DSO calculation (Days Sales Outstanding)
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
  const totalSales = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
  const averageReceivables = totalUnpaid;
  const dailySales = totalSales / 365;
  const dso = dailySales > 0 ? averageReceivables / dailySales : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/accounting">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">売掛金年齢表</h1>
            <p className="text-muted-foreground">売掛金の回収状況と滞留分析</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>売掛金合計</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {formatCurrency(totalUnpaid)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{unpaidInvoices.length}件の未入金請求書</p>
            </CardContent>
          </Card>
          <Card className={overdueCount > 0 ? "border-red-200 bg-red-50/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className={overdueCount > 0 ? "text-red-700" : ""}>期限超過</CardDescription>
              <CardTitle className={`text-2xl flex items-center gap-2 ${overdueCount > 0 ? "text-red-700" : ""}`}>
                <AlertTriangle className="h-5 w-5" />
                {formatCurrency(overdueAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xs ${overdueCount > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                {overdueCount}件
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>DSO (平均回収日数)</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {dso.toFixed(1)}日
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">業界平均: 30-45日</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">入金済み</CardDescription>
              <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {paidInvoices.length}件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600">
                {formatCurrency(paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Aging Summary */}
        <Card>
          <CardHeader>
            <CardTitle>年齢別サマリー</CardTitle>
            <CardDescription>請求書の期限超過日数別の分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {bucketTotals.map((bucket) => (
                <Card key={bucket.label} className={`${bucket.color} border-0`}>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-inherit opacity-80">{bucket.label}</CardDescription>
                    <CardTitle className="text-xl">{formatCurrency(bucket.amount)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm opacity-80">{bucket.count}件</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed List */}
        <Card>
          <CardHeader>
            <CardTitle>未入金請求書明細</CardTitle>
            <CardDescription>期限超過日数順</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : invoicesWithAging.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                未入金の請求書はありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>取引先</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>支払期限</TableHead>
                    <TableHead>経過日数</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesWithAging
                    .sort((a, b) => b.daysOverdue - a.daysOverdue)
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                        <TableCell>{(invoice as any).client?.name || '-'}</TableCell>
                        <TableCell>{invoice.title}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(invoice.total_amount)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.issue_date), 'yyyy/MM/dd', { locale: ja })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_date), 'yyyy/MM/dd', { locale: ja })}
                        </TableCell>
                        <TableCell>
                          {invoice.daysOverdue > 0 ? (
                            <span className="text-red-600 font-medium">
                              {invoice.daysOverdue}日超過
                            </span>
                          ) : (
                            <span className="text-green-600">
                              {Math.abs(invoice.daysOverdue)}日前
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={invoice.bucket.color}>
                            {invoice.bucket.label}
                          </Badge>
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
