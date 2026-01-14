import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency, BoostStatus } from '@/types/database';
import { Zap, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

const statusConfig: Record<BoostStatus, { label: string; color: string }> = {
  pending: { label: '審査中', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '承認済み', color: 'bg-blue-100 text-blue-800' },
  completed: { label: '完了', color: 'bg-green-100 text-green-800' },
  rejected: { label: '却下', color: 'bg-red-100 text-red-800' },
};

// Mock boost requests
const mockBoostRequests = [
  { id: '1', invoiceNumber: 'INV-2026-001', clientName: '株式会社ABC', amount: 500000, feeRate: 3, status: 'completed' as BoostStatus, requestedAt: '2026-01-05' },
  { id: '2', invoiceNumber: 'INV-2026-003', clientName: 'DEF商事', amount: 300000, feeRate: 2.5, status: 'approved' as BoostStatus, requestedAt: '2026-01-10' },
  { id: '3', invoiceNumber: 'INV-2026-005', clientName: 'GHI工業', amount: 800000, feeRate: 3.5, status: 'pending' as BoostStatus, requestedAt: '2026-01-12' },
];

export default function Boost() {
  const { data: invoices } = useInvoices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [boostRequests] = useState(mockBoostRequests);

  // Get eligible invoices (sent but not paid)
  const eligibleInvoices = invoices?.filter(inv => inv.status === 'sent') || [];

  // Calculate stats
  const totalBoosted = boostRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = boostRequests.filter(r => r.status === 'pending' || r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
  const avgFeeRate = boostRequests.length > 0
    ? boostRequests.reduce((sum, r) => sum + r.feeRate, 0) / boostRequests.length
    : 0;

  const selectedInvoiceData = eligibleInvoices.find(inv => inv.id === selectedInvoice);
  const estimatedFee = selectedInvoiceData ? selectedInvoiceData.total_amount * 0.03 : 0;
  const netAmount = selectedInvoiceData ? selectedInvoiceData.total_amount - estimatedFee : 0;

  const handleBoostRequest = () => {
    if (!selectedInvoice) return;
    alert('Boost申請を送信しました。審査結果をお待ちください。');
    setIsDialogOpen(false);
    setSelectedInvoice('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              Dynamic Boost
              <Badge variant="secondary" className="ml-2">準備中</Badge>
              <Badge variant="outline" className="text-xs">ベータ版</Badge>
            </h1>
            <p className="text-muted-foreground">請求書の即時資金化で、キャッシュフローを改善</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Boostを申請
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Dynamic Boost申請</DialogTitle>
                <DialogDescription>
                  請求書を選択して即時資金化を申請します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>対象請求書</Label>
                  <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="請求書を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleInvoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoice_number} - {formatCurrency(inv.total_amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoiceData && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">請求金額</span>
                        <span className="font-medium">{formatCurrency(selectedInvoiceData.total_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">手数料 (3.0%)</span>
                        <span className="text-destructive">-{formatCurrency(estimatedFee)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">受取額</span>
                        <span className="font-bold text-lg">{formatCurrency(netAmount)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        最短即日入金
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleBoostRequest} disabled={!selectedInvoice}>
                  申請する
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* How it works */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg">Dynamic Boostの仕組み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center p-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">1</span>
                </div>
                <p className="text-sm font-medium">請求書を選択</p>
                <p className="text-xs text-muted-foreground">送付済みの請求書が対象</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-center p-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">2</span>
                </div>
                <p className="text-sm font-medium">審査・承認</p>
                <p className="text-xs text-muted-foreground">最短30分で完了</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-center p-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">3</span>
                </div>
                <p className="text-sm font-medium">即時入金</p>
                <p className="text-xs text-muted-foreground">手数料を差し引いて振込</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>累計Boost額</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalBoosted)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>審査中・承認済み</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(pendingAmount)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>平均手数料率</CardDescription>
              <CardTitle className="text-2xl">{avgFeeRate.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Boost可能な請求書</CardDescription>
              <CardTitle className="text-2xl">{eligibleInvoices.length}件</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Boost History */}
        <Card>
          <CardHeader>
            <CardTitle>Boost履歴</CardTitle>
            <CardDescription>過去のBoost申請と状況</CardDescription>
          </CardHeader>
          <CardContent>
            {boostRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Boost履歴がありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>取引先</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="text-right">手数料率</TableHead>
                    <TableHead>申請日</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boostRequests.map((request) => {
                    const config = statusConfig[request.status];
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono">{request.invoiceNumber}</TableCell>
                        <TableCell>{request.clientName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(request.amount)}
                        </TableCell>
                        <TableCell className="text-right">{request.feeRate}%</TableCell>
                        <TableCell>{format(new Date(request.requestedAt), 'yyyy/MM/dd', { locale: ja })}</TableCell>
                        <TableCell>
                          <Badge className={config.color}>{config.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-green-500" />
                キャッシュフロー改善
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                請求書の支払い待ちをなくし、即座に資金を手にすることで事業の成長を加速
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-blue-500" />
                スピード審査
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trust Passportスコアに基づく自動審査で、最短30分で承認完了
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                透明な手数料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trust Passportランクに応じた優遇レート。隠れた費用は一切なし
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
