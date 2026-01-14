import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  RefreshCw,
  Unlink,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface BankConnection {
  id: string;
  bankName: string;
  bankCode: string;
  accountType: '普通' | '当座';
  accountNumber: string;
  accountName: string;
  balance: number;
  status: 'connected' | 'error' | 'syncing';
  lastSynced?: Date;
  transactionCount: number;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  balance: number;
  bankId: string;
  matched: boolean;
}

const mockBanks: BankConnection[] = [
  {
    id: '1',
    bankName: '三菱UFJ銀行',
    bankCode: '0005',
    accountType: '普通',
    accountNumber: '1234567',
    accountName: 'カ）サンプル',
    balance: 15234567,
    status: 'connected',
    lastSynced: new Date(Date.now() - 1000 * 60 * 30),
    transactionCount: 156,
  },
  {
    id: '2',
    bankName: '住信SBIネット銀行',
    bankCode: '0038',
    accountType: '普通',
    accountNumber: '7654321',
    accountName: 'カ）サンプル',
    balance: 8456789,
    status: 'connected',
    lastSynced: new Date(Date.now() - 1000 * 60 * 60 * 2),
    transactionCount: 89,
  },
  {
    id: '3',
    bankName: '楽天銀行',
    bankCode: '0036',
    accountType: '普通',
    accountNumber: '9876543',
    accountName: 'カ）サンプル',
    balance: 2345678,
    status: 'error',
    lastSynced: new Date(Date.now() - 1000 * 60 * 60 * 24),
    transactionCount: 45,
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    description: '株式会社ABC',
    amount: 500000,
    type: 'deposit',
    balance: 15734567,
    bankId: '1',
    matched: true,
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    description: '電気代',
    amount: 45678,
    type: 'withdrawal',
    balance: 15234567,
    bankId: '1',
    matched: true,
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    description: '株式会社XYZ',
    amount: 1200000,
    type: 'deposit',
    balance: 15280245,
    bankId: '1',
    matched: false,
  },
  {
    id: '4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    description: '給与振込',
    amount: 3500000,
    type: 'withdrawal',
    balance: 14080245,
    bankId: '1',
    matched: true,
  },
  {
    id: '5',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
    description: 'DEF株式会社',
    amount: 350000,
    type: 'deposit',
    balance: 8806789,
    bankId: '2',
    matched: false,
  },
];

const availableBanks = [
  { name: '三菱UFJ銀行', code: '0005' },
  { name: '三井住友銀行', code: '0009' },
  { name: 'みずほ銀行', code: '0001' },
  { name: '住信SBIネット銀行', code: '0038' },
  { name: '楽天銀行', code: '0036' },
  { name: 'PayPay銀行', code: '0033' },
  { name: 'GMOあおぞらネット銀行', code: '0310' },
  { name: 'ゆうちょ銀行', code: '9900' },
];

export default function BankConnections() {
  const [banks, setBanks] = useState<BankConnection[]>(mockBanks);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0);
  const connectedCount = banks.filter((b) => b.status === 'connected').length;
  const unmatchedCount = transactions.filter((t) => !t.matched).length;

  const handleSync = async (bankId: string) => {
    setSyncing(bankId);
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bankId ? { ...b, lastSynced: new Date(), status: 'connected' } : b
      )
    );
    setSyncing(null);
    toast.success('明細を同期しました');
  };

  const handleSyncAll = async () => {
    setSyncing('all');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setBanks((prev) =>
      prev.map((b) => ({ ...b, lastSynced: new Date(), status: 'connected' }))
    );
    setSyncing(null);
    toast.success('すべての口座を同期しました');
  };

  const handleDisconnect = (bank: BankConnection) => {
    setBanks((prev) => prev.filter((b) => b.id !== bank.id));
    toast.success(`${bank.bankName}の連携を解除しました`);
  };

  const handleConnect = (bankCode: string) => {
    const bank = availableBanks.find((b) => b.code === bankCode);
    if (bank) {
      toast.success(`${bank.name}への接続を開始します`);
      // In reality, this would redirect to the bank's OAuth flow
      setConnectDialogOpen(false);
    }
  };

  const getStatusBadge = (status: BankConnection['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            接続中
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            エラー
          </Badge>
        );
      case 'syncing':
        return (
          <Badge variant="secondary">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            同期中
          </Badge>
        );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              銀行口座連携
            </h1>
            <p className="text-muted-foreground">
              {connectedCount}口座接続中・自動明細取込
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSyncAll} disabled={syncing !== null}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing === 'all' ? 'animate-spin' : ''}`} />
              全て同期
            </Button>
            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  口座を追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>銀行口座を連携</DialogTitle>
                  <DialogDescription>
                    連携する銀行を選択してください。銀行のログインページへ移動します。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  {availableBanks.map((bank) => (
                    <Button
                      key={bank.code}
                      variant="outline"
                      className="justify-between h-12"
                      onClick={() => handleConnect(bank.code)}
                    >
                      <span>{bank.name}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総残高</CardDescription>
              <CardTitle className="text-2xl">
                ¥{totalBalance.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>接続口座数</CardDescription>
              <CardTitle className="text-2xl">{connectedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>未消込明細</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{unmatchedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今月の取引数</CardDescription>
              <CardTitle className="text-2xl">
                {banks.reduce((sum, b) => sum + b.transactionCount, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Connected Banks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              連携口座
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {banks.map((bank) => (
                <Card key={bank.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{bank.bankName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {bank.accountType} {bank.accountNumber}
                        </p>
                      </div>
                      {getStatusBadge(bank.status)}
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      ¥{bank.balance.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {bank.lastSynced
                        ? `最終同期: ${formatDistanceToNow(bank.lastSynced, { addSuffix: true, locale: ja })}`
                        : '未同期'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSync(bank.id)}
                        disabled={syncing !== null}
                      >
                        <RefreshCw className={`mr-1 h-3 w-3 ${syncing === bank.id ? 'animate-spin' : ''}`} />
                        同期
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDisconnect(bank)}
                      >
                        <Unlink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                最近の取引
              </CardTitle>
              <Button variant="outline" size="sm">
                すべて見る
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead>口座</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead>消込</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((tx) => {
                  const bank = banks.find((b) => b.id === tx.bankId);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {format(tx.date, 'MM/dd HH:mm', { locale: ja })}
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {bank?.bankName}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {tx.type === 'deposit' ? '+' : '-'}¥{tx.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {tx.matched ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            済
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Clock className="mr-1 h-3 w-3" />
                            未
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
