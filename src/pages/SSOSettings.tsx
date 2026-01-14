import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  KeyRound,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Download,
  Upload,
  RefreshCw,
  HelpCircle,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Users,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  logo: string;
  status: 'active' | 'inactive' | 'pending';
  domain?: string;
  lastSync?: string;
  userCount?: number;
}

interface IdentityProvider {
  name: string;
  logo: string;
  type: 'saml' | 'oidc';
  description: string;
  setupUrl?: string;
}

const supportedProviders: IdentityProvider[] = [
  {
    name: 'Okta',
    logo: '🔐',
    type: 'saml',
    description: 'Okta Identity Provider',
    setupUrl: 'https://developer.okta.com/docs/guides/build-sso-integration/saml2/main/',
  },
  {
    name: 'Azure AD',
    logo: '☁️',
    type: 'saml',
    description: 'Microsoft Azure Active Directory',
    setupUrl: 'https://docs.microsoft.com/en-us/azure/active-directory/',
  },
  {
    name: 'Google Workspace',
    logo: '🔷',
    type: 'saml',
    description: 'Google Workspace SAML',
    setupUrl: 'https://support.google.com/a/answer/6087519',
  },
  {
    name: 'OneLogin',
    logo: '🔑',
    type: 'saml',
    description: 'OneLogin SAML Provider',
    setupUrl: 'https://onelogin.service-now.com/support',
  },
  {
    name: 'Auth0',
    logo: '🛡️',
    type: 'oidc',
    description: 'Auth0 OpenID Connect',
    setupUrl: 'https://auth0.com/docs/authenticate/protocols/openid-connect-protocol',
  },
  {
    name: 'カスタムSAML',
    logo: '⚙️',
    type: 'saml',
    description: '任意のSAML 2.0対応IdP',
  },
];

const mockConnections: SSOProvider[] = [
  {
    id: '1',
    name: 'Okta (本番)',
    type: 'saml',
    logo: '🔐',
    status: 'active',
    domain: 'company.okta.com',
    lastSync: '2024-03-15T10:30:00Z',
    userCount: 45,
  },
];

