import { useState } from "react";
import { FileCheck, Plus, Users, Calculator } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEmployees } from "@/hooks/useHR";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { YearEndStatus, YearEndAdjustment } from "@/types/hr";

const statusLabels: Record<YearEndStatus, string> = {
  pending: '未提出',
  submitted: '提出済み',
  completed: '完了',
};

const statusColors: Record<YearEndStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export default function YearEnd() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [formData, setFormData] = useState({
    spouse_deduction: 0,
    dependent_count: 0,
    life_insurance_deduction: 0,
    earthquake_insurance_deduction: 0,
    housing_loan_deduction: 0,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();

  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ['year-end-adjustments', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('year_end_adjustments')
        .select('*, employee:employees(name, employee_number)')
        .eq('tax_year', selectedYear)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (YearEndAdjustment & { employee: { name: string; employee_number: string } })[];
    },
    enabled: !!user,
  });

  const createAdjustment = useMutation({
    mutationFn: async (data: Omit<YearEndAdjustment, 'id' | 'created_at' | 'updated_at' | 'calculated_tax' | 'adjustment_amount'>) => {
      // Simple tax calculation
      const totalDeductions = data.spouse_deduction + 
        (data.dependent_count * 380000) + 
        data.life_insurance_deduction + 
        data.earthquake_insurance_deduction + 
        data.housing_loan_deduction;
      
      const calculatedTax = Math.max(0, 5000000 - totalDeductions) * 0.2; // Simplified
      const adjustmentAmount = -Math.round(calculatedTax * 0.1); // Simplified refund

      const { data: result, error } = await supabase
        .from('year_end_adjustments')
        .insert({
          ...data,
          calculated_tax: calculatedTax,
          adjustment_amount: adjustmentAmount,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['year-end-adjustments'] });
      toast({ title: '年末調整を登録しました' });
      setIsDialogOpen(false);
      setSelectedEmployee("");
      setFormData({
        spouse_deduction: 0,
        dependent_count: 0,
        life_insurance_deduction: 0,
        earthquake_insurance_deduction: 0,
        housing_loan_deduction: 0,
      });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    createAdjustment.mutate({
      employee_id: selectedEmployee,
      tax_year: selectedYear,
      ...formData,
      status: 'submitted',
    });
  };

  // Summary
  const completed = adjustments.filter(a => a.status === 'completed').length;
  const pending = adjustments.filter(a => a.status === 'pending').length;
  const totalRefund = adjustments.reduce((sum, a) => sum + (a.adjustment_amount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">年末調整</h1>
            <p className="text-muted-foreground">{selectedYear}年分 年末調整管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />年末調整を登録</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>年末調整登録 - {selectedYear}年</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                  <Label>配偶者控除額</Label>
                  <Input
                    type="number"
                    value={formData.spouse_deduction}
                    onChange={e => setFormData(f => ({ ...f, spouse_deduction: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>扶養親族数</Label>
                  <Input
                    type="number"
                    value={formData.dependent_count}
                    onChange={e => setFormData(f => ({ ...f, dependent_count: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>生命保険料控除額</Label>
                  <Input
                    type="number"
                    value={formData.life_insurance_deduction}
                    onChange={e => setFormData(f => ({ ...f, life_insurance_deduction: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>地震保険料控除額</Label>
                  <Input
                    type="number"
                    value={formData.earthquake_insurance_deduction}
                    onChange={e => setFormData(f => ({ ...f, earthquake_insurance_deduction: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>住宅借入金等特別控除額</Label>
                  <Input
                    type="number"
                    value={formData.housing_loan_deduction}
                    onChange={e => setFormData(f => ({ ...f, housing_loan_deduction: Number(e.target.value) }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!selectedEmployee || createAdjustment.isPending}>
                  {createAdjustment.isPending ? "登録中..." : "登録"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <FileCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{completed}/{adjustments.length}</p>
                  <p className="text-sm text-muted-foreground">完了</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{pending}件</p>
                  <p className="text-sm text-muted-foreground">未提出</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {totalRefund >= 0 ? '+' : ''}¥{Math.abs(totalRefund).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">調整額合計</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year Filter */}
        <div>
          <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="年を選択" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>社員番号</TableHead>
                <TableHead>氏名</TableHead>
                <TableHead>扶養人数</TableHead>
                <TableHead className="text-right">控除額合計</TableHead>
                <TableHead className="text-right">調整額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">読み込み中...</TableCell>
                </TableRow>
              ) : adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">年末調整データがありません</p>
                  </TableCell>
                </TableRow>
              ) : adjustments.map(adj => {
                const totalDeductions = (adj.spouse_deduction || 0) + 
                  (adj.life_insurance_deduction || 0) + 
                  (adj.earthquake_insurance_deduction || 0) + 
                  (adj.housing_loan_deduction || 0);
                return (
                  <TableRow key={adj.id}>
                    <TableCell className="font-mono">{adj.employee?.employee_number}</TableCell>
                    <TableCell className="font-medium">{adj.employee?.name}</TableCell>
                    <TableCell>{adj.dependent_count || 0}人</TableCell>
                    <TableCell className="text-right">¥{totalDeductions.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={(adj.adjustment_amount || 0) >= 0 ? 'text-chart-2' : 'text-destructive'}>
                        {(adj.adjustment_amount || 0) >= 0 ? '+' : ''}¥{Math.abs(adj.adjustment_amount || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[adj.status]}>
                        {statusLabels[adj.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
