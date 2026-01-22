import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, ArrowRight, CheckCircle, Key, Eye, EyeOff, Shield, Loader2 } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

// Google icon component
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const PENDING_TEMPLATE_KEY = 'pending_industry_template';

type AuthStep = 'login' | 'twoFactor';

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  
  const { signInWithMagicLink, signInWithOAuth, signIn, user } = useAuth();
  const { verifyLogin } = useTwoFactor();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Save template key from LP to localStorage
  useEffect(() => {
    const templateKey = searchParams.get('template');
    if (templateKey) {
      localStorage.setItem(PENDING_TEMPLATE_KEY, templateKey);
    }
  }, [searchParams]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast({
        title: "入力エラー",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error, isE2ELogin } = await signInWithMagicLink(email);
      if (error) {
        toast({
          title: "エラー",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // E2E test: skip email sent screen and redirect immediately
      if (isE2ELogin) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setEmailSent(true);
      toast({
        title: "メール送信完了",
        description: "ログインリンクをメールで送信しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast({
        title: "入力エラー",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "入力エラー",
        description: "パスワードを入力してください",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "ログインエラー",
          description: "メールアドレスまたはパスワードが正しくありません",
          variant: "destructive",
        });
        return;
      }

      // Login successful - redirect will happen via useEffect
      toast({
        title: "ログイン成功",
        description: "ダッシュボードに移動します",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pendingUserId || totpCode.length !== 6) return;

    setLoading(true);
    try {
      const result = await verifyLogin(pendingUserId, totpCode, useRecoveryCode);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          title: "認証エラー",
          description: "認証コードが正しくありません",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        toast({
          title: "エラー",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setOauthLoading(null);
    }
  };

  // 2FA verification step
  if (authStep === 'twoFactor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2 border-foreground shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">二要素認証</CardTitle>
            <CardDescription>
              認証アプリに表示されている6桁のコードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-code">認証コード</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={useRecoveryCode ? 10 : 6}
                  placeholder={useRecoveryCode ? "リカバリーコード" : "000000"}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="font-mono text-center text-2xl tracking-widest border-2"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || totpCode.length < 6}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "確認"
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
              >
                {useRecoveryCode ? "認証アプリを使用" : "リカバリーコードを使用"}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full border-2"
              onClick={() => {
                setAuthStep('login');
                setPendingUserId(null);
                setTotpCode('');
              }}
            >
              戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2 border-foreground shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">メールを確認してください</CardTitle>
            <CardDescription className="text-base mt-2">
              <span className="font-medium text-foreground">{email}</span> に
              ログインリンクを送信しました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              メール内のリンクをクリックしてログインしてください。
              リンクの有効期限は1時間です。
            </p>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center font-medium">
                メールを開く
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full border-2" asChild>
                  <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4 text-red-500" />
                    Gmail
                  </a>
                </Button>
                <Button variant="outline" className="w-full border-2" asChild>
                  <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4 text-blue-500" />
                    Outlook
                  </a>
                </Button>
                <Button variant="outline" className="w-full border-2" asChild>
                  <a href="https://mail.yahoo.co.jp" target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4 text-purple-500" />
                    Yahoo!
                  </a>
                </Button>
                <Button variant="outline" className="w-full border-2" asChild>
                  <a href="https://www.icloud.com/mail" target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4 text-sky-500" />
                    iCloud
                  </a>
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-2"
              onClick={() => setEmailSent(false)}
            >
              別のメールアドレスを使用
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main login screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-foreground shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-foreground text-background text-2xl font-bold">
              T
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Totonos</CardTitle>
          <CardDescription>
            アカウントにログイン・新規登録
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="magiclink" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magiclink" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                メールリンク
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                パスワード
              </TabsTrigger>
            </TabsList>

            <TabsContent value="magiclink" className="space-y-4 mt-4">
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-magic">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-magic"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || oauthLoading !== null}
                      className="border-2 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || oauthLoading !== null}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      メールでログイン
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center">
                パスワード不要。メールのリンクをクリックするだけでログインできます。
              </p>
            </TabsContent>

            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-password">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-password"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || oauthLoading !== null}
                      className="border-2 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || oauthLoading !== null}
                      className="border-2 pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || oauthLoading !== null}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      ログイン
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center">
                パスワードを設定している場合のみ使用できます。
                未設定の方はメールリンクをご利用ください。
              </p>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                または
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            variant="outline"
            className="w-full border-2 h-11"
            onClick={handleGoogleLogin}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="ml-2">Googleでログイン</span>
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            アカウントをお持ちでない場合は自動的に作成されます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
