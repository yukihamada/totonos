import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast({
          title: "エラー",
          description: error.message,
          variant: "destructive",
        });
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
            メールアドレスを入力してログイン・登録
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="border-2 pl-10"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? (
                "送信中..."
              ) : (
                <>
                  ログインリンクを送信
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  または
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-2"
              onClick={async () => {
                setGoogleLoading(true);
                const { error } = await signInWithGoogle();
                if (error) {
                  toast({
                    title: "エラー",
                    description: error.message,
                    variant: "destructive",
                  });
                }
                setGoogleLoading(false);
              }}
              disabled={loading || googleLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "ログイン中..." : "Googleでログイン"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              アカウントをお持ちでない場合は自動的に作成されます。
              パスワードは不要です。
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
