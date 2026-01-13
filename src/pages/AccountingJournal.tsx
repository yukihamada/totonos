import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useJournalEntries, useDeleteJournalEntry } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { toast } from 'sonner';

export default function AccountingJournal() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: entries, isLoading } = useJournalEntries();
  const deleteEntry = useDeleteJournalEntry();

  const filteredEntries = entries?.filter(entry =>
    entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    if (!confirm('この仕訳を削除しますか？')) return;
    
    try {
      await deleteEntry.mutateAsync(id);
      toast.success('仕訳を削除しました');
    } catch (error) {
      toast.error('削除に失敗しました');
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
            <h1 className="text-3xl font-bold tracking-tight">仕訳帳</h1>
            <p className="text-muted-foreground">日々の取引を記録・管理</p>
          </div>
          <Link to="/accounting/journal/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規仕訳
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="仕訳番号・摘要で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                仕訳がありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>仕訳番号</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead>借方</TableHead>
                    <TableHead>貸方</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const totalDebit = entry.lines?.reduce((sum, l) => sum + Number(l.debit_amount), 0) || 0;
                    const debitAccounts = entry.lines?.filter(l => l.debit_amount > 0).map(l => l.account?.account_name).join(', ');
                    const creditAccounts = entry.lines?.filter(l => l.credit_amount > 0).map(l => l.account?.account_name).join(', ');
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.entry_number}</TableCell>
                        <TableCell>{entry.entry_date}</TableCell>
                        <TableCell>{entry.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-chart-2" />
                            <span className="text-sm">{debitAccounts || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-chart-4" />
                            <span className="text-sm">{creditAccounts || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(totalDebit)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            削除
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
