import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Wallet, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCashFlowStatement } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';

export default function AccountingCashFlow() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: cashFlow, isLoading } = useCashFlowStatement(startDate, endDate);

  const formatAmount = (amount: number) => {
    const formatted = formatCurrency(Math.abs(amount));
    return amount >= 0 ? formatted : `(${formatted})`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/accounting/statements">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">キャッシュフロー計算書</h1>
              <p className="text-muted-foreground">現金及び現金同等物の増減分析</p>
            </div>
          </div>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            PDFエクスポート
          </Button>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>期間選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <Label>開始日</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
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

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">読み込み中...</p>
            </CardContent>
          </Card>
        ) : cashFlow ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    期首現金残高
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(cashFlow.beginning_cash)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {cashFlow.net_change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    当期増減
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${cashFlow.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(cashFlow.net_change)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    期末現金残高
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(cashFlow.ending_cash)}</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">フリーキャッシュフロー</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${(cashFlow.net_operating + cashFlow.net_investing) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(cashFlow.net_operating + cashFlow.net_investing)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Statement */}
            <Card>
              <CardHeader>
                <CardTitle>キャッシュフロー計算書</CardTitle>
                <CardDescription>
                  {cashFlow.period_start} 〜 {cashFlow.period_end}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {/* Operating Activities */}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-bold">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4" />
                          営業活動によるキャッシュフロー
                        </div>
                      </TableCell>
                    </TableRow>
                    {cashFlow.operating_activities.length > 0 ? (
                      cashFlow.operating_activities.slice(0, 10).map((item, index) => (
                        <TableRow key={`op-${index}`}>
                          <TableCell className="pl-8">{item.description}</TableCell>
                          <TableCell className={`text-right ${item.amount >= 0 ? '' : 'text-red-600'}`}>
                            {formatAmount(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="pl-8 text-muted-foreground">取引なし</TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="border-t-2">
                      <TableCell className="pl-8 font-bold">営業活動によるキャッシュフロー合計</TableCell>
                      <TableCell className={`text-right font-bold ${cashFlow.net_operating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(cashFlow.net_operating)}
                      </TableCell>
                    </TableRow>

                    {/* Investing Activities */}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-bold">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4" />
                          投資活動によるキャッシュフロー
                        </div>
                      </TableCell>
                    </TableRow>
                    {cashFlow.investing_activities.length > 0 ? (
                      cashFlow.investing_activities.slice(0, 10).map((item, index) => (
                        <TableRow key={`inv-${index}`}>
                          <TableCell className="pl-8">{item.description}</TableCell>
                          <TableCell className={`text-right ${item.amount >= 0 ? '' : 'text-red-600'}`}>
                            {formatAmount(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="pl-8 text-muted-foreground">取引なし</TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="border-t-2">
                      <TableCell className="pl-8 font-bold">投資活動によるキャッシュフロー合計</TableCell>
                      <TableCell className={`text-right font-bold ${cashFlow.net_investing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(cashFlow.net_investing)}
                      </TableCell>
                    </TableRow>

                    {/* Financing Activities */}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-bold">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4" />
                          財務活動によるキャッシュフロー
                        </div>
                      </TableCell>
                    </TableRow>
                    {cashFlow.financing_activities.length > 0 ? (
                      cashFlow.financing_activities.slice(0, 10).map((item, index) => (
                        <TableRow key={`fin-${index}`}>
                          <TableCell className="pl-8">{item.description}</TableCell>
                          <TableCell className={`text-right ${item.amount >= 0 ? '' : 'text-red-600'}`}>
                            {formatAmount(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="pl-8 text-muted-foreground">取引なし</TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="border-t-2">
                      <TableCell className="pl-8 font-bold">財務活動によるキャッシュフロー合計</TableCell>
                      <TableCell className={`text-right font-bold ${cashFlow.net_financing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(cashFlow.net_financing)}
                      </TableCell>
                    </TableRow>

                    {/* Summary */}
                    <TableRow className="bg-primary/10">
                      <TableCell className="font-bold text-lg">現金及び現金同等物の増減額</TableCell>
                      <TableCell className={`text-right font-bold text-lg ${cashFlow.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(cashFlow.net_change)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>現金及び現金同等物の期首残高</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashFlow.beginning_cash)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-primary/10">
                      <TableCell className="font-bold text-lg">現金及び現金同等物の期末残高</TableCell>
                      <TableCell className="text-right font-bold text-lg">{formatCurrency(cashFlow.ending_cash)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                期間を選択してキャッシュフローを表示してください
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
