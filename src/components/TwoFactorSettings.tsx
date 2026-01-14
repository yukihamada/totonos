import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Shield, ShieldCheck, ShieldOff, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorStatus {
  enabled: boolean;
  verifiedAt?: string;
}

export function TwoFactorSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  // Setup state
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    otpauthUrl: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable state
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // Fetch 2FA status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup?action=status`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStatus({
            enabled: data.enabled,
            verifiedAt: data.verified_at,
          });
        }
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  // Initialize 2FA setup
  const handleSetup = async () => {
    setIsSettingUp(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'init' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to initialize 2FA');
      }

      const data = await response.json();
      setSetupData({
        secret: data.secret,
        qrCode: data.qrCode,
        otpauthUrl: data.otpauthUrl,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '2FA設定の初期化に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  // Verify TOTP code
  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'エラー',
        description: '6桁のコードを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'verify', code: verificationCode }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }

      const data = await response.json();
      setRecoveryCodes(data.recoveryCodes || []);
      setShowRecoveryCodes(true);
      setStatus({ enabled: true });
      setSetupData(null);
      setVerificationCode('');

      toast({
        title: '2FAが有効になりました',
        description: 'リカバリーコードを安全な場所に保存してください',
      });
    } catch (error: any) {
      toast({
        title: '検証エラー',
        description: error.message || 'コードの検証に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Disable 2FA
  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      toast({
        title: 'エラー',
        description: '6桁のコードを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsDisabling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'disable', code: disableCode }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable 2FA');
      }

      setStatus({ enabled: false });
      setShowDisableDialog(false);
      setDisableCode('');

      toast({
        title: '2FAが無効になりました',
        description: 'アカウントのセキュリティが低下しています',
      });
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message || '2FAの無効化に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  // Copy recovery codes
  const handleCopyRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            二要素認証 (2FA)
          </CardTitle>
          <CardDescription>
            認証アプリを使用してアカウントのセキュリティを強化します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.enabled ? (
            <div className="space-y-4">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>2FAが有効です</AlertTitle>
                <AlertDescription>
                  アカウントは二要素認証で保護されています
                  {status.verifiedAt && (
                    <span className="block text-xs text-muted-foreground mt-1">
                      有効化日時: {new Date(status.verifiedAt).toLocaleString('ja-JP')}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
              <Button
                variant="destructive"
                onClick={() => setShowDisableDialog(true)}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                2FAを無効にする
              </Button>
            </div>
          ) : setupData ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  認証アプリ（Google Authenticator、Authyなど）でQRコードをスキャンしてください
                </p>
                <div className="inline-block p-4 bg-white rounded-lg">
                  <img
                    src={setupData.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>または手動でキーを入力:</Label>
                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                  {setupData.secret}
                </code>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">認証コード</Label>
                <div className="flex gap-2">
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="font-mono text-center text-lg tracking-widest"
                  />
                  <Button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '確認'
                    )}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSetupData(null);
                  setVerificationCode('');
                }}
              >
                キャンセル
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="default">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>2FAが無効です</AlertTitle>
                <AlertDescription>
                  二要素認証を有効にしてアカウントを保護することをお勧めします
                </AlertDescription>
              </Alert>
              <Button onClick={handleSetup} disabled={isSettingUp}>
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    設定中...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    2FAを設定する
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery Codes Dialog */}
      <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>リカバリーコード</DialogTitle>
            <DialogDescription>
              これらのコードを安全な場所に保存してください。
              認証アプリにアクセスできなくなった場合に使用できます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="text-center py-1">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyRecoveryCodes}
              >
                {copiedCodes ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    コピーしました
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    コピー
                  </>
                )}
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowRecoveryCodes(false)}
              >
                完了
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              各コードは1回のみ使用できます
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>2FAを無効にする</DialogTitle>
            <DialogDescription>
              二要素認証を無効にするには、認証アプリのコードを入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                className="font-mono text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDisableDialog(false);
                  setDisableCode('');
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisable}
                disabled={disableCode.length !== 6 || isDisabling}
              >
                {isDisabling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  '無効にする'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
