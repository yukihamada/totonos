import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/contexts/SettingsContext';
import { useCurrentCompany, useUpdateCompany } from '@/hooks/useCompany';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard, 
  Save,
  Menu,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings, updateMenuGroup, updateMenuItem, resetToDefaults } = useAppSettings();
  const { data: currentCompany } = useCurrentCompany();
  const updateCompany = useUpdateCompany();

  // Company settings - sync with currentCompany
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Sync company data when currentCompany changes
  useEffect(() => {
    if (currentCompany) {
      setCompanyName(currentCompany.name || '');
      setCompanyAddress(currentCompany.address || '');
      setCompanyPhone(currentCompany.phone || '');
      setCompanyEmail(currentCompany.email || '');
      // taxNumber is not in companies table yet, keep as local state
    }
  }, [currentCompany]);

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

  const handleSave = async () => {
    if (currentCompany) {
      try {
        await updateCompany.mutateAsync({
          id: currentCompany.id,
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
        });
        toast.success('設定を保存しました');
      } catch (error) {
        toast.error('保存に失敗しました');
      }
    } else {
      toast.success('設定を保存しました');
    }
  };

  const handleResetMenu = () => {
    resetToDefaults();
    toast.success('メニュー設定をリセットしました');
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

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="appearance">外観</TabsTrigger>
            <TabsTrigger value="menu">メニュー</TabsTrigger>
            <TabsTrigger value="company">会社情報</TabsTrigger>
            <TabsTrigger value="invoice">請求書</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="security">セキュリティ</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  テーマ設定
                </CardTitle>
                <CardDescription>アプリケーションの外観をカスタマイズ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>カラーモード</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={settings.theme === 'light' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => updateSettings({ theme: 'light' })}
                    >
                      <Sun className="h-6 w-6" />
                      <span>ライト</span>
                    </Button>
                    <Button
                      variant={settings.theme === 'dark' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => updateSettings({ theme: 'dark' })}
                    >
                      <Moon className="h-6 w-6" />
                      <span>ダーク</span>
                    </Button>
                    <Button
                      variant={settings.theme === 'system' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => updateSettings({ theme: 'system' })}
                    >
                      <Monitor className="h-6 w-6" />
                      <span>システム</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>フォントサイズ</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={settings.fontSize === 'sm' ? 'default' : 'outline'}
                      onClick={() => updateSettings({ fontSize: 'sm' })}
                    >
                      小
                    </Button>
                    <Button
                      variant={settings.fontSize === 'base' ? 'default' : 'outline'}
                      onClick={() => updateSettings({ fontSize: 'base' })}
                    >
                      中（標準）
                    </Button>
                    <Button
                      variant={settings.fontSize === 'lg' ? 'default' : 'outline'}
                      onClick={() => updateSettings({ fontSize: 'lg' })}
                    >
                      大
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>コンパクトモード</Label>
                    <p className="text-sm text-muted-foreground">UIの余白を減らしてより多くの情報を表示</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  地域設定
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

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Menu className="h-5 w-5" />
                      メニューカスタマイズ
                    </CardTitle>
                    <CardDescription>サイドバーメニューの表示項目を設定</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetMenu}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    リセット
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.menuGroups.map((group) => (
                  <div key={group.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Label className="text-base font-semibold">{group.label}</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMenuGroup(group.id, { visible: !group.visible })}
                      >
                        {group.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {group.visible && (
                      <div className="ml-8 space-y-2">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-1"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={item.visible}
                                onCheckedChange={(checked) =>
                                  updateMenuItem(group.id, item.id, { visible: checked as boolean })
                                }
                              />
                              <span className={item.visible ? '' : 'text-muted-foreground line-through'}>
                                {item.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
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

          {/* Invoice Tab */}
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

          {/* Notifications Tab */}
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

          {/* Security Tab */}
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
                  <div className="space-y-0.5">
                    <p className="font-medium">すべてのデータを削除</p>
                    <p className="text-sm text-muted-foreground">請求書、取引先、設定をすべて削除します</p>
                  </div>
                  <Button variant="destructive">データを削除</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">アカウントを削除</p>
                    <p className="text-sm text-muted-foreground">アカウントを完全に削除します</p>
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
