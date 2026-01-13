import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ArrowLeft } from 'lucide-react';
import { useAccounts, useGeneralLedger } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { getAccountTypeLabel } from '@/types/accounting';

export default function AccountingLedger() {
  const currentYear = new Date().getFullYear();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  
  const { data: accounts } = useAccounts();
  const { data: ledgerData, isLoading } = useGeneralLedger(selectedAccountId, startDate, endDate);

  const selectedAccount = accounts?.find(a => a.id === selectedAccountId);

  // Group accounts by type
  const groupedAccounts = accounts?.reduce((acc, account) => {
    const type = account.account_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>) || {};

  const accountTypeLabels: Record<string, string> = {
    asset: '資産',
    liability: '負債',
    equity: '純資産',
    revenue: '収益',
    expense: '費用',
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">総勘定元帳</h1>
            <p className="text-muted-foreground">勘定科目別の取引一覧</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>検索条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>勘定科目</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="科目を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedAccounts).map(([type, accs]) => (
                      <div key={type}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {accountTypeLabels[type]}
                        </div>
                        {accs?.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.account_code} - {acc.account_name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>開始日</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>終了日</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedAccountId && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedAccount?.account_code} - {selectedAccount?.account_name}
              </CardTitle>
              <CardDescription>
                {startDate} 〜 {endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
              ) : !ledgerData || ledgerData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  この期間の取引データがありません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>仕訳番号</TableHead>
                      <TableHead>摘要</TableHead>
                      <TableHead className="text-right">借方</TableHead>
                      <TableHead className="text-right">貸方</TableHead>
                      <TableHead className="text-right">残高</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerData.map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.journal_entry?.entry_date}</TableCell>
                        <TableCell className="font-mono">{line.journal_entry?.entry_number}</TableCell>
                        <TableCell>{line.description || line.journal_entry?.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          {Number(line.debit_amount) > 0 ? formatCurrency(Number(line.debit_amount)) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(line.credit_amount) > 0 ? formatCurrency(Number(line.credit_amount)) : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${line.running_balance < 0 ? 'text-destructive' : ''}`}>
                          {formatCurrency(Math.abs(line.running_balance))}
                          {line.running_balance < 0 && ' (貸)'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedAccountId && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              勘定科目を選択してください
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