export default function SSOSettings() {
  const [selectedTab, setSelectedTab] = useState('connections');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IdentityProvider | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [enforceSSO, setEnforceSSO] = useState(false);

  // SAML Configuration (would be from backend)
  const samlConfig = {
    entityId: 'https://app.totonos.com/saml/metadata',
    acsUrl: 'https://app.totonos.com/saml/acs',
    sloUrl: 'https://app.totonos.com/saml/slo',
    certificate: `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiUMA0Gcw...
-----END CERTIFICATE-----`,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Would show toast notification
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <KeyRound className="h-8 w-8 text-primary" />
              SSO設定
            </h1>
            <p className="text-muted-foreground">
              シングルサインオン（SAML 2.0 / OIDC）の設定
            </p>
          </div>
          <Badge variant={ssoEnabled ? 'default' : 'secondary'} className="text-sm">
            {ssoEnabled ? 'SSO有効' : 'SSO無効'}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">接続済みIdP</p>
                  <p className="text-2xl font-bold">{mockConnections.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SSOユーザー</p>
                  <p className="text-2xl font-bold">
                    {mockConnections.reduce((sum, c) => sum + (c.userCount || 0), 0)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">プロトコル</p>
                  <p className="text-2xl font-bold">SAML 2.0</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">最終同期</p>
                  <p className="text-lg font-bold">
                    {mockConnections[0]?.lastSync
                      ? formatDate(mockConnections[0].lastSync)
                      : '-'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="connections">接続管理</TabsTrigger>
            <TabsTrigger value="saml">SAML設定</TabsTrigger>
            <TabsTrigger value="policies">セキュリティポリシー</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-6 space-y-6">
            {/* Existing Connections */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>IdP接続一覧</CardTitle>
                    <CardDescription>設定済みのIdentity Provider</CardDescription>
                  </div>
                  <Button onClick={() => setShowSetupDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    IdPを追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mockConnections.length > 0 ? (
                  <div className="space-y-4">
                    {mockConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                            {conn.logo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{conn.name}</h4>
                              <Badge
                                variant={conn.status === 'active' ? 'default' : 'secondary'}
                                className={cn(
                                  conn.status === 'active' && 'bg-green-100 text-green-700'
                                )}
                              >
                                {conn.status === 'active' ? '接続中' : '未接続'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {conn.domain} • {conn.type.toUpperCase()}
                            </p>
                            {conn.lastSync && (
                              <p className="text-xs text-muted-foreground mt-1">
                                最終同期: {formatDate(conn.lastSync)} • {conn.userCount}ユーザー
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            同期
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            設定
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">IdPが未設定です</h3>
                    <p className="text-muted-foreground mb-4">
                      SSO認証を有効にするには、Identity Providerを追加してください
                    </p>
                    <Button onClick={() => setShowSetupDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      IdPを追加
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Providers */}
            <Card>
              <CardHeader>
                <CardTitle>対応IdP</CardTitle>
                <CardDescription>以下のIdentity Providerに対応しています</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {supportedProviders.map((provider) => (
                    <div
                      key={provider.name}
                      className="border rounded-lg p-4 text-center hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowSetupDialog(true);
                      }}
                    >
                      <div className="text-3xl mb-2">{provider.logo}</div>
                      <p className="font-medium text-sm">{provider.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {provider.type.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saml" className="mt-6 space-y-6">
            {/* Service Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle>Service Provider (SP) 情報</CardTitle>
                <CardDescription>
                  IdP設定時にこれらの情報を使用してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Entity ID (Issuer)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input value={samlConfig.entityId} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(samlConfig.entityId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ACS URL (Reply URL)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input value={samlConfig.acsUrl} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(samlConfig.acsUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SLO URL (Logout URL)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input value={samlConfig.sloUrl} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(samlConfig.sloUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">メタデータURL</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={`${samlConfig.entityId}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        XML
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">SP証明書</Label>
                  <div className="mt-2 relative">
                    <Textarea
                      value={showSecret ? samlConfig.certificate : '••••••••••••••••••••'}
                      readOnly
                      className="font-mono text-xs h-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      証明書ダウンロード
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      証明書を更新
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IdP Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Identity Provider (IdP) 設定</CardTitle>
                <CardDescription>IdPから取得した情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">IdPメタデータURL</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input placeholder="https://idp.example.com/metadata" />
                    <Button variant="outline">取得</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    または手動で以下の項目を入力してください
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">IdP Entity ID</Label>
                    <Input
                      placeholder="https://idp.example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SSO URL</Label>
                    <Input
                      placeholder="https://idp.example.com/sso"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">IdP証明書</Label>
                  <Textarea
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    className="mt-2 font-mono text-xs h-24"
                  />
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    証明書をアップロード
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button>設定を保存</Button>
                  <Button variant="outline">接続テスト</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>認証ポリシー</CardTitle>
                <CardDescription>SSOの動作と制限を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SSO認証を有効化</h4>
                    <p className="text-sm text-muted-foreground">
                      シングルサインオン認証を使用可能にします
                    </p>
                  </div>
                  <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SSOを必須化</h4>
                    <p className="text-sm text-muted-foreground">
                      パスワード認証を無効化し、SSO認証のみを許可します
                    </p>
                  </div>
                  <Switch checked={enforceSSO} onCheckedChange={setEnforceSSO} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">JITプロビジョニング</h4>
                    <p className="text-sm text-muted-foreground">
                      初回ログイン時に自動でユーザーアカウントを作成します
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">自動ログアウト</h4>
                    <p className="text-sm text-muted-foreground">
                      IdPからログアウト時にTotonasからもログアウトします
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">ドメイン制限</h4>
                  <div>
                    <Label className="text-sm font-medium">許可するメールドメイン</Label>
                    <Input
                      placeholder="example.com, company.co.jp"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      カンマ区切りで複数のドメインを指定できます
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">属性マッピング</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">メールアドレス属性</Label>
                      <Select defaultValue="email">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">email</SelectItem>
                          <SelectItem value="mail">mail</SelectItem>
                          <SelectItem value="emailAddress">emailAddress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">表示名属性</Label>
                      <Select defaultValue="displayName">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="displayName">displayName</SelectItem>
                          <SelectItem value="name">name</SelectItem>
                          <SelectItem value="cn">cn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button>ポリシーを保存</Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">セキュリティに関する注意</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      SSO設定を変更する前に、必ずテスト環境で動作確認を行ってください。
                      誤った設定により、ユーザーがログインできなくなる可能性があります。
                      管理者アカウントは常にパスワード認証でアクセスできるようにしておくことを推奨します。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedProvider ? `${selectedProvider.name}を設定` : 'IdPを追加'}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider
                ? selectedProvider.description
                : 'Identity Providerを選択してください'}
            </DialogDescription>
          </DialogHeader>

          {selectedProvider ? (
            <div className="space-y-4 py-4">
              <div className="text-center py-6 bg-muted/50 rounded-lg">
                <div className="text-5xl mb-2">{selectedProvider.logo}</div>
                <h3 className="font-medium">{selectedProvider.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {selectedProvider.type.toUpperCase()}
                </Badge>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">設定ガイド</p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      {selectedProvider.name}の管理画面でSAMLアプリケーションを作成し、
                      上記のSP情報を入力してください。
                    </p>
                    {selectedProvider.setupUrl && (
                      <Button variant="link" className="px-0 mt-2 h-auto" asChild>
                        <a
                          href={selectedProvider.setupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          公式ドキュメント
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">接続名</Label>
                <Input
                  placeholder={`${selectedProvider.name} (本番)`}
                  className="mt-2"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-4">
              {supportedProviders.map((provider) => (
                <div
                  key={provider.name}
                  className="border rounded-lg p-4 text-center hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="text-3xl mb-2">{provider.logo}</div>
                  <p className="font-medium text-sm">{provider.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {provider.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSetupDialog(false);
                setSelectedProvider(null);
              }}
            >
              キャンセル
            </Button>
            {selectedProvider && <Button>続行</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
