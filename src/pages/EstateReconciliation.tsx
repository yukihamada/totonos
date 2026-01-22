import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Search,
  Check,
  AlertCircle,
  Sparkles,
  FileUp,
  Loader2,
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { readAndParseCSV, type BankTransaction as ParsedTransaction } from '@/lib/csv-parser';
import type { BankTransaction, RentInvoice, Tenant } from '@/types/estate';

interface TransactionDisplay {
  id: string;
  date: string;
  depositorName: string;
  amount: number;
  matchConfidence: number;
  suggestedMatch: {
    invoiceId: string;
    tenantName: string;
    invoiceNumber: string;
    amount: number;
  } | null;
  status: 'exact_match' | 'high_confidence' | 'partial_match' | 'no_match';
}

interface InvoiceWithTenant extends RentInvoice {
  tenant: Tenant;
}

export default function EstateReconciliation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDisplay | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    errors: string[];
    transactions: ParsedTransaction[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch unmatched bank transactions
  const { data: bankTransactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['bank-transactions-unmatched', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_matched', false)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as BankTransaction[];
    },
    enabled: !!user?.id,
  });

  // Fetch unpaid invoices for matching
  const { data: unpaidInvoices } = useQuery({
    queryKey: ['rent-invoices-unpaid', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('rent_invoices')
        .select(`
          *,
          tenant:tenants (id, name, name_kana)
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'partial'])
        .order('due_date');

      if (error) throw error;
      return data as InvoiceWithTenant[];
    },
    enabled: !!user?.id,
  });

  // Process transactions for display with matching
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);

  useEffect(() => {
    if (!bankTransactions || !unpaidInvoices) return;

    const displayTransactions: TransactionDisplay[] = bankTransactions.map((tx) => {
      let bestMatch = null;
      let bestConfidence = 0;

      for (const invoice of unpaidInvoices) {
        const tenant = invoice.tenant;
        if (!tenant) continue;

        let confidence = 0;

        const balance = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
        if (tx.amount === balance) {
          confidence += 50;
        } else if (Math.abs(tx.amount - balance) < balance * 0.1) {
          confidence += 30;
        }

        const txName = (tx.depositor_name_kana || tx.depositor_name || '').toLowerCase();
        const tenantName = (tenant.name_kana || tenant.name || '').toLowerCase();

        if (txName.includes(tenantName) || tenantName.includes(txName)) {
          confidence += 40;
        } else {
          const words = tenantName.split(/[\s　]+/);
          if (words.some((w) => txName.includes(w))) {
            confidence += 20;
          }
        }

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = {
            invoiceId: invoice.id,
            tenantName: tenant.name,
            invoiceNumber: invoice.invoice_number || '-',
            amount: balance,
          };
        }
      }

      let status: TransactionDisplay['status'] = 'no_match';
      if (bestConfidence >= 90) status = 'exact_match';
      else if (bestConfidence >= 70) status = 'high_confidence';
      else if (bestConfidence >= 40) status = 'partial_match';

      return {
        id: tx.id,
        date: tx.transaction_date,
        depositorName: tx.depositor_name,
        amount: tx.amount,
        matchConfidence: bestConfidence,
        suggestedMatch: bestConfidence >= 40 ? bestMatch : null,
        status,
      };
    });

    setTransactions(displayTransactions);
  }, [bankTransactions, unpaidInvoices]);

  const stats = {
    unmatched: transactions.filter((t) => t.status === 'no_match').length,
    aiCandidates: transactions.filter((t) => t.matchConfidence > 0).length,
    unmatchedAmount: transactions.filter((t) => t.status === 'no_match').reduce((s, t) => s + t.amount, 0),
    needsReview: transactions.filter((t) => t.status === 'partial_match').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getConfidenceBadge = (confidence: number, status: string) => {
    if (status === 'exact_match') {
      return <Badge className="bg-chart-2 text-background">完全一致</Badge>;
    }
    if (confidence >= 80) {
      return <Badge className="bg-chart-2 text-background">高確度 {confidence}%</Badge>;
    } else if (confidence >= 50) {
      return <Badge variant="secondary">中確度 {confidence}%</Badge>;
    } else if (confidence > 0) {
      return <Badge variant="outline">低確度 {confidence}%</Badge>;
    }
    return <Badge variant="destructive">マッチなし</Badge>;
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('CSVファイルを選択してください');
      return;
    }

    setIsUploading(true);
    setShowUploadDialog(true);

    try {
      const result = await readAndParseCSV(file);

      setUploadResult({
        success: result.successRows,
        errors: result.errors,
        transactions: result.transactions,
      });

      if (result.successRows > 0) {
        toast.success(`${result.successRows}件の入金データを読み込みました`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error('ファイルの読み込みに失敗しました', { description: message });
      setUploadResult({ success: 0, errors: [message], transactions: [] });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleImportConfirm = useCallback(async () => {
    if (!uploadResult?.transactions.length || !user?.id) return;

    try {
      const insertData = uploadResult.transactions.map((tx) => ({
        user_id: user.id,
        transaction_date: tx.transactionDate,
        depositor_name: tx.depositorName,
        depositor_name_kana: tx.depositorNameKana || null,
        amount: tx.amount,
        bank_name: tx.bankName || null,
        branch_name: tx.branchName || null,
        reference_number: tx.referenceNumber || null,
        is_matched: false,
      }));

      const { error } = await supabase.from('bank_transactions').insert(insertData);

      if (error) throw error;

      toast.success(`${uploadResult.transactions.length}件をインポートしました`);
      setShowUploadDialog(false);
      setUploadResult(null);
      queryClient.invalidateQueries({ queryKey: ['bank-transactions-unmatched'] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error('インポートに失敗しました', { description: message });
    }
  }, [uploadResult, user?.id, queryClient]);

  const confirmMatchMutation = useMutation({
    mutationFn: async ({ transactionId, invoiceId }: { transactionId: string; invoiceId: string }) => {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (!transaction) throw new Error('Transaction not found');

      const { error: paymentError } = await supabase.from('rent_payments').insert({
        user_id: user?.id,
        invoice_id: invoiceId,
        bank_transaction_id: transactionId,
        amount: transaction.amount,
        payment_date: transaction.date,
        payment_method: 'bank_transfer',
      });

      if (paymentError) throw paymentError;

      const { error: txError } = await supabase
        .from('bank_transactions')
        .update({
          is_matched: true,
          matched_invoice_id: invoiceId,
          matched_at: new Date().toISOString(),
          match_confidence: transaction.matchConfidence,
        })
        .eq('id', transactionId);

      if (txError) throw txError;
    },
    onSuccess: () => {
      toast.success('消込を確定しました');
      queryClient.invalidateQueries({ queryKey: ['bank-transactions-unmatched'] });
      queryClient.invalidateQueries({ queryKey: ['rent-invoices-unpaid'] });
      setShowManualDialog(false);
      setSelectedTransaction(null);
      setSelectedInvoiceId('');
    },
    onError: (error: Error) => {
      toast.error('消込に失敗しました', { description: error.message });
    },
  });

  const handleConfirmMatch = (transactionId: string, invoiceId?: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    const targetInvoiceId = invoiceId || transaction.suggestedMatch?.invoiceId;
    if (!targetInvoiceId) {
      toast.error('請求書を選択してください');
      return;
    }

    confirmMatchMutation.mutate({ transactionId, invoiceId: targetInvoiceId });
  };

  const handleManualMatch = (transaction: TransactionDisplay) => {
    setSelectedTransaction(transaction);
    setShowManualDialog(true);
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.depositorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">家賃入金消込</h1>
          <p className="text-muted-foreground">銀行入金データと家賃請求の照合・消込処理</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            銀行CSVをアップロード
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            {loadingTransactions ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats.unmatched}</div>
            )}
            <p className="text-sm text-muted-foreground">未消込件数</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            {loadingTransactions ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats.aiCandidates}</div>
            )}
            <p className="text-sm text-muted-foreground">AIマッチ候補</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            {loadingTransactions ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats.unmatchedAmount)}</div>
            )}
            <p className="text-sm text-muted-foreground">未消込金額</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            {loadingTransactions ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats.needsReview}</div>
            )}
            <p className="text-sm text-muted-foreground">要確認</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="振込人名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2"
        />
      </div>

      {loadingTransactions ? (
        <Card className="border-2">
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : filteredTransactions.length > 0 ? (
        <Card className="border-2">
          <CardHeader className="border-b-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI消込ワークベンチ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead>入金日</TableHead>
                  <TableHead>振込人名</TableHead>
                  <TableHead className="text-right">入金額</TableHead>
                  <TableHead>マッチング</TableHead>
                  <TableHead>候補</TableHead>
                  <TableHead className="w-32">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-b">
                    <TableCell>{tx.date}</TableCell>
                    <TableCell className="font-medium">{tx.depositorName}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>{getConfidenceBadge(tx.matchConfidence, tx.status)}</TableCell>
                    <TableCell>
                      {tx.suggestedMatch ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium">{tx.suggestedMatch.tenantName}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.suggestedMatch.invoiceNumber} / {formatCurrency(tx.suggestedMatch.amount)}
                            </p>
                          </div>
                          {tx.amount !== tx.suggestedMatch.amount && (
                            <Badge variant="outline" className="text-xs border-chart-1 text-chart-1">
                              差額あり
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">候補なし</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {tx.suggestedMatch ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => handleConfirmMatch(tx.id)}
                            disabled={confirmMatchMutation.isPending}
                          >
                            <Check className="h-3 w-3" />
                            確定
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8" onClick={() => handleManualMatch(tx)}>
                            手動消込
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
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">未消込の入金データがありません</h3>
            <p className="text-muted-foreground mt-1 mb-4">銀行CSVをアップロードして消込を開始してください</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              CSVをアップロード
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 bg-secondary/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-background border-2">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">AIマッチングについて</h3>
              <p className="text-sm text-muted-foreground mt-1">
                振込人名と入居者名を自動照合し、マッチング候補を提示します。
                確度が高いものから順に確認し、「確定」ボタンで消込を完了してください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg border-2">
          <DialogHeader>
            <DialogTitle>CSVインポート結果</DialogTitle>
          </DialogHeader>

          {isUploading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-muted-foreground">ファイルを解析中...</p>
            </div>
          ) : uploadResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-chart-2">{uploadResult.success}</div>
                    <p className="text-sm text-muted-foreground">読み込み成功</p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-destructive">{uploadResult.errors.length}</div>
                    <p className="text-sm text-muted-foreground">エラー</p>
                  </CardContent>
                </Card>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="max-h-32 overflow-auto border-2 p-3 bg-destructive/5">
                  <p className="text-sm font-medium mb-2">エラー詳細:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {uploadResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {uploadResult.errors.length > 5 && <li>...他 {uploadResult.errors.length - 5} 件</li>}
                  </ul>
                </div>
              )}

              {uploadResult.success > 0 && (
                <div className="max-h-48 overflow-auto border-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日付</TableHead>
                        <TableHead>振込人</TableHead>
                        <TableHead className="text-right">金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadResult.transactions.slice(0, 5).map((tx, i) => (
                        <TableRow key={i}>
                          <TableCell>{tx.transactionDate}</TableCell>
                          <TableCell>{tx.depositorName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {uploadResult.transactions.length > 5 && (
                    <p className="text-xs text-muted-foreground p-2 text-center">
                      ...他 {uploadResult.transactions.length - 5} 件
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-2" onClick={() => setShowUploadDialog(false)}>
                  キャンセル
                </Button>
                <Button className="flex-1" onClick={handleImportConfirm} disabled={uploadResult.success === 0}>
                  インポートを確定
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="max-w-lg border-2">
          <DialogHeader>
            <DialogTitle>手動消込</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">入金情報</p>
                <p className="font-medium">{selectedTransaction.depositorName}</p>
                <p className="text-lg font-bold">{formatCurrency(selectedTransaction.amount)}</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.date}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">請求書を選択</p>
                <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="請求書を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {unpaidInvoices?.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.tenant?.name} - {inv.invoice_number || '-'} (
                        {formatCurrency((inv.total_amount || 0) - (inv.paid_amount || 0))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowManualDialog(false)}>
                  キャンセル
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleConfirmMatch(selectedTransaction.id, selectedInvoiceId)}
                  disabled={!selectedInvoiceId || confirmMatchMutation.isPending}
                >
                  {confirmMatchMutation.isPending ? '処理中...' : '消込を確定'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
