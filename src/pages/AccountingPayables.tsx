import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, CreditCard, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccountsPayable, useAccountsPayableAging, useCreateAccountsPayable, useCreateJournalFromPayment } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AccountingPayables() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    vendor_name: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    amount: '',
  });

  const { data: payables, isLoading } = useAccountsPayable();
  const { data: aging } = useAccountsPayableAging();
  const createPayable = useCreateAccountsPayable();
  const createPayment = useCreateJournalFromPayment();

  const handleCreate = async () => {
    if (!formData.vendor_name || !formData.invoice_number || !formData.amount) {
      toast.error('必須項目を入力してください');
      return;
    }

    try {
      await createPayable.mutateAsync({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('買掛金を登録しました');
      setIsAddOpen(false);
      setFormData({
        vendor_name: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        amount: '',
      });
    } catch (error) {
      toast.error('買掛金の登録に失敗しました');
    }
  };

  const handlePayment = async () => {
    if (!selectedPayable || !paymentAmount) {
      toast.error('支払金額を入力してください');
      return;
    }

    try {
      await createPayment.mutateAsync({
        payableId: selectedPayable.id,
        paymentDate: new Date().toISOString().split('T')[0],
        amount: parseFloat(paymentAmount),
      });
      toast.success('支払いを記録しました');
      setIsPayOpen(false);
      setSelectedPayable(null);
      setPaymentAmount('');
    } catch (error) {
      toast.error('支払いの記録に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline">未払</Badge>;
      case 'partial':
        return <Badge variant="secondary">一部支払済</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">支払済</Badge>;
      case 'overdue':
        return <Badge variant="destructive">延滞</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/accounting">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">買掛金管理</h1>
              <p className="text-muted-foreground">買掛金のエイジング分析と支払管理</p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                買掛金を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>買掛金を追加</DialogTitle>
                <DialogDescription>仕入先からの請求書を登録します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>仕入先名 *</Label>
                  <Input
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    placeholder="例: 株式会社ABC"
                  />
                </div>
                <div>
                  <Label>請求書番号 *</Label>
                  <Input
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="例: INV-2026-001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>請求日</Label>
                    <Input
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>支払期日 *</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>金額 *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100000"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>キャンセル</Button>
                <Button onClick={handleCreate} disabled={createPayable.isPending}>登録</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Aging Summary */}
        {aging && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  期日内
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(aging.current)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  1-30日延滞
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(aging.days1to30)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  31-60日延滞
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(aging.days31to60)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  61-90日延滞
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(aging.days61to90)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                  90日超
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(aging.over90)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payables List */}
        <Card>
          <CardHeader>
            <CardTitle>買掛金一覧</CardTitle>
            <CardDescription>
              合計: {formatCurrency(aging?.total || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">読み込み中...</p>
            ) : payables && payables.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>仕入先</TableHead>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>請求日</TableHead>
                    <TableHead>支払期日</TableHead>
                    <TableHead className="text-right">請求額</TableHead>
                    <TableHead className="text-right">支払済額</TableHead>
                    <TableHead className="text-right">残高</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.vendor_name}</TableCell>
                      <TableCell>{p.invoice_number}</TableCell>
                      <TableCell>{format(new Date(p.invoice_date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{format(new Date(p.due_date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.paid_amount)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(p.balance)}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell>
                        {p.status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayable(p);
                              setPaymentAmount(String(p.balance));
                              setIsPayOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            支払
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                買掛金がありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>支払を記録</DialogTitle>
              <DialogDescription>
                {selectedPayable?.vendor_name} - {selectedPayable?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>残高</Label>
                <p className="text-lg font-bold">{formatCurrency(selectedPayable?.balance || 0)}</p>
              </div>
              <div>
                <Label>支払金額 *</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayOpen(false)}>キャンセル</Button>
              <Button onClick={handlePayment} disabled={createPayment.isPending}>支払を記録</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
