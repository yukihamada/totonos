import { useState } from "react";
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
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink } = useAuth();
  const { toast } = useToast();

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
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              メール内のリンクをクリックしてログインしてください。
              リンクの有効期限は1時間です。
            </p>
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
              I
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Invox</CardTitle>
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
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "送信中..."
              ) : (
                <>
                  ログインリンクを送信
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
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
