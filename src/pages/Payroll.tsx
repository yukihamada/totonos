import { useState } from "react";
import { DollarSign, Calculator, FileText, Plus, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmployees, usePayrollRecords, useCreatePayroll, useAttendanceRecords } from "@/hooks/useHR";
import type { PayrollStatus } from "@/types/hr";

const statusLabels: Record<PayrollStatus, string> = {
  draft: '下書き',
  calculated: '計算済み',
  approved: '承認済み',
  paid: '支払済み',
};

const statusColors: Record<PayrollStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  calculated: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-purple-100 text-purple-800',
};

export default function Payroll() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const { data: employees = [] } = useEmployees();
  const { data: records = [], isLoading } = usePayrollRecords(selectedMonth);
  const { data: attendance = [] } = useAttendanceRecords(selectedEmployee, selectedMonth);
  const createPayroll = useCreatePayroll();

  const selectedEmp = employees.find(e => e.id === selectedEmployee);

  // Calculate payroll based on attendance
  const calculatePayroll = () => {
    if (!selectedEmp) return null;

    const empAttendance = attendance.filter(a => a.employee_id === selectedEmployee);
    const totalWorkHours = empAttendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);
    const totalOvertimeHours = empAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

    const hourlyRate = selectedEmp.base_salary / 160; // Assuming 160 hours/month
    const overtimePay = Math.round(totalOvertimeHours * hourlyRate * 1.25);

    const allowances = {
      commute: 10000,
      housing: 0,
    };

    const grossPay = selectedEmp.base_salary + overtimePay + Object.values(allowances).reduce((a, b) => a + b, 0);

    const deductions = {
      health_insurance: Math.round(grossPay * 0.05),
      pension: Math.round(grossPay * 0.092),
      employment_insurance: Math.round(grossPay * 0.003),
      income_tax: Math.round(grossPay * 0.05),
      resident_tax: 10000,
    };

    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const netPay = grossPay - totalDeductions;

    return {
      base_salary: selectedEmp.base_salary,
      overtime_pay: overtimePay,
      allowances,
      deductions,
      gross_pay: grossPay,
      net_pay: netPay,
    };
  };

  const calculatedPayroll = calculatePayroll();

  const handleSubmit = async () => {
    if (!selectedEmployee || !calculatedPayroll) return;

    const [year, month] = selectedMonth.split('-');
    const payPeriodStart = `${selectedMonth}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const payPeriodEnd = `${selectedMonth}-${lastDay}`;
    const paymentDate = `${selectedMonth}-25`;

    await createPayroll.mutateAsync({
      employee_id: selectedEmployee,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      payment_date: paymentDate,
      base_salary: calculatedPayroll.base_salary,
      overtime_pay: calculatedPayroll.overtime_pay,
      allowances: calculatedPayroll.allowances,
      deductions: calculatedPayroll.deductions,
      gross_pay: calculatedPayroll.gross_pay,
      net_pay: calculatedPayroll.net_pay,
      status: 'calculated',
    });

    setIsDialogOpen(false);
    setSelectedEmployee("");
  };

  // Summary
  const totalGross = records.reduce((sum, r) => sum + r.gross_pay, 0);
  const totalNet = records.reduce((sum, r) => sum + r.net_pay, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">給与計算</h1>
            <p className="text-muted-foreground">給与明細の作成・管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />給与計算</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>給与計算 - {selectedMonth}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>従業員</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="従業員を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employee_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {calculatedPayroll && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">計算結果</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>基本給</span>
                          <span>¥{calculatedPayroll.base_salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>残業手当</span>
                          <span>¥{calculatedPayroll.overtime_pay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>通勤手当</span>
                          <span>¥{calculatedPayroll.allowances.commute.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>総支給額</span>
                          <span>¥{calculatedPayroll.gross_pay.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>健康保険</span>
                          <span>-¥{calculatedPayroll.deductions.health_insurance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>厚生年金</span>
                          <span>-¥{calculatedPayroll.deductions.pension.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>所得税</span>
                          <span>-¥{calculatedPayroll.deductions.income_tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>住民税</span>
                          <span>-¥{calculatedPayroll.deductions.resident_tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 text-lg">
                          <span>差引支給額</span>
                          <span className="text-chart-2">¥{calculatedPayroll.net_pay.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={!selectedEmployee || createPayroll.isPending}
                >
                  {createPayroll.isPending ? "作成中..." : "給与明細を作成"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">¥{totalGross.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">総支給額</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">¥{totalNet.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">差引支給額</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{records.length}件</p>
                  <p className="text-sm text-muted-foreground">給与明細</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="月を選択" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = date.toISOString().slice(0, 7);
                return (
                  <SelectItem key={value} value={value}>
                    {date.getFullYear()}年{date.getMonth() + 1}月
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Records Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>社員番号</TableHead>
                <TableHead>氏名</TableHead>
                <TableHead>支給期間</TableHead>
                <TableHead className="text-right">総支給額</TableHead>
                <TableHead className="text-right">差引支給額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">読み込み中...</TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">給与明細がありません</p>
                  </TableCell>
                </TableRow>
              ) : records.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">
                    {(record.employee as any)?.employee_number || '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {(record.employee as any)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {record.pay_period_start} 〜 {record.pay_period_end}
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{record.gross_pay.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ¥{record.net_pay.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
