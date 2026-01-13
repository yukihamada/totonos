import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAccounts, useCreateJournalEntry } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { toast } from 'sonner';

interface JournalLine {
  id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

export default function AccountingJournalNew() {
  const navigate = useNavigate();
  const { data: accounts } = useAccounts();
  const createEntry = useCreateJournalEntry();
  
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
    { id: '2', account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + l.debit_amount, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit_amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const hasValidLines = lines.some(l => l.account_id && (l.debit_amount > 0 || l.credit_amount > 0));

  const addLine = () => {
    setLines([...lines, {
      id: Date.now().toString(),
      account_id: '',
      debit_amount: 0,
      credit_amount: 0,
      description: '',
    }]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLine, value: string | number) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      
      // If entering debit, clear credit and vice versa
      if (field === 'debit_amount' && Number(value) > 0) {
        return { ...l, [field]: Number(value), credit_amount: 0 };
      }
      if (field === 'credit_amount' && Number(value) > 0) {
        return { ...l, [field]: Number(value), debit_amount: 0 };
      }
      
      return { ...l, [field]: field.includes('amount') ? Number(value) : value };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced) {
      toast.error('借方と貸方の合計が一致しません');
      return;
    }
    
    if (!hasValidLines) {
      toast.error('少なくとも1つの仕訳行を入力してください');
      return;
    }
    
    try {
      await createEntry.mutateAsync({
        entry_date: entryDate,
        description,
        lines: lines
          .filter(l => l.account_id && (l.debit_amount > 0 || l.credit_amount > 0))
          .map(l => ({
            account_id: l.account_id,
            debit_amount: l.debit_amount,
            credit_amount: l.credit_amount,
            description: l.description,
          })),
      });
      
      toast.success('仕訳を登録しました');
      navigate('/accounting/journal');
    } catch (error) {
      toast.error('仕訳の登録に失敗しました');
    }
  };

  // Group accounts by type for easier selection
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
          <Link to="/accounting/journal">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新規仕訳</h1>
            <p className="text-muted-foreground">取引を記録</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>仕訳情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="entry_date">取引日 *</Label>
                  <Input
                    id="entry_date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">摘要</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="取引の説明..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>仕訳明細</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="mr-2 h-4 w-4" />
                    行を追加
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">勘定科目</th>
                        <th className="px-4 py-2 text-right text-sm font-medium w-[150px]">借方</th>
                        <th className="px-4 py-2 text-right text-sm font-medium w-[150px]">貸方</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">摘要</th>
                        <th className="px-4 py-2 w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, index) => (
                        <tr key={line.id} className="border-t">
                          <td className="px-4 py-2">
                            <Select
                              value={line.account_id}
                              onValueChange={(value) => updateLine(line.id, 'account_id', value)}
                            >
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
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min="0"
                              value={line.debit_amount || ''}
                              onChange={(e) => updateLine(line.id, 'debit_amount', e.target.value)}
                              className="text-right"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min="0"
                              value={line.credit_amount || ''}
                              onChange={(e) => updateLine(line.id, 'credit_amount', e.target.value)}
                              className="text-right"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                              placeholder="行の摘要..."
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLine(line.id)}
                              disabled={lines.length <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50">
                      <tr className="border-t-2">
                        <td className="px-4 py-3 font-medium">合計</td>
                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(totalDebit)}</td>
                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(totalCredit)}</td>
                        <td className="px-4 py-3">
                          {isBalanced ? (
                            <div className="flex items-center gap-2 text-chart-2">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">バランス</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">
                                差額: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                              </span>
                            </div>
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link to="/accounting/journal">
                  <Button type="button" variant="outline">キャンセル</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={!isBalanced || !hasValidLines || createEntry.isPending}
                >
                  {createEntry.isPending ? '登録中...' : '仕訳を登録'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
