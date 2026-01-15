import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, FileText, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFiscalPeriods, useTaxCalculations, useCalculateTax, useTaxSettings } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function AccountingTax() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const { data: periods } = useFiscalPeriods();
  const { data: calculations, isLoading } = useTaxCalculations(selectedPeriodId || undefined);
  const { data: taxSettings } = useTaxSettings();
  const calculateTax = useCalculateTax();

  const selectedPeriod = periods?.find(p => p.id === selectedPeriodId);

  const handleCalculate = async () => {
    if (!selectedPeriod) {
      toast.error('会計期間を選択してください');
      return;
    }

    try {
      await calculateTax.mutateAsync({
        fiscalPeriodId: selectedPeriod.id,
        startDate: selectedPeriod.start_date,
        endDate: selectedPeriod.end_date,
      });
      toast.success('消費税を計算しました');
    } catch (error) {
      toast.error('消費税の計算に失敗しました');
    }
  };

  const latestCalculation = calculations?.[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/accounting">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">消費税計算</h1>
            <p className="text-muted-foreground">消費税の計算と申告準備</p>
          </div>
        </div>

        {/* Tax Settings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              税率設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">消費税率</p>
                <p className="text-2xl font-bold">{taxSettings?.consumption_tax_rate || 10}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">課税方式</p>
                <p className="text-lg font-medium">
                  {taxSettings?.is_simplified_taxation ? '簡易課税' : '本則課税'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">会計年度開始月</p>
                <p className="text-lg font-medium">{taxSettings?.fiscal_year_start_month || 4}月</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Selection and Calculate */}
        <Card>
          <CardHeader>
            <CardTitle>期間選択</CardTitle>
            <CardDescription>消費税を計算する会計期間を選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="会計期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  {periods?.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.period_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleCalculate}
                disabled={!selectedPeriodId || calculateTax.isPending}
              >
                <Calculator className="h-4 w-4 mr-2" />
                消費税を計算
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Latest Calculation Result */}
        {latestCalculation && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  売上に係る消費税
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">課税売上高</span>
                  <span className="font-medium">{formatCurrency(latestCalculation.sales_taxable)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">仮受消費税</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(latestCalculation.sales_tax_collected)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  仕入に係る消費税
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">課税仕入高</span>
                  <span className="font-medium">{formatCurrency(latestCalculation.purchases_taxable)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">仮払消費税</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(latestCalculation.purchases_tax_paid)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Net Tax Liability */}
        {latestCalculation && (
          <Card className={latestCalculation.net_tax_liability >= 0 ? 'border-red-200' : 'border-green-200'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                消費税納付額
              </CardTitle>
              <CardDescription>
                計算日: {format(new Date(latestCalculation.calculation_date), 'yyyy年M月d日', { locale: ja })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">
                  {latestCalculation.net_tax_liability >= 0 ? '納付すべき消費税額' : '還付される消費税額'}
                </p>
                <p className={`text-4xl font-bold ${
                  latestCalculation.net_tax_liability >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(Math.abs(latestCalculation.net_tax_liability))}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculation History */}
        <Card>
          <CardHeader>
            <CardTitle>計算履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">読み込み中...</p>
            ) : calculations && calculations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>計算日</TableHead>
                    <TableHead className="text-right">課税売上高</TableHead>
                    <TableHead className="text-right">仮受消費税</TableHead>
                    <TableHead className="text-right">課税仕入高</TableHead>
                    <TableHead className="text-right">仮払消費税</TableHead>
                    <TableHead className="text-right">差引消費税額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calc: any) => (
                    <TableRow key={calc.id}>
                      <TableCell>
                        {format(new Date(calc.calculation_date), 'yyyy/MM/dd')}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(calc.sales_taxable)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(calc.sales_tax_collected)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calc.purchases_taxable)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(calc.purchases_tax_paid)}</TableCell>
                      <TableCell className={`text-right font-bold ${
                        calc.net_tax_liability >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(calc.net_tax_liability)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                計算履歴がありません。会計期間を選択して消費税を計算してください。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
