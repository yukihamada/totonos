import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  ArrowLeftRight, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle,
  X,
  Circle
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Invoice",
    description: "請求書作成からバーチャル口座発行まで、すべてをワンストップで。",
  },
  {
    icon: ArrowLeftRight,
    title: "Auto-Reconciliation",
    description: "入金を自動検知し、消込からお礼メールまで全自動化。",
  },
  {
    icon: Zap,
    title: "Dynamic Boost",
    description: "AI与信で最適な手数料を算出。最短即日で資金調達。",
  },
  {
    icon: Shield,
    title: "Trust Passport",
    description: "信用スコアを可視化し、より有利な条件でファイナンスを。",
  },
];

const benefits = [
  "請求書作成時間を90%削減",
  "入金消込の完全自動化",
  "最短即日での資金調達",
  "提携銀行からの優遇融資",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-foreground text-background text-xl font-bold">
              I
            </div>
            <span className="text-2xl font-bold tracking-tight">Invox</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline" className="border-2">
                ログイン
              </Button>
            </Link>
            <Link to="/auth">
              <Button>
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b-2 border-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            財務オートメーションの
            <br />
            <span className="underline decoration-4 underline-offset-8">新基準</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            請求書作成・自動消込・早期入金をワンプラットフォームで。
            <br />
            企業の成長サイクルを加速させる財務OSへようこそ。
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b-2 border-foreground py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            4つのコア機能
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="border-2 border-foreground p-6 bg-card hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-10 w-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b-2 border-foreground py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Invoxで実現できること
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div 
                  key={benefit} 
                  className="flex items-center gap-3 p-4 border-2 border-foreground bg-background"
                >
                  <CheckCircle className="h-6 w-6 text-chart-2 flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-b-2 border-foreground py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            他サービスとの比較
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Invoxは請求書管理から資金調達まで、すべてをワンストップで提供する唯一のプラットフォームです。
          </p>
          <div className="max-w-5xl mx-auto border-2 border-foreground overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-foreground bg-muted hover:bg-muted">
                  <TableHead className="font-bold text-foreground w-[200px]">機能</TableHead>
                  <TableHead className="font-bold text-foreground text-center border-l-2 border-foreground bg-foreground text-background">Invox</TableHead>
                  <TableHead className="font-bold text-foreground text-center border-l-2 border-foreground">従来の請求書サービス</TableHead>
                  <TableHead className="font-bold text-foreground text-center border-l-2 border-foreground">ファクタリング会社</TableHead>
                  <TableHead className="font-bold text-foreground text-center border-l-2 border-foreground">銀行融資</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">請求書作成</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">バーチャル口座発行</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><Circle className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">自動消込</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><Circle className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">早期入金（資金調達）</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">AI与信・動的手数料</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">信用スコア可視化</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50"><CheckCircle className="h-5 w-5 text-chart-2 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                  <TableCell className="text-center border-l-2 border-foreground"><X className="h-5 w-5 text-destructive mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">手数料</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50 font-bold text-chart-2">1.0%〜</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">月額制</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">5%〜15%</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">2%〜5%</TableCell>
                </TableRow>
                <TableRow className="border-b border-foreground">
                  <TableCell className="font-medium">資金化までの時間</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50 font-bold text-chart-2">最短即日</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">—</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">2〜3日</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">1〜2週間</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">審査の手間</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground bg-muted/50 font-bold text-chart-2">自動（AI）</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">—</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">書類提出必要</TableCell>
                  <TableCell className="text-center border-l-2 border-foreground">面談・書類多数</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 mr-6">
              <CheckCircle className="h-4 w-4 text-chart-2" /> 対応
            </span>
            <span className="inline-flex items-center gap-2 mr-6">
              <Circle className="h-4 w-4 text-muted-foreground" /> 一部対応
            </span>
            <span className="inline-flex items-center gap-2">
              <X className="h-4 w-4 text-destructive" /> 非対応
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            今すぐ始めましょう
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            クレジットカード不要、無料プランから始められます。
            <br />
            あなたのビジネスの成長を加速させましょう。
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              無料アカウントを作成
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Invox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
