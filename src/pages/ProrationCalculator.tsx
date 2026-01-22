import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calculator, CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  calculateMoveInProration,
  calculateMoveOutProration,
  calculateInitialCosts,
  formatCurrency,
  PRORATION_RULE_OPTIONS,
} from '@/lib/proration';
import type { ProrationRuleType, ProrationResult, InitialCostResult } from '@/types/estate';
import { cn } from '@/lib/utils';

export default function ProrationCalculator() {
  const [calculationType, setCalculationType] = useState<'move_in' | 'move_out' | 'initial'>('move_in');
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(undefined);
  const [moveOutDate, setMoveOutDate] = useState<Date | undefined>(undefined);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [deposit, setDeposit] = useState('');
  const [keyMoney, setKeyMoney] = useState('');
  const [includeNextMonth, setIncludeNextMonth] = useState(true);

  const [selectedRules, setSelectedRules] = useState<ProrationRuleType[]>(['actual_days', 'include_start_day']);

  const [result, setResult] = useState<ProrationResult | null>(null);
  const [initialCostResult, setInitialCostResult] = useState<InitialCostResult | null>(null);

  const handleRuleToggle = (rule: ProrationRuleType) => {
    setSelectedRules((prev) => {
      // 日数計算ルールは排他的
      if (['actual_days', 'fixed_30_days', 'fixed_31_days'].includes(rule)) {
        const filtered = prev.filter((r) => !['actual_days', 'fixed_30_days', 'fixed_31_days'].includes(r));
        return [...filtered, rule];
      }
      // 当日含む/含まないも排他的
      if (['include_start_day', 'exclude_start_day'].includes(rule)) {
        const filtered = prev.filter((r) => !['include_start_day', 'exclude_start_day'].includes(r));
        return [...filtered, rule];
      }
      if (['include_end_day', 'exclude_end_day'].includes(rule)) {
        const filtered = prev.filter((r) => !['include_end_day', 'exclude_end_day'].includes(r));
        return [...filtered, rule];
      }

      if (prev.includes(rule)) {
        return prev.filter((r) => r !== rule);
      }
      return [...prev, rule];
    });
  };

  const handleCalculate = () => {
    const rent = parseInt(monthlyRent.replace(/[,￥]/g, ''), 10);
    if (isNaN(rent) || rent <= 0) {
      return;
    }

    if (calculationType === 'move_in' && moveInDate) {
      const calcResult = calculateMoveInProration({
        moveInDate,
        monthlyRent: rent,
        rules: selectedRules,
      });
      setResult(calcResult);
      setInitialCostResult(null);
    } else if (calculationType === 'move_out' && moveOutDate) {
      const calcResult = calculateMoveOutProration({
        moveOutDate,
        monthlyRent: rent,
        rules: selectedRules,
      });
      setResult(calcResult);
      setInitialCostResult(null);
    } else if (calculationType === 'initial' && moveInDate) {
      const mgmtFee = parseInt(managementFee.replace(/[,￥]/g, ''), 10) || 0;
      const dep = parseInt(deposit.replace(/[,￥]/g, ''), 10) || 0;
      const key = parseInt(keyMoney.replace(/[,￥]/g, ''), 10) || 0;

      const calcResult = calculateInitialCosts({
        moveInDate,
        monthlyRent: rent,
        managementFee: mgmtFee,
        deposit: dep,
        keyMoney: key,
        rules: selectedRules,
        includeNextMonth,
      });
      setInitialCostResult(calcResult);
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">日割り計算</h1>
        <p className="text-muted-foreground">入居・退去時の日割り家賃を計算</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              計算条件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calculation Type */}
            <div className="space-y-2">
              <Label>計算タイプ</Label>
              <div className="flex gap-2">
                <Button
                  variant={calculationType === 'move_in' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalculationType('move_in')}
                  className="flex-1 border-2"
                >
                  入居日割り
                </Button>
                <Button
                  variant={calculationType === 'move_out' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalculationType('move_out')}
                  className="flex-1 border-2"
                >
                  退去日割り
                </Button>
                <Button
                  variant={calculationType === 'initial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalculationType('initial')}
                  className="flex-1 border-2"
                >
                  初期費用
                </Button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>{calculationType === 'move_out' ? '退去日' : '入居日'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal border-2',
                      !(calculationType === 'move_out' ? moveOutDate : moveInDate) && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {calculationType === 'move_out'
                      ? moveOutDate
                        ? format(moveOutDate, 'PPP', { locale: ja })
                        : '日付を選択'
                      : moveInDate
                        ? format(moveInDate, 'PPP', { locale: ja })
                        : '日付を選択'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2" align="start">
                  <Calendar
                    mode="single"
                    selected={calculationType === 'move_out' ? moveOutDate : moveInDate}
                    onSelect={calculationType === 'move_out' ? setMoveOutDate : setMoveInDate}
                    locale={ja}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Monthly Rent */}
            <div className="space-y-2">
              <Label htmlFor="rent">月額賃料</Label>
              <Input
                id="rent"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="120,000"
                className="border-2"
              />
            </div>

            {/* Additional fields for initial costs */}
            {calculationType === 'initial' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mgmtFee">共益費/管理費</Label>
                  <Input
                    id="mgmtFee"
                    value={managementFee}
                    onChange={(e) => setManagementFee(e.target.value)}
                    placeholder="10,000"
                    className="border-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit">敷金</Label>
                    <Input
                      id="deposit"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="120,000"
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyMoney">礼金</Label>
                    <Input
                      id="keyMoney"
                      value={keyMoney}
                      onChange={(e) => setKeyMoney(e.target.value)}
                      placeholder="120,000"
                      className="border-2"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="nextMonth"
                    checked={includeNextMonth}
                    onCheckedChange={(checked) => setIncludeNextMonth(checked as boolean)}
                  />
                  <Label htmlFor="nextMonth" className="text-sm">
                    翌月分（前払い）を含める
                  </Label>
                </div>
              </>
            )}

            {/* Proration Rules */}
            <div className="space-y-3">
              <Label>計算ルール</Label>
              <div className="space-y-2">
                {/* 日数計算方式 */}
                <div className="text-xs text-muted-foreground mb-1">日数計算方式</div>
                <div className="flex flex-wrap gap-2">
                  {PRORATION_RULE_OPTIONS.filter((r) =>
                    ['actual_days', 'fixed_30_days', 'fixed_31_days'].includes(r.value)
                  ).map((rule) => (
                    <Badge
                      key={rule.value}
                      variant={selectedRules.includes(rule.value) ? 'default' : 'outline'}
                      className="cursor-pointer border-2"
                      onClick={() => handleRuleToggle(rule.value)}
                    >
                      {rule.label}
                    </Badge>
                  ))}
                </div>

                {/* 当日含む設定 */}
                <div className="text-xs text-muted-foreground mb-1 mt-3">当日の扱い</div>
                <div className="flex flex-wrap gap-2">
                  {PRORATION_RULE_OPTIONS.filter((r) =>
                    ['include_start_day', 'exclude_start_day', 'include_end_day', 'exclude_end_day'].includes(r.value)
                  ).map((rule) => (
                    <Badge
                      key={rule.value}
                      variant={selectedRules.includes(rule.value) ? 'default' : 'outline'}
                      className="cursor-pointer border-2"
                      onClick={() => handleRuleToggle(rule.value)}
                    >
                      {rule.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              計算する
            </Button>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>計算結果</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-6 bg-secondary text-center">
                  <p className="text-sm text-muted-foreground mb-2">日割り金額</p>
                  <p className="text-4xl font-bold">{formatCurrency(result.amount)}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">対象日数</span>
                    <span className="font-medium">{result.days}日</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">計算基準日数</span>
                    <span className="font-medium">{result.totalDaysInPeriod}日</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 border-2 text-sm">
                  <p className="font-mono">{result.formula}</p>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{result.description}</p>
                </div>
              </div>
            ) : initialCostResult ? (
              <div className="space-y-4">
                <div className="p-6 bg-secondary text-center">
                  <p className="text-sm text-muted-foreground mb-2">初期費用合計</p>
                  <p className="text-4xl font-bold">{formatCurrency(initialCostResult.total)}</p>
                </div>

                <div className="space-y-1">
                  {initialCostResult.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-muted/50 border-2 text-sm">
                  <p className="font-medium mb-1">日割り計算式:</p>
                  <p className="font-mono text-xs">{initialCostResult.firstMonthRent.formula}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>条件を入力して計算してください</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
