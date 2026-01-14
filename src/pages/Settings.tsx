import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Building2, Bell, Shield, Palette, Globe, CreditCard, Mail, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  // Company settings
  const [companyName, setCompanyName] = useState('株式会社サンプル');
  const [companyAddress, setCompanyAddress] = useState('東京都渋谷区...');
  const [companyPhone, setCompanyPhone] = useState('03-1234-5678');
  const [companyEmail, setCompanyEmail] = useState('info@example.com');
  const [taxNumber, setTaxNumber] = useState('T1234567890123');

  // Invoice settings
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('30');
  const [defaultTaxRate, setDefaultTaxRate] = useState('10');
  const [invoiceNotes, setInvoiceNotes] = useState('お支払いは銀行振込にてお願いいたします。');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [overdueReminders, setOverdueReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Display settings
  const [language, setLanguage] = useState('ja');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [currency, setCurrency] = useState('JPY');
  const [dateFormat, setDateFormat] = useState('yyyy/MM/dd');

  const handleSave = () => {
    toast.success('設定を保存しました');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <SettingsIcon className="h-8 w-8" />
              設定
            </h1>
            <p className="text-muted-foreground">アプリケーションの設定を管理</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company">会社情報</TabsTrigger>
            <TabsTrigger value="invoice">請求書</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="display">表示</TabsTrigger>
            <TabsTrigger value="security">セキュリティ</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  会社情報
                </CardTitle>
                <CardDescription>請求書やドキュメントに表示される会社情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>会社名</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>インボイス登録番号</Label>
                    <Input
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="T1234567890123"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>住所</Label>
                  <Textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>メールアドレス</Label>
                    <Input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>銀行口座情報</CardTitle>
                <CardDescription>請求書に表示される振込先情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>銀行名</Label>
                    <Input placeholder="〇〇銀行" />
                  </div>
                  <div className="space-y-2">
                    <Label>支店名</Label>
                    <Input placeholder="〇〇支店" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>口座種別</Label>
                    <Select defaultValue="ordinary">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ordinary">普通</SelectItem>
                        <SelectItem value="current">当座</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>口座番号</Label>
                    <Input placeholder="1234567" />
                  </div>
                  <div className="space-y-2">
                    <Label>口座名義</Label>
                    <Input placeholder="カ）サンプル" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  請求書設定
                </CardTitle>
                <CardDescription>請求書のデフォルト設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>請求書番号プレフィックス</Label>
                    <Input
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">例: {invoicePrefix}-2026-001</p>
                  </div>
                  <div className="space-y-2">
                    <Label>デフォルト支払期限（日）</Label>
                    <Select value={defaultPaymentTerms} onValueChange={setDefaultPaymentTerms}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15日</SelectItem>
                        <SelectItem value="30">30日</SelectItem>
                        <SelectItem value="45">45日</SelectItem>
                        <SelectItem value="60">60日</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>デフォルト消費税率</Label>
                    <Select value={defaultTaxRate} onValueChange={setDefaultTaxRate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%（非課税）</SelectItem>
                        <SelectItem value="8">8%（軽減税率）</SelectItem>
                        <SelectItem value="10">10%（標準税率）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>請求書備考（デフォルト）</Label>
                  <Textarea
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    rows={3}
                    placeholder="お支払いに関する注意事項など"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  通知設定
                </CardTitle>
                <CardDescription>通知とアラートの設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>メール通知</Label>
                    <p className="text-sm text-muted-foreground">重要な更新をメールで受け取る</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>入金アラート</Label>
                    <p className="text-sm text-muted-foreground">入金があった際に通知</p>
                  </div>
                  <Switch
                    checked={paymentAlerts}
                    onCheckedChange={setPaymentAlerts}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>支払期限リマインダー</Label>
                    <p className="text-sm text-muted-foreground">期限超過の請求書を通知</p>
                  </div>
                  <Switch
                    checked={overdueReminders}
                    onCheckedChange={setOverdueReminders}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>週次レポート</Label>
                    <p className="text-sm text-muted-foreground">毎週の集計レポートを受け取る</p>
                  </div>
                  <Switch
                    checked={weeklyReport}
                    onCheckedChange={setWeeklyReport}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  表示設定
                </CardTitle>
                <CardDescription>言語・地域・表示形式の設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>言語</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>タイムゾーン</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Tokyo">東京 (UTC+9)</SelectItem>
                        <SelectItem value="America/New_York">ニューヨーク (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">ロンドン (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>通貨</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JPY">日本円 (¥)</SelectItem>
                        <SelectItem value="USD">米ドル ($)</SelectItem>
                        <SelectItem value="EUR">ユーロ (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>日付形式</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yyyy/MM/dd">2026/01/14</SelectItem>
                        <SelectItem value="yyyy-MM-dd">2026-01-14</SelectItem>
                        <SelectItem value="MM/dd/yyyy">01/14/2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  セキュリティ
                </CardTitle>
                <CardDescription>アカウントとセキュリティの設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <Input value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">メールアドレスの変更はサポートにお問い合わせください</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>パスワード変更</Label>
                  <Button variant="outline">パスワードを変更</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>二要素認証</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">二要素認証を設定</Button>
                    <span className="text-sm text-muted-foreground">未設定</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>セッション管理</Label>
                  <Button variant="outline">すべてのセッションからログアウト</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">危険な操作</CardTitle>
                <CardDescription>これらの操作は取り消せません</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">データのエクスポート</p>
                    <p className="text-sm text-muted-foreground">すべてのデータをダウンロード</p>
                  </div>
                  <Button variant="outline">エクスポート</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">アカウントの削除</p>
                    <p className="text-sm text-muted-foreground">すべてのデータが完全に削除されます</p>
                  </div>
                  <Button variant="destructive">アカウントを削除</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
