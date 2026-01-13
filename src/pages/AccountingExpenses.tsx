import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Receipt, Trash2 } from 'lucide-react';
import { useExpenseClaims, useCreateExpenseClaim, useAccounts } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { getExpenseStatusLabel, getExpenseStatusColor } from '@/types/accounting';
import { toast } from 'sonner';

interface ExpenseItemInput {
  id: string;
  expense_date: string;
  account_id: string;
  description: string;
  amount: number;
  vendor_name: string;
}

export default function AccountingExpenses() {
  const { data: claims, isLoading } = useExpenseClaims();
  const { data: accounts } = useAccounts();
  const createClaim = useCreateExpenseClaim();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimantName, setClaimantName] = useState('');
  const [items, setItems] = useState<ExpenseItemInput[]>([
    { id: '1', expense_date: new Date().toISOString().split('T')[0], account_id: '', description: '', amount: 0, vendor_name: '' },
  ]);

  const expenseAccounts = accounts?.filter(a => a.account_type === 'expense') || [];
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      expense_date: new Date().toISOString().split('T')[0],
      account_id: '',
      description: '',
      amount: 0,
      vendor_name: '',
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ExpenseItemInput, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(i => i.description && i.amount > 0);
    if (validItems.length === 0) {
      toast.error('少なくとも1つの経費明細を入力してください');
      return;
    }
    
    try {
      await createClaim.mutateAsync({
        claim_date: claimDate,
        claimant_name: claimantName,
        items: validItems.map(i => ({
          expense_date: i.expense_date,
          account_id: i.account_id || undefined,
          description: i.description,
          amount: i.amount,
          vendor_name: i.vendor_name || undefined,
        })),
      });
      
      toast.success('経費申請を登録しました');
      setDialogOpen(false);
      setClaimDate(new Date().toISOString().split('T')[0]);
      setClaimantName('');
      setItems([{ id: '1', expense_date: new Date().toISOString().split('T')[0], account_id: '', description: '', amount: 0, vendor_name: '' }]);
    } catch (error) {
      toast.error('登録に失敗しました');
    }
  };

  const pendingClaims = claims?.filter(c => c.status === 'pending') || [];
  const totalPending = pendingClaims.reduce((sum, c) => sum + Number(c.total_amount), 0);

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
            <h1 className="text-3xl font-bold tracking-tight">経費管理</h1>
            <p className="text-muted-foreground">経費申請・精算</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規申請
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>新規経費申請</DialogTitle>
                  <DialogDescription>
                    経費の明細を入力してください
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>申請日 *</Label>
                      <Input
                        type="date"
                        value={claimDate}
                        onChange={(e) => setClaimDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>申請者名</Label>
                      <Input
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        placeholder="申請者名"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>経費明細</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        行を追加
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left">日付</th>
                            <th className="px-3 py-2 text-left">勘定科目</th>
                            <th className="px-3 py-2 text-left">内容</th>
                            <th className="px-3 py-2 text-left">支払先</th>
                            <th className="px-3 py-2 text-right">金額</th>
                            <th className="px-3 py-2 w-[40px]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="px-3 py-2">
                                <Input
                                  type="date"
                                  value={item.expense_date}
                                  onChange={(e) => updateItem(item.id, 'expense_date', e.target.value)}
                                  className="h-8"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Select
                                  value={item.account_id}
                                  onValueChange={(value) => updateItem(item.id, 'account_id', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="科目" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {expenseAccounts.map((acc) => (
                                      <SelectItem key={acc.id} value={acc.id}>
                                        {acc.account_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  placeholder="内容"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={item.vendor_name}
                                  onChange={(e) => updateItem(item.id, 'vendor_name', e.target.value)}
                                  placeholder="支払先"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.amount || ''}
                                  onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                                  className="h-8 text-right"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeItem(item.id)}
                                  disabled={items.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-muted/50">
                          <tr className="border-t-2">
                            <td colSpan={4} className="px-3 py-2 font-medium">合計</td>
                            <td className="px-3 py-2 text-right font-bold">{formatCurrency(totalAmount)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createClaim.isPending}>
                    {createClaim.isPending ? '登録中...' : '申請'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingClaims.length}件</div>
              <p className="text-xs text-muted-foreground">
                合計: {formatCurrency(totalPending)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の経費</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims?.length || 0}件</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>経費申請一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : !claims || claims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                経費申請がありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申請番号</TableHead>
                    <TableHead>申請日</TableHead>
                    <TableHead>申請者</TableHead>
                    <TableHead>明細数</TableHead>
                    <TableHead className="text-right">合計金額</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.claim_number}</TableCell>
                      <TableCell>{claim.claim_date}</TableCell>
                      <TableCell>{claim.claimant_name || '-'}</TableCell>
                      <TableCell>{claim.items?.length || 0}件</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(claim.total_amount))}</TableCell>
                      <TableCell>
                        <Badge className={getExpenseStatusColor(claim.status)}>
                          {getExpenseStatusLabel(claim.status)}
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
