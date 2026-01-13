import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { 
  useAccounts, 
  useCreateAccount,
  useFiscalPeriods, 
  useCreateFiscalPeriod,
  useTaxSettings, 
  useUpsertTaxSettings,
  useInitializeAccounts
} from '@/hooks/useAccounting';
import { getAccountTypeLabel, getAccountTypeColor, type AccountType } from '@/types/accounting';
import { toast } from 'sonner';

export default function AccountingSettings() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: fiscalPeriods } = useFiscalPeriods();
  const { data: taxSettings } = useTaxSettings();
  
  const createAccount = useCreateAccount();
  const createPeriod = useCreateFiscalPeriod();
  const upsertTaxSettings = useUpsertTaxSettings();
  const initializeAccounts = useInitializeAccounts();
  
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  
  const [newAccount, setNewAccount] = useState({
    account_code: '',
    account_name: '',
    account_type: 'expense' as AccountType,
  });
  
  const [newPeriod, setNewPeriod] = useState({
    period_name: '',
    start_date: '',
    end_date: '',
  });
  
  const [taxForm, setTaxForm] = useState({
    fiscal_year_start_month: 4,
    consumption_tax_rate: 10,
    corporate_tax_rate: 23.2,
    is_simplified_taxation: false,
  });
  
  useEffect(() => {
    if (taxSettings) {
      setTaxForm({
        fiscal_year_start_month: taxSettings.fiscal_year_start_month,
        consumption_tax_rate: Number(taxSettings.consumption_tax_rate),
        corporate_tax_rate: Number(taxSettings.corporate_tax_rate) || 23.2,
        is_simplified_taxation: taxSettings.is_simplified_taxation,
      });
    }
  }, [taxSettings]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount.mutateAsync(newAccount);
      toast.success('勘定科目を追加しました');
      setAccountDialogOpen(false);
      setNewAccount({ account_code: '', account_name: '', account_type: 'expense' });
    } catch (error) {
      toast.error('追加に失敗しました');
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPeriod.mutateAsync(newPeriod);
      toast.success('会計期間を追加しました');
      setPeriodDialogOpen(false);
      setNewPeriod({ period_name: '', start_date: '', end_date: '' });
    } catch (error) {
      toast.error('追加に失敗しました');
    }
  };

  const handleSaveTaxSettings = async () => {
    try {
      await upsertTaxSettings.mutateAsync(taxForm);
      toast.success('税務設定を保存しました');
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  };

  const handleInitializeAccounts = async () => {
    try {
      await initializeAccounts.mutateAsync();
      toast.success('勘定科目を初期化しました');
    } catch (error) {
      toast.error('初期化に失敗しました');
    }
  };

  const hasAccounts = accounts && accounts.length > 0;

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
            <h1 className="text-3xl font-bold tracking-tight">会計設定</h1>
            <p className="text-muted-foreground">勘定科目・会計期間・税務設定</p>
          </div>
        </div>

        <Tabs defaultValue="accounts">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">勘定科目</TabsTrigger>
            <TabsTrigger value="periods">会計期間</TabsTrigger>
            <TabsTrigger value="tax">税務設定</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>勘定科目マスタ</CardTitle>
                  <CardDescription>勘定科目の管理</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!hasAccounts && (
                    <Button variant="outline" onClick={handleInitializeAccounts} disabled={initializeAccounts.isPending}>
                      {initializeAccounts.isPending ? '初期化中...' : '標準科目を初期化'}
                    </Button>
                  )}
                  <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        科目追加
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleCreateAccount}>
                        <DialogHeader>
                          <DialogTitle>新規勘定科目</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>科目コード *</Label>
                            <Input
                              value={newAccount.account_code}
                              onChange={(e) => setNewAccount({ ...newAccount, account_code: e.target.value })}
                              placeholder="例: 6350"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>科目名 *</Label>
                            <Input
                              value={newAccount.account_name}
                              onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                              placeholder="例: 研修費"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>勘定区分 *</Label>
                            <Select
                              value={newAccount.account_type}
                              onValueChange={(value: AccountType) => setNewAccount({ ...newAccount, account_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="asset">資産</SelectItem>
                                <SelectItem value="liability">負債</SelectItem>
                                <SelectItem value="equity">純資産</SelectItem>
                                <SelectItem value="revenue">収益</SelectItem>
                                <SelectItem value="expense">費用</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setAccountDialogOpen(false)}>
                            キャンセル
                          </Button>
                          <Button type="submit" disabled={createAccount.isPending}>
                            {createAccount.isPending ? '追加中...' : '追加'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
                ) : !accounts || accounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    勘定科目がありません。標準科目を初期化してください。
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>科目コード</TableHead>
                        <TableHead>科目名</TableHead>
                        <TableHead>区分</TableHead>
                        <TableHead>種別</TableHead>
                        <TableHead>状態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono">{account.account_code}</TableCell>
                          <TableCell className="font-medium">{account.account_name}</TableCell>
                          <TableCell>
                            <Badge className={getAccountTypeColor(account.account_type)}>
                              {getAccountTypeLabel(account.account_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {account.is_system ? (
                              <Badge variant="outline">システム</Badge>
                            ) : (
                              <Badge variant="secondary">カスタム</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? '有効' : '無効'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="periods">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>会計期間</CardTitle>
                  <CardDescription>決算期の管理</CardDescription>
                </div>
                <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      期間追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreatePeriod}>
                      <DialogHeader>
                        <DialogTitle>新規会計期間</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>期間名 *</Label>
                          <Input
                            value={newPeriod.period_name}
                            onChange={(e) => setNewPeriod({ ...newPeriod, period_name: e.target.value })}
                            placeholder="例: 2026年度"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>開始日 *</Label>
                            <Input
                              type="date"
                              value={newPeriod.start_date}
                              onChange={(e) => setNewPeriod({ ...newPeriod, start_date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>終了日 *</Label>
                            <Input
                              type="date"
                              value={newPeriod.end_date}
                              onChange={(e) => setNewPeriod({ ...newPeriod, end_date: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPeriodDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button type="submit" disabled={createPeriod.isPending}>
                          {createPeriod.isPending ? '追加中...' : '追加'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!fiscalPeriods || fiscalPeriods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    会計期間がありません
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>期間名</TableHead>
                        <TableHead>開始日</TableHead>
                        <TableHead>終了日</TableHead>
                        <TableHead>状態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fiscalPeriods.map((period) => (
                        <TableRow key={period.id}>
                          <TableCell className="font-medium">{period.period_name}</TableCell>
                          <TableCell>{period.start_date}</TableCell>
                          <TableCell>{period.end_date}</TableCell>
                          <TableCell>
                            <Badge variant={period.is_closed ? 'secondary' : 'default'}>
                              {period.is_closed ? '締め済み' : '進行中'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>税務設定</CardTitle>
                <CardDescription>消費税・法人税の設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>会計年度開始月</Label>
                    <Select
                      value={taxForm.fiscal_year_start_month.toString()}
                      onValueChange={(value) => setTaxForm({ ...taxForm, fiscal_year_start_month: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>消費税率 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={taxForm.consumption_tax_rate}
                      onChange={(e) => setTaxForm({ ...taxForm, consumption_tax_rate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>法人税率 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={taxForm.corporate_tax_rate}
                      onChange={(e) => setTaxForm({ ...taxForm, corporate_tax_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="simplified"
                      checked={taxForm.is_simplified_taxation}
                      onCheckedChange={(checked) => setTaxForm({ ...taxForm, is_simplified_taxation: checked })}
                    />
                    <Label htmlFor="simplified">簡易課税制度を適用</Label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveTaxSettings} disabled={upsertTaxSettings.isPending}>
                    {upsertTaxSettings.isPending ? '保存中...' : '設定を保存'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
