import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

interface IndustryLandingLayoutProps {
  children: React.ReactNode;
}

export function IndustryLandingLayout({ children }: IndustryLandingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                トップへ戻る
              </Link>
            </Button>
          </div>

          <Link to="/" className="text-xl font-bold">
            Totonos
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">ログイン</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Totonos</h3>
              <p className="text-sm text-muted-foreground">
                中小企業のための業務管理プラットフォーム
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">製品</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/industries" className="hover:text-foreground">業種別テンプレート</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">料金プラン</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground">利用規約</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">プライバシーポリシー</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">お問い合わせ</h4>
              <p className="text-sm text-muted-foreground">
                ご質問やお問い合わせは<br />
                チャットサポートをご利用ください
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Totonos. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
