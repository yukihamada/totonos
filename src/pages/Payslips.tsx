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
  Building2,
  Send,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface PayslipData {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  periodLabel: string;
  baseSalary: number;
  overtimePay: number;
  allowances: number;
  grossPay: number;
  healthInsurance: number;
  pension: number;
  employmentInsurance: number;
  incomeTax: number;
  residentTax: number;
  totalDeductions: number;
  netPay: number;
  status: 'draft' | 'issued' | 'viewed';
  issuedAt?: string;
  viewedAt?: string;
}

// Mock payslip data
const mockPayslips: PayslipData[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    employeeName: '山田 太郎',
    department: '営業部',
    period: '2026-01',
    periodLabel: '2026年1月',
    baseSalary: 350000,
    overtimePay: 45000,
    allowances: 30000,
    grossPay: 425000,
    healthInsurance: 21250,
    pension: 38250,
    employmentInsurance: 2550,
    incomeTax: 15800,
    residentTax: 18000,
    totalDeductions: 95850,
    netPay: 329150,
    status: 'issued',
    issuedAt: '2026-01-25',
  },
  {
    id: '2',
    employeeId: 'EMP-002',
    employeeName: '佐藤 花子',
    department: '開発部',
    period: '2026-01',
    periodLabel: '2026年1月',
    baseSalary: 400000,
    overtimePay: 62500,
    allowances: 35000,
    grossPay: 497500,
    healthInsurance: 24875,
    pension: 44775,
    employmentInsurance: 2985,
    incomeTax: 22400,
    residentTax: 22000,
    totalDeductions: 117035,
    netPay: 380465,
    status: 'viewed',
    issuedAt: '2026-01-25',
    viewedAt: '2026-01-26',
  },
  {
    id: '3',
    employeeId: 'EMP-003',
    employeeName: '鈴木 一郎',
    department: '管理部',
    period: '2026-01',
    periodLabel: '2026年1月',
    baseSalary: 320000,
    overtimePay: 20000,
    allowances: 25000,
    grossPay: 365000,
    healthInsurance: 18250,
    pension: 32850,
    employmentInsurance: 2190,
    incomeTax: 12600,
    residentTax: 15000,
    totalDeductions: 80890,
    netPay: 284110,
    status: 'draft',
  },
];

const periods = [
  { value: '2026-01', label: '2026年1月' },
  { value: '2025-12', label: '2025年12月' },
  { value: '2025-11', label: '2025年11月' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function StatusBadge({ status }: { status: PayslipData['status'] }) {
  const config = {
    draft: { label: '下書き', variant: 'secondary' as const },
    issued: { label: '発行済み', variant: 'default' as const },
    viewed: { label: '確認済み', variant: 'outline' as const },
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
}

function PayslipDetail({ payslip, onClose }: { payslip: PayslipData; onClose: () => void }) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          給与明細 - {payslip.periodLabel}
        </DialogTitle>
        <DialogDescription>
          {payslip.employeeName}さんの給与明細
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">従業員名</p>
            <p className="font-medium">{payslip.employeeName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">部署</p>
            <p className="font-medium">{payslip.department}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">対象期間</p>
            <p className="font-medium">{payslip.periodLabel}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">従業員ID</p>
            <p className="font-medium">{payslip.employeeId}</p>
          </div>
        </div>

        {/* Earnings */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            支給
          </h4>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>基本給</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.baseSalary)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>時間外手当</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.overtimePay)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>諸手当</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.allowances)}</TableCell>
              </TableRow>
              <TableRow className="font-medium bg-green-50 dark:bg-green-950">
                <TableCell>支給合計</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(payslip.grossPay)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Deductions */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-red-600" />
            控除
          </h4>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>健康保険</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.healthInsurance)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>厚生年金</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.pension)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>雇用保険</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.employmentInsurance)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>所得税</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.incomeTax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>住民税</TableCell>
                <TableCell className="text-right">{formatCurrency(payslip.residentTax)}</TableCell>
              </TableRow>
              <TableRow className="font-medium bg-red-50 dark:bg-red-950">
                <TableCell>控除合計</TableCell>
                <TableCell className="text-right text-red-600">{formatCurrency(payslip.totalDeductions)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Net Pay */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">差引支給額</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(payslip.netPay)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            PDFダウンロード
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function Payslips() {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-01');
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);

  const filteredPayslips = mockPayslips.filter(p => p.period === selectedPeriod);
  const stats = {
    total: filteredPayslips.length,
    issued: filteredPayslips.filter(p => p.status !== 'draft').length,
    viewed: filteredPayslips.filter(p => p.status === 'viewed').length,
    totalAmount: filteredPayslips.reduce((sum, p) => sum + p.netPay, 0),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Web給与明細
            </h1>
            <p className="text-muted-foreground">
              従業員向けオンライン給与明細
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              一括発行
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>対象人数</CardDescription>
              <CardTitle className="text-2xl">{stats.total}名</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                発行済み
              </CardDescription>
              <CardTitle className="text-2xl">{stats.issued}名</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-500" />
                確認済み
              </CardDescription>
              <CardTitle className="text-2xl">{stats.viewed}名</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>支給総額</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(stats.totalAmount)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Payslips Table */}
        <Card>
          <CardHeader>
            <CardTitle>給与明細一覧</CardTitle>
            <CardDescription>
              {periods.find(p => p.value === selectedPeriod)?.label}の給与明細
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>従業員</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead className="text-right">支給額</TableHead>
                  <TableHead className="text-right">控除額</TableHead>
                  <TableHead className="text-right">差引支給額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payslip.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{payslip.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payslip.department}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(payslip.grossPay)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(payslip.totalDeductions)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payslip.netPay)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payslip.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayslip(payslip)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {payslip.status === 'draft' && (
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
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

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                発行スケジュール
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                給与明細は毎月25日に自動発行されます。
                従業員はメール通知を受け取り、ポータルから確認できます。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                確認率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.viewed / stats.total) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.viewed}/{stats.total}名が確認済み
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        {selectedPayslip && (
          <PayslipDetail payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
        )}
      </Dialog>
    </AppLayout>
  );
}
