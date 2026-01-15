import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle, Circle, AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFiscalPeriods, usePeriodCloseProcess, useStartPeriodClose, useAdvancePeriodClose, useCloseFiscalPeriod } from '@/hooks/useAccounting';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const STEPS = [
  { key: 'draft', label: '準備', description: '決算準備・棚卸確認' },
  { key: 'adjustments', label: '決算整理', description: '決算整理仕訳の入力' },
  { key: 'tax_calculation', label: '税金計算', description: '法人税・消費税の計算' },
  { key: 'closing_entries', label: '振替仕訳', description: '損益振替仕訳の作成' },
  { key: 'completed', label: '完了', description: '決算確定・繰越処理' },
];

export default function AccountingPeriodClose() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const { data: periods } = useFiscalPeriods();
  const { data: closeProcess, isLoading } = usePeriodCloseProcess(selectedPeriodId || undefined);
  const startClose = useStartPeriodClose();
  const advanceClose = useAdvancePeriodClose();
  const closePeriod = useCloseFiscalPeriod();

  const selectedPeriod = periods?.find(p => p.id === selectedPeriodId);
  const currentProcess = Array.isArray(closeProcess) ? closeProcess[0] : closeProcess;
  const currentStepIndex = currentProcess ? STEPS.findIndex(s => s.key === currentProcess.step) : -1;

  const handleStart = async () => {
    if (!selectedPeriodId) {
      toast.error('会計期間を選択してください');
      return;
    }

    try {
      await startClose.mutateAsync(selectedPeriodId);
      toast.success('決算処理を開始しました');
    } catch (error) {
      toast.error('決算処理の開始に失敗しました');
    }
  };

  const handleAdvance = async () => {
    if (!currentProcess) return;

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex >= STEPS.length) return;

    const nextStep = STEPS[nextStepIndex].key as any;

    try {
      if (nextStep === 'completed') {
        await advanceClose.mutateAsync({
          processId: currentProcess.id,
          nextStep,
        });
        await closePeriod.mutateAsync(selectedPeriodId);
        toast.success('決算処理が完了しました');
      } else {
        await advanceClose.mutateAsync({
          processId: currentProcess.id,
          nextStep,
        });
        toast.success('次のステップに進みました');
      }
    } catch (error) {
      toast.error('処理に失敗しました');
    }
  };

  const getStepIcon = (index: number) => {
    if (index < currentStepIndex) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (index === currentStepIndex) {
      return <Play className="h-6 w-6 text-primary animate-pulse" />;
    } else {
      return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/accounting/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">決算処理</h1>
            <p className="text-muted-foreground">期末締め処理と繰越仕訳</p>
          </div>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>会計期間選択</CardTitle>
            <CardDescription>決算処理を行う会計期間を選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="会計期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  {periods?.filter(p => !p.is_closed).map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.period_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPeriod && !currentProcess && (
                <Button onClick={handleStart} disabled={startClose.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  決算処理を開始
                </Button>
              )}
            </div>
            {selectedPeriod && (
              <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <span>開始: {format(new Date(selectedPeriod.start_date), 'yyyy年M月d日', { locale: ja })}</span>
                <span>終了: {format(new Date(selectedPeriod.end_date), 'yyyy年M月d日', { locale: ja })}</span>
                {selectedPeriod.is_closed && (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    締め済み
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Already Closed Periods */}
        {periods?.some(p => p.is_closed) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                締め済み会計期間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {periods.filter(p => p.is_closed).map(period => (
                  <div key={period.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{period.period_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(period.start_date), 'yyyy/MM/dd')} 〜 {format(new Date(period.end_date), 'yyyy/MM/dd')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        完了
                      </Badge>
                      {period.closed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          締め日: {format(new Date(period.closed_at), 'yyyy/MM/dd HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Close Process Steps */}
        {currentProcess && (
          <Card>
            <CardHeader>
              <CardTitle>決算処理ステップ</CardTitle>
              <CardDescription>
                開始日時: {format(new Date(currentProcess.started_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {STEPS.map((step, index) => (
                  <div
                    key={step.key}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                      index === currentStepIndex
                        ? 'bg-primary/10 border-2 border-primary'
                        : index < currentStepIndex
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(index)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-lg">
                        ステップ {index + 1}: {step.label}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                      {index === currentStepIndex && (
                        <div className="mt-4 space-y-4">
                          {step.key === 'draft' && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-medium">確認事項</span>
                              </div>
                              <ul className="mt-2 space-y-1 text-sm">
                                <li>• 全ての取引が入力されているか確認してください</li>
                                <li>• 棚卸資産の金額を確定してください</li>
                                <li>• 仮払金・仮受金の精算を完了してください</li>
                              </ul>
                            </div>
                          )}
                          {step.key === 'adjustments' && (
                            <div className="space-y-2">
                              <p className="text-sm">以下の決算整理仕訳を確認・入力してください:</p>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 減価償却費の計上</li>
                                <li>• 貸倒引当金の設定</li>
                                <li>• 前払費用・未払費用の計上</li>
                                <li>• 在庫評価損の計上</li>
                              </ul>
                              <Link to="/accounting/journal/new">
                                <Button variant="outline" size="sm">
                                  決算整理仕訳を入力
                                </Button>
                              </Link>
                            </div>
                          )}
                          {step.key === 'tax_calculation' && (
                            <div className="space-y-2">
                              <p className="text-sm">税金の計算を行ってください:</p>
                              <div className="flex gap-2">
                                <Link to="/accounting/tax">
                                  <Button variant="outline" size="sm">
                                    消費税計算
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )}
                          {step.key === 'closing_entries' && (
                            <div className="space-y-2">
                              <p className="text-sm">損益振替仕訳を作成します。収益・費用勘定を繰越利益剰余金へ振り替えます。</p>
                            </div>
                          )}
                          {step.key === 'completed' && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-green-700 dark:text-green-400">
                                決算処理が完了しました。この会計期間は締められ、仕訳の追加・変更ができなくなります。
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {index === currentStepIndex && index < STEPS.length - 1 && (
                      <Button
                        onClick={handleAdvance}
                        disabled={advanceClose.isPending}
                        className="flex-shrink-0"
                      >
                        次へ
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                    {index === currentStepIndex && index === STEPS.length - 2 && (
                      <Button
                        onClick={handleAdvance}
                        disabled={advanceClose.isPending || closePeriod.isPending}
                        className="flex-shrink-0 bg-green-600 hover:bg-green-700"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        決算確定
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
