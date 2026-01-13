import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { useTrialBalance, useAccounts } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { getAccountTypeLabel, getAccountTypeColor } from '@/types/accounting';
import { Badge } from '@/components/ui/badge';

export default function AccountingStatements() {
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  
  const { data: trialBalance, isLoading } = useTrialBalance(startDate, endDate);
  const { data: accounts } = useAccounts();

  // Calculate totals
  const totalDebit = trialBalance?.reduce((sum, b) => sum + b.debit, 0) || 0;
  const totalCredit = trialBalance?.reduce((sum, b) => sum + b.credit, 0) || 0;

  // Balance Sheet data
  const assets = trialBalance?.filter(b => b.account.account_type === 'asset') || [];
  const liabilities = trialBalance?.filter(b => b.account.account_type === 'liability') || [];
  const equity = trialBalance?.filter(b => b.account.account_type === 'equity') || [];
  
  const totalAssets = assets.reduce((sum, b) => sum + (b.debit - b.credit), 0);
  const totalLiabilities = liabilities.reduce((sum, b) => sum + (b.credit - b.debit), 0);
  const totalEquity = equity.reduce((sum, b) => sum + (b.credit - b.debit), 0);

  // P&L data
  const revenues = trialBalance?.filter(b => b.account.account_type === 'revenue') || [];
  const expenses = trialBalance?.filter(b => b.account.account_type === 'expense') || [];
  
  const totalRevenue = revenues.reduce((sum, b) => sum + (b.credit - b.debit), 0);
  const totalExpenses = expenses.reduce((sum, b) => sum + (b.debit - b.credit), 0);
  const netIncome = totalRevenue - totalExpenses;

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
            <h1 className="text-3xl font-bold tracking-tight">財務諸表</h1>
            <p className="text-muted-foreground">試算表・貸借対照表・損益計算書</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>期間選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
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

        <Tabs defaultValue="trial-balance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trial-balance">試算表</TabsTrigger>
            <TabsTrigger value="balance-sheet">貸借対照表</TabsTrigger>
            <TabsTrigger value="income-statement">損益計算書</TabsTrigger>
          </TabsList>

          <TabsContent value="trial-balance">
            <Card>
              <CardHeader>
                <CardTitle>試算表</CardTitle>
                <CardDescription>
                  {startDate} 〜 {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
                ) : !trialBalance || trialBalance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    この期間の仕訳データがありません
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>科目コード</TableHead>
                        <TableHead>勘定科目</TableHead>
                        <TableHead>区分</TableHead>
                        <TableHead className="text-right">借方</TableHead>
                        <TableHead className="text-right">貸方</TableHead>
                        <TableHead className="text-right">残高</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalance.map((balance) => {
                        const netBalance = balance.debit - balance.credit;
                        return (
                          <TableRow key={balance.account.id}>
                            <TableCell className="font-mono">{balance.account.account_code}</TableCell>
                            <TableCell>{balance.account.account_name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={getAccountTypeColor(balance.account.account_type)}>
                                {getAccountTypeLabel(balance.account.account_type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(balance.debit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(balance.credit)}</TableCell>
                            <TableCell className={`text-right font-medium ${netBalance < 0 ? 'text-destructive' : ''}`}>
                              {formatCurrency(Math.abs(netBalance))}
                              {netBalance < 0 && ' (貸)'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <tfoot>
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={3}>合計</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </tfoot>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance-sheet">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>資産の部</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {assets.map((balance) => (
                        <TableRow key={balance.account.id}>
                          <TableCell>{balance.account.account_name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(balance.debit - balance.credit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot>
                      <TableRow className="font-bold border-t-2">
                        <TableCell>資産合計</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
                      </TableRow>
                    </tfoot>
                  </Table>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>負債の部</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        {liabilities.map((balance) => (
                          <TableRow key={balance.account.id}>
                            <TableCell>{balance.account.account_name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(balance.credit - balance.debit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <tfoot>
                        <TableRow className="font-bold border-t-2">
                          <TableCell>負債合計</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalLiabilities)}</TableCell>
                        </TableRow>
                      </tfoot>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>純資産の部</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        {equity.map((balance) => (
                          <TableRow key={balance.account.id}>
                            <TableCell>{balance.account.account_name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(balance.credit - balance.debit)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell>当期純利益</TableCell>
                          <TableCell className="text-right">{formatCurrency(netIncome)}</TableCell>
                        </TableRow>
                      </TableBody>
                      <tfoot>
                        <TableRow className="font-bold border-t-2">
                          <TableCell>純資産合計</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalEquity + netIncome)}</TableCell>
                        </TableRow>
                      </tfoot>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="income-statement">
            <Card>
              <CardHeader>
                <CardTitle>損益計算書</CardTitle>
                <CardDescription>
                  {startDate} 〜 {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">売上高</h3>
                    <Table>
                      <TableBody>
                        {revenues.map((balance) => (
                          <TableRow key={balance.account.id}>
                            <TableCell>{balance.account.account_name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(balance.credit - balance.debit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <tfoot>
                        <TableRow className="font-bold border-t">
                          <TableCell>売上高合計</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
                        </TableRow>
                      </tfoot>
                    </Table>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">費用</h3>
                    <Table>
                      <TableBody>
                        {expenses.map((balance) => (
                          <TableRow key={balance.account.id}>
                            <TableCell>{balance.account.account_name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(balance.debit - balance.credit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <tfoot>
                        <TableRow className="font-bold border-t">
                          <TableCell>費用合計</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalExpenses)}</TableCell>
                        </TableRow>
                      </tfoot>
                    </Table>
                  </div>

                  <div className="border-t-4 pt-4">
                    <Table>
                      <TableBody>
                        <TableRow className="text-lg font-bold">
                          <TableCell>当期純利益</TableCell>
                          <TableCell className={`text-right ${netIncome < 0 ? 'text-destructive' : 'text-chart-2'}`}>
                            {formatCurrency(netIncome)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
