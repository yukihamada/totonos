import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useAccounts, useJournalEntries } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { Badge } from '@/components/ui/badge';

// For demo purposes - in production this would come from database
interface BudgetItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  budgetAmount: number;
  actualAmount: number;
}

export default function AccountingBudget() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString().padStart(2, '0'));
  const [isOpen, setIsOpen] = useState(false);

  const { data: accounts } = useAccounts();
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
  const { data: entries } = useJournalEntries(startDate, endDate);

  // Calculate actual amounts by account from journal entries
  const actualByAccount = entries?.reduce((acc, entry) => {
    entry.items.forEach(item => {
      const key = item.account_id;
      if (!acc[key]) {
        acc[key] = { debit: 0, credit: 0 };
      }
      acc[key].debit += item.debit_amount || 0;
      acc[key].credit += item.credit_amount || 0;
    });
    return acc;
  }, {} as Record<string, { debit: number; credit: number }>) || {};

  // Filter expense accounts for budget tracking
  const expenseAccounts = accounts?.filter(a => a.account_type === 'expense') || [];
  const revenueAccounts = accounts?.filter(a => a.account_type === 'revenue') || [];

  // Demo budget data - in production this would come from a budgets table
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  const budgetItems: BudgetItem[] = expenseAccounts.map(account => {
    const actual = actualByAccount[account.id];
    return {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      budgetAmount: budgets[account.id] || 0,
      actualAmount: actual ? actual.debit - actual.credit : 0,
    };
  });

  // Calculate totals
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const variance = totalBudget - totalActual;
  const utilizationRate = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Revenue tracking
  const revenueItems = revenueAccounts.map(account => {
    const actual = actualByAccount[account.id];
    return {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      targetAmount: budgets[`rev_${account.id}`] || 0,
      actualAmount: actual ? actual.credit - actual.debit : 0,
    };
  });

  const totalRevenueTarget = revenueItems.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalRevenueActual = revenueItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const revenueAchievement = totalRevenueTarget > 0 ? (totalRevenueActual / totalRevenueTarget) * 100 : 0;

  const [editAccountId, setEditAccountId] = useState('');
  const [editBudgetAmount, setEditBudgetAmount] = useState('');

  const handleSaveBudget = () => {
    if (editAccountId && editBudgetAmount) {
      setBudgets(prev => ({
        ...prev,
        [editAccountId]: parseInt(editBudgetAmount) || 0,
      }));
      setIsOpen(false);
      setEditAccountId('');
      setEditBudgetAmount('');
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">予算管理</h1>
            <p className="text-muted-foreground">予算と実績の比較・分析</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                予算設定
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>予算を設定</DialogTitle>
                <DialogDescription>勘定科目の予算額を設定します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>勘定科目</Label>
                  <Select value={editAccountId} onValueChange={setEditAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="勘定科目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>予算額</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={editBudgetAmount}
                    onChange={(e) => setEditBudgetAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSaveBudget}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>期間選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label>年</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>月</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = (i + 1).toString().padStart(2, '0');
                      return (
                        <SelectItem key={m} value={m}>{i + 1}月</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>予算合計</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalBudget)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">今月の経費予算</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>実績合計</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalActual)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Progress value={utilizationRate} className="h-2" />
                <span className="text-xs text-muted-foreground">{utilizationRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          <Card className={variance >= 0 ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
            <CardHeader className="pb-2">
              <CardDescription>差異</CardDescription>
              <CardTitle className={`text-2xl flex items-center gap-2 ${variance >= 0 ? "text-green-700" : "text-red-700"}`}>
                {variance >= 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                {formatCurrency(Math.abs(variance))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xs ${variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {variance >= 0 ? "予算内" : "予算超過"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardDescription>売上達成率</CardDescription>
              <CardTitle className="text-2xl text-blue-700 flex items-center gap-2">
                <Target className="h-5 w-5" />
                {revenueAchievement.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-600">
                {formatCurrency(totalRevenueActual)} / {formatCurrency(totalRevenueTarget)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Table */}
        <Card>
          <CardHeader>
            <CardTitle>経費予算明細</CardTitle>
            <CardDescription>勘定科目別の予算と実績</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コード</TableHead>
                  <TableHead>勘定科目</TableHead>
                  <TableHead className="text-right">予算</TableHead>
                  <TableHead className="text-right">実績</TableHead>
                  <TableHead className="text-right">差異</TableHead>
                  <TableHead className="text-right">消化率</TableHead>
                  <TableHead>状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.map((item) => {
                  const itemVariance = item.budgetAmount - item.actualAmount;
                  const rate = item.budgetAmount > 0 ? (item.actualAmount / item.budgetAmount) * 100 : 0;
                  const status = rate > 100 ? 'over' : rate > 80 ? 'warning' : 'ok';

                  return (
                    <TableRow key={item.accountId}>
                      <TableCell className="font-mono">{item.accountCode}</TableCell>
                      <TableCell>{item.accountName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.budgetAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.actualAmount)}</TableCell>
                      <TableCell className={`text-right ${itemVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(Math.abs(itemVariance))}
                        {itemVariance < 0 && " 超過"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Progress value={Math.min(rate, 100)} className="h-2 w-16" />
                          <span className="text-xs w-12 text-right">{rate.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status === 'over' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}
                        >
                          {status === 'over' ? '超過' : status === 'warning' ? '注意' : '良好'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {budgetItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      経費勘定科目がありません
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
