import { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTwoFactor } from '@/hooks/useTwoFactor';

interface TwoFactorSettingsProps {
  // Props are now optional - the component can work standalone with the hook
  isEnabled?: boolean;
  onEnable?: () => Promise<{ qrCode: string; secret: string; recoveryCodes: string[] }>;
  onVerify?: (code: string) => Promise<boolean>;
  onDisable?: (code: string) => Promise<boolean>;
}

export function TwoFactorSettings({
  isEnabled: propIsEnabled,
  onEnable: propOnEnable,
  onVerify: propOnVerify,
  onDisable: propOnDisable,
}: TwoFactorSettingsProps) {
  // Use the hook for 2FA functionality
  const twoFactor = useTwoFactor();

  // Use hook state if no props provided
  const isEnabled = propIsEnabled ?? twoFactor.isEnabled;
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'recovery'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const { toast } = useToast();

  const handleStartSetup = async () => {
    // Use prop callback if provided, otherwise use hook
    const enableFn = propOnEnable || (async () => {
      const data = await twoFactor.initSetup();
      return { qrCode: data.qrCode, secret: data.secret, recoveryCodes: [] };
    });

    setIsLoading(true);
    try {
      const result = await enableFn();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      if (result.recoveryCodes.length > 0) {
        setRecoveryCodes(result.recoveryCodes);
      }
      setSetupStep('qr');
      setSetupDialogOpen(true);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '2FA設定の開始に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    // Use prop callback if provided, otherwise use hook
    const verifyFn = propOnVerify || (async (code: string) => {
      const result = await twoFactor.verifySetup(code);
      if (result.success && result.recoveryCodes) {
        setRecoveryCodes(result.recoveryCodes);
      }
      return result.success;
    });

    setIsLoading(true);
    try {
      const success = await verifyFn(verificationCode);
      if (success) {
        setSetupStep('recovery');
      } else {
        toast({
          title: 'エラー',
          description: '認証コードが正しくありません',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '認証に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = () => {
    setSetupDialogOpen(false);
    setSetupStep('qr');
    setVerificationCode('');
    setQrCode('');
    setSecret('');
    toast({
      title: '2FA が有効になりました',
      description: 'アカウントのセキュリティが向上しました',
    });
  };

  const handleDisable = async () => {
    // Use prop callback if provided, otherwise use hook
    const disableFn = propOnDisable || twoFactor.disable;

    setIsLoading(true);
    try {
      const success = await disableFn(disableCode);
      if (success) {
        setDisableDialogOpen(false);
        setDisableCode('');
        toast({
          title: '2FA が無効になりました',
          description: 'セキュリティのため、再度有効化することをお勧めします',
        });
      } else {
        toast({
          title: 'エラー',
          description: '認証コードが正しくありません',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '2FAの無効化に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'recovery') => {
    await navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 2000);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>二要素認証（2FA）</CardTitle>
            </div>
            {isEnabled ? (
              <Badge className="bg-green-500">有効</Badge>
            ) : (
              <Badge variant="secondary">無効</Badge>
            )}
          </div>
          <CardDescription>
            認証アプリを使用してアカウントのセキュリティを強化します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEnabled ? (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>2FAが有効です</AlertTitle>
                <AlertDescription>
                  ログイン時に認証アプリのコードが必要です
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDisableDialogOpen(true)}>
                  2FAを無効化
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                二要素認証を有効にすると、ログイン時にパスワードに加えて認証アプリからのコードが必要になります。
                これにより、パスワードが漏洩した場合でもアカウントを保護できます。
              </p>
              <Button onClick={handleStartSetup} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    設定中...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    2FAを設定
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === 'qr' && '認証アプリの設定'}
              {setupStep === 'verify' && 'コードの確認'}
              {setupStep === 'recovery' && 'リカバリーコードの保存'}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 'qr' && 'Google Authenticator などの認証アプリでQRコードをスキャンしてください'}
              {setupStep === 'verify' && '認証アプリに表示されている6桁のコードを入力してください'}
              {setupStep === 'recovery' && 'これらのコードは認証アプリにアクセスできない場合に使用します'}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 'qr' && (
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                      onError={(e) => {
                        // Fallback to placeholder if QR code fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>手動入力用シークレットキー</Label>
                <div className="flex gap-2">
                  <Input value={secret} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(secret, 'secret')}
                  >
                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {setupStep === 'verify' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">認証コード</Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="font-mono text-center text-2xl tracking-widest"
                />
              </div>
            </div>
          )}

          {setupStep === 'recovery' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>重要</AlertTitle>
                <AlertDescription>
                  これらのコードは安全な場所に保存してください。
                  認証アプリにアクセスできない場合、これらのコードでログインできます。
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded">
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'recovery')}
              >
                {copiedRecovery ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    コピーしました
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    すべてのコードをコピー
                  </>
                )}
              </Button>
            </div>
          )}

          <DialogFooter>
            {setupStep === 'qr' && (
              <Button onClick={() => setSetupStep('verify')}>次へ</Button>
            )}
            {setupStep === 'verify' && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={() => setSetupStep('qr')}>
                  戻る
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    '確認'
                  )}
                </Button>
              </div>
            )}
            {setupStep === 'recovery' && (
              <Button onClick={handleCompleteSetup} className="w-full">
                <Key className="mr-2 h-4 w-4" />
                コードを保存しました
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>二要素認証を無効化</DialogTitle>
            <DialogDescription>
              2FAを無効化するには、認証アプリのコードを入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                2FAを無効化するとアカウントのセキュリティが低下します
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="disable-code">認証コード</Label>
              <Input
                id="disable-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                className="font-mono text-center text-2xl tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '無効化'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
