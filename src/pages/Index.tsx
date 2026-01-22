// Landing page - redirects to dashboard or shows welcome
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, Construction, Building2, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold">Totonos</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/industries">業種別</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth">ログイン</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 sm:py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            ビジネスを
            <span className="text-primary"> シンプル </span>
            に
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4 max-w-2xl mx-auto">
            50業種に対応した業務管理システム。
            <span className="hidden sm:inline">請求書、見積書、顧客管理、在庫管理まで。</span>
            <span className="sm:hidden">全ての業務を一元管理。</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/auth">
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/industries">業種を選ぶ</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20 max-w-4xl mx-auto">
          <div className="text-center p-4 sm:p-6 rounded-lg bg-card border">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">すぐに使える</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              業種を選ぶだけで最適な設定が完了
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 rounded-lg bg-card border">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">安心・安全</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              エンタープライズレベルのセキュリティ
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 rounded-lg bg-card border">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">AI搭載</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              AIが業務を効率化
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 sm:mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
              <Construction className="h-4 w-4" />
              準備中の機能（2月中旬開始予定）
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 border border-dashed">
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold mb-2 text-sm sm:text-base text-muted-foreground">銀行口座連携</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                自動明細取込・残高確認
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 border border-dashed">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold mb-2 text-sm sm:text-base text-muted-foreground">ダイナミックブースト</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                売掛金の早期現金化
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 border border-dashed">
              <Award className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold mb-2 text-sm sm:text-base text-muted-foreground">トラストパスポート</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                信用スコア・取引実績の可視化
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
