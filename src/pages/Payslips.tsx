import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Send,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useEmployees, usePayrollRecords } from '@/hooks/useHR';
import { formatCurrency } from '@/types/database';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const statusLabels = {
  draft: '下書き',
  calculated: '計算済み',
  approved: '承認済み',
  paid: '支払済み',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  calculated: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-purple-100 text-purple-800',
};

export default function Payslips() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: records = [], isLoading: recordsLoading } = usePayrollRecords(selectedMonth);

  const isLoading = employeesLoading || recordsLoading;

  // Get payslips with employee info
  const payslips = records.map(record => {
    const employee = employees.find(e => e.id === record.employee_id);
    const allowances = record.allowances as Record<string, number> || {};
    const deductions = record.deductions as Record<string, number> || {};
    
    return {
      ...record,
      employeeName: employee?.name || '不明',
      employeeNumber: employee?.employee_number || '-',
      department: employee?.department || '-',
      allowancesTotal: Object.values(allowances).reduce((a, b) => a + (b || 0), 0),
      deductionsTotal: Object.values(deductions).reduce((a, b) => a + (b || 0), 0),
      allowancesDetail: allowances,
      deductionsDetail: deductions,
    };
  });

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'yyyy年M月', { locale: ja });
    return { value, label };
  });

  // Summary stats
  const totalGross = payslips.reduce((sum, p) => sum + (p.gross_pay || 0), 0);
  const totalNet = payslips.reduce((sum, p) => sum + (p.net_pay || 0), 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + p.deductionsTotal, 0);
  const paidCount = payslips.filter(p => p.status === 'paid').length;

  const openDetail = (payslip: typeof payslips[0]) => {
    setSelectedPayslip(payslip);
    setDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const label = statusLabels[status as keyof typeof statusLabels] || status;
    const color = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    return <Badge className={color}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              給与明細
            </h1>
            <p className="text-muted-foreground">
              従業員の給与明細を確認・発行
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              一括ダウンロード
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              一括配信
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>対象人数</CardDescription>
              <CardTitle className="text-2xl">{payslips.length}人</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総支給額合計</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalGross)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>控除額合計</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{formatCurrency(totalDeductions)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>差引支給額合計</CardDescription>
              <CardTitle className="text-2xl text-green-600">{formatCurrency(totalNet)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              ステータス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(statusLabels).map(([status, label]) => {
                const count = payslips.filter(p => p.status === status).length;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <Badge className={statusColors[status as keyof typeof statusColors]}>
                      {label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count}件</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payslips Table */}
        <Card>
          <CardHeader>
            <CardTitle>給与明細一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>社員番号</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead className="text-right">基本給</TableHead>
                  <TableHead className="text-right">総支給額</TableHead>
                  <TableHead className="text-right">控除計</TableHead>
                  <TableHead className="text-right">差引支給額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {selectedMonth}の給与データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-mono">{payslip.employeeNumber}</TableCell>
                      <TableCell className="font-medium">{payslip.employeeName}</TableCell>
                      <TableCell>{payslip.department}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.base_salary)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payslip.gross_pay)}</TableCell>
                      <TableCell className="text-right text-orange-600">
                        -{formatCurrency(payslip.deductionsTotal)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(payslip.net_pay)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openDetail(payslip)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payslip Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                給与明細
              </DialogTitle>
              <DialogDescription>
                {selectedPayslip && `${selectedPayslip.employeeName} - ${format(new Date(selectedPayslip.pay_period_start), 'yyyy年M月', { locale: ja })}`}
              </DialogDescription>
            </DialogHeader>
            {selectedPayslip && (
              <div className="space-y-6 py-4">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">社員番号:</span>
                    <span className="ml-2 font-medium">{selectedPayslip.employeeNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">氏名:</span>
                    <span className="ml-2 font-medium">{selectedPayslip.employeeName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">部署:</span>
                    <span className="ml-2">{selectedPayslip.department}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">支給日:</span>
                    <span className="ml-2">
                      {format(new Date(selectedPayslip.payment_date), 'yyyy年M月d日', { locale: ja })}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Earnings */}
                <div>
                  <h4 className="font-semibold mb-3">支給</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>基本給</span>
                      <span>{formatCurrency(selectedPayslip.base_salary)}</span>
                    </div>
                    {selectedPayslip.overtime_pay > 0 && (
                      <div className="flex justify-between">
                        <span>時間外手当</span>
                        <span>{formatCurrency(selectedPayslip.overtime_pay)}</span>
                      </div>
                    )}
                    {Object.entries(selectedPayslip.allowancesDetail || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key === 'commute' ? '通勤手当' : key === 'housing' ? '住宅手当' : key}</span>
                        <span>{formatCurrency(value as number)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>総支給額</span>
                      <span>{formatCurrency(selectedPayslip.gross_pay)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold mb-3">控除</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedPayslip.deductionsDetail || {}).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        health_insurance: '健康保険',
                        pension: '厚生年金',
                        employment_insurance: '雇用保険',
                        income_tax: '所得税',
                        resident_tax: '住民税',
                      };
                      return (
                        <div key={key} className="flex justify-between">
                          <span>{labels[key] || key}</span>
                          <span className="text-orange-600">-{formatCurrency(value as number)}</span>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>控除合計</span>
                      <span className="text-orange-600">-{formatCurrency(selectedPayslip.deductionsTotal)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Net Pay */}
                <div className="flex justify-between text-lg font-bold">
                  <span>差引支給額</span>
                  <span className="text-green-600">{formatCurrency(selectedPayslip.net_pay)}</span>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    PDF出力
                  </Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    メール送信
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
