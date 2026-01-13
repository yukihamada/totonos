import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, ArrowRight, CheckCircle, Building2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

interface CompanyInfo {
  company_name: string | null;
  company_address: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  employee_count_estimate: number | null;
}

export default function Auth() {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingCompany, setSearchingCompany] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const searchCompany = async () => {
    if (!companyName.trim()) return;

    setSearchingCompany(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-company", {
        body: { companyName: companyName.trim() },
      });

      if (error) throw error;

      setCompanyInfo(data);
      toast({
        title: "会社情報を取得しました",
        description: data.company_name || companyName,
      });
    } catch (error) {
      console.error("Company search error:", error);
      toast({
        title: "検索エラー",
        description: "会社情報の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setSearchingCompany(false);
    }
  };

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
      
      // Store company info in localStorage for after login
      if (companyInfo || companyName) {
        localStorage.setItem("pendingCompanyInfo", JSON.stringify({
          ...companyInfo,
          company_name: companyInfo?.company_name || companyName,
        }));
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

  const emailProviders = [
    { name: "Gmail", url: "https://mail.google.com", color: "text-red-500" },
    { name: "Outlook", url: "https://outlook.live.com", color: "text-blue-500" },
    { name: "Yahoo!", url: "https://mail.yahoo.co.jp", color: "text-purple-500" },
    { name: "iCloud", url: "https://www.icloud.com/mail", color: "text-sky-500" },
  ];

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
                {emailProviders.map((provider) => (
                  <Button key={provider.name} variant="outline" className="w-full border-2" asChild>
                    <a href={provider.url} target="_blank" rel="noopener noreferrer">
                      <Mail className={`mr-2 h-4 w-4 ${provider.color}`} />
                      {provider.name}
                    </a>
                  </Button>
                ))}
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

            <div className="space-y-2">
              <Label htmlFor="company">会社名（任意）</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="株式会社○○"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading || searchingCompany}
                    className="border-2 pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={searchCompany}
                  disabled={!companyName.trim() || searchingCompany || loading}
                  className="border-2 shrink-0"
                  title="AIで会社情報を検索"
                >
                  {searchingCompany ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                会社名を入力して✨ボタンでAI検索
              </p>
            </div>

            {companyInfo && (
              <div className="p-3 rounded-lg border-2 bg-muted/50 space-y-2 text-sm">
                <div className="font-medium">{companyInfo.company_name}</div>
                {companyInfo.industry && (
                  <div className="text-muted-foreground">業種: {companyInfo.industry}</div>
                )}
                {companyInfo.company_address && (
                  <div className="text-muted-foreground">住所: {companyInfo.company_address}</div>
                )}
                {companyInfo.description && (
                  <div className="text-muted-foreground">{companyInfo.description}</div>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
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
