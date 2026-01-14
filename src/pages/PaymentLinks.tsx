import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import {
  CreditCard,
  Plus,
  Copy,
  ExternalLink,
  QrCode,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Link as LinkIcon,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface PaymentLink {
  id: string;
  name: string;
  amount: number;
  currency: 'JPY' | 'USD';
  type: 'one_time' | 'subscription';
  url: string;
  shortUrl: string;
  status: 'active' | 'expired' | 'completed';
  views: number;
  payments: number;
  totalCollected: number;
  createdAt: Date;
  expiresAt?: Date;
}

const mockLinks: PaymentLink[] = [
  {
    id: '1',
    name: 'Webサイト制作費用',
    amount: 500000,
    currency: 'JPY',
    type: 'one_time',
    url: 'https://pay.example.com/pl_abc123',
    shortUrl: 'https://pay.ex/abc',
    status: 'active',
    views: 45,
    payments: 3,
    totalCollected: 1500000,
    createdAt: new Date('2024-12-01'),
    expiresAt: new Date('2025-03-01'),
  },
  {
    id: '2',
    name: ' 月額サポートプラン',
    amount: 50000,
    currency: 'JPY',
    type: 'subscription',
    url: 'https://pay.example.com/pl_def456',
    shortUrl: 'https://pay.ex/def',
    status: 'active',
    views: 120,
    payments: 15,
    totalCollected: 750000,
    createdAt: new Date('2024-10-15'),
  },
  {
    id: '3',
    name: 'コンサルティング費用',
    amount: 100000,
    currency: 'JPY',
    type: 'one_time',
    url: 'https://pay.example.com/pl_ghi789',
    shortUrl: 'https://pay.ex/ghi',
    status: 'completed',
    views: 5,
    payments: 1,
    totalCollected: 100000,
    createdAt: new Date('2024-11-20'),
  },
  {
    id: '4',
    name: 'トレーニング費用',
    amount: 30000,
    currency: 'JPY',
    type: 'one_time',
    url: 'https://pay.example.com/pl_jkl012',
    shortUrl: 'https://pay.ex/jkl',
    status: 'expired',
    views: 10,
    payments: 0,
    totalCollected: 0,
    createdAt: new Date('2024-09-01'),
    expiresAt: new Date('2024-12-01'),
  },
];

export default function PaymentLinks() {
  const [links, setLinks] = useState<PaymentLink[]>(mockLinks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'JPY' as 'JPY' | 'USD',
    type: 'one_time' as 'one_time' | 'subscription',
  });

  const activeLinks = links.filter((l) => l.status === 'active');
  const totalCollected = links.reduce((sum, l) => sum + l.totalCollected, 0);
  const totalPayments = links.reduce((sum, l) => sum + l.payments, 0);

  const handleCreate = () => {
    if (!formData.name || !formData.amount) {
      toast.error('必須項目を入力してください');
      return;
    }

    const newLink: PaymentLink = {
      id: crypto.randomUUID(),
      name: formData.name,
      amount: Number(formData.amount),
      currency: formData.currency,
      type: formData.type,
      url: `https://pay.example.com/pl_${Math.random().toString(36).substring(7)}`,
      shortUrl: `https://pay.ex/${Math.random().toString(36).substring(7)}`,
      status: 'active',
      views: 0,
      payments: 0,
      totalCollected: 0,
      createdAt: new Date(),
    };

    setLinks((prev) => [newLink, ...prev]);
    setDialogOpen(false);
    setFormData({ name: '', amount: '', currency: 'JPY', type: 'one_time' });
    toast.success('決済リンクを作成しました');
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URLをコピーしました');
  };

  const handleDelete = (link: PaymentLink) => {
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    toast.success('決済リンクを削除しました');
  };

  const getStatusBadge = (status: PaymentLink['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            有効
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            期限切れ
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline">
            <CheckCircle className="mr-1 h-3 w-3" />
            完了
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
              <CreditCard className="h-8 w-8" />
              決済リンク
            </h1>
            <p className="text-muted-foreground">
              {activeLinks.length}件の有効なリンク
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                リンクを作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>決済リンクを作成</DialogTitle>
                <DialogDescription>
                  顧客に送付する決済用URLを生成
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>リンク名 *</Label>
                  <Input
                    placeholder="例: Webサイト制作費用"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>金額 *</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>通貨</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(v) => setFormData({ ...formData, currency: v as 'JPY' | 'USD' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JPY">日本円 (¥)</SelectItem>
                        <SelectItem value="USD">米ドル ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>支払いタイプ</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v as 'one_time' | 'subscription' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">一回払い</SelectItem>
                      <SelectItem value="subscription">定期支払い（月額）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreate}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総リンク数</CardDescription>
              <CardTitle className="text-2xl">{links.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有効なリンク</CardDescription>
              <CardTitle className="text-2xl text-green-600">{activeLinks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総決済件数</CardDescription>
              <CardTitle className="text-2xl">{totalPayments}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総回収額</CardDescription>
              <CardTitle className="text-2xl">¥{totalCollected.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Active Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              決済リンク一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>リンク名</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>閲覧数</TableHead>
                  <TableHead>決済数</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {link.shortUrl}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {link.currency === 'JPY' ? '¥' : '$'}
                      {link.amount.toLocaleString()}
                      {link.type === 'subscription' && '/月'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {link.type === 'one_time' ? '一回払い' : '定期'}
                      </Badge>
                    </TableCell>
                    <TableCell>{link.views}</TableCell>
                    <TableCell>{link.payments}</TableCell>
                    <TableCell>{getStatusBadge(link.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopy(link.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(link)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stripe Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe連携
            </CardTitle>
            <CardDescription>決済処理はStripeを通じて安全に行われます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Stripe アカウント</p>
                  <p className="text-sm text-muted-foreground">接続済み・テストモード</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                テストモード
              </Badge>
            </div>
            <div className="grid gap-4 mt-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">3.6%</p>
                <p className="text-sm text-muted-foreground">決済手数料</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">翌営業日</p>
                <p className="text-sm text-muted-foreground">入金サイクル</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">24時間</p>
                <p className="text-sm text-muted-foreground">サポート対応</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
