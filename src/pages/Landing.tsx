import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  FileText, 
  ArrowLeftRight, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle,
  X,
  Circle,
  Calculator,
  FileSignature,
  Users,
  Target,
  Book,
  Laptop,
  Menu,
  Eye,
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { FeedbackButton } from "@/components/FeedbackButton";

const features = [
  {
    icon: FileText,
    title: "Smart Invoice",
    description: "請求書作成からバーチャル口座発行まで、すべてをワンストップで。",
    badge: "準備中",
  },
  {
    icon: ArrowLeftRight,
    title: "Auto-Reconciliation",
    description: "入金を自動検知し、消込からお礼メールまで全自動化。",
    badge: "準備中",
  },
  {
    icon: Zap,
    title: "Dynamic Boost",
    description: "AI与信で最適な手数料を算出。最短即日で資金調達。",
    badge: "準備中",
  },
  {
    icon: Shield,
    title: "Trust Passport",
    description: "信用スコアを可視化し、より有利な条件でファイナンスを。",
  },
  {
    icon: Calculator,
    title: "Full Accounting",
    description: "仕訳帳・総勘定元帳から決算書まで、フル会計機能を無料で。",
  },
  {
    icon: FileSignature,
    title: "Smart Contract",
    description: "電子署名・ブロックチェーン証明で法的に有効な契約締結。",
  },
  {
    icon: Users,
    title: "HR Suite",
    description: "従業員管理・勤怠・給与計算・年末調整まで完結。",
  },
  {
    icon: Target,
    title: "CRM & Sales",
    description: "リード管理から商談パイプライン、売上予実まで一気通貫。",
  },
  {
    icon: Book,
    title: "Company Wiki",
    description: "社内マニュアル・議事録・ナレッジを一元管理。",
  },
  {
    icon: Laptop,
    title: "IT Asset Management",
    description: "PC・ソフトウェアライセンス・備品の管理と貸出状況を可視化。",
  },
];

const benefits = [
  "請求書作成時間を90%削減",
  "入金消込の完全自動化",
  "最短即日での資金調達",
  "提携銀行からの優遇融資",
  "給与計算・年末調整を完全自動化",
  "freee/MF/SmartHR相当の機能が無料",
];

// Comparison data by category
const comparisonCategories = {
  invoice: {
    label: "請求・経理",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "バクラク", sub: "LayerX" },
      { name: "Bill One", sub: "Sansan" },
      { name: "freee", sub: "請求書" },
      { name: "MFクラウド", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月3万円〜", "月10万円〜", "月1,980円〜", "月2,980円〜"] },
      { feature: "見積書作成", values: [true, true, false, true, true] },
      { feature: "請求書作成", values: [true, true, "partial", true, true] },
      { feature: "バーチャル口座", values: [true, false, false, false, "partial"] },
      { feature: "自動消込", values: [true, true, "partial", "partial", "partial"] },
      { feature: "AI-OCR読取", values: [true, true, true, "partial", "partial"] },
      { feature: "インボイス対応", values: [true, true, true, true, true] },
    ],
  },
  finance: {
    label: "資金調達",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "OLTA", sub: "ファクタリング" },
      { name: "GMO早払い", sub: "" },
      { name: "ラボル", sub: "" },
      { name: "銀行融資", sub: "" },
    ],
    rows: [
      { feature: "手数料", values: ["1.0%〜", "2%〜9%", "1%〜10%", "3%〜10%", "年2%〜5%"] },
      { feature: "資金化スピード", values: ["最短即日", "最短即日", "最短翌営業日", "最短即日", "1〜3週間"] },
      { feature: "審査方法", values: ["AI自動", "オンライン", "オンライン", "オンライン", "面談・書類"] },
      { feature: "AI与信スコア", values: [true, "partial", false, false, false] },
      { feature: "請求書連携", values: [true, false, false, false, false] },
      { feature: "信用スコア可視化", values: [true, false, false, false, false] },
    ],
  },
  accounting: {
    label: "会計",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "freee会計", sub: "" },
      { name: "MF会計", sub: "" },
      { name: "弥生会計", sub: "" },
      { name: "勘定奉行", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月2,380円〜", "月2,980円〜", "月1,100円〜", "月5万円〜"] },
      { feature: "仕訳帳・元帳", values: [true, true, true, true, true] },
      { feature: "決算書作成", values: [true, true, true, true, true] },
      { feature: "固定資産管理", values: [true, true, true, true, true] },
      { feature: "経費精算", values: [true, "partial", "partial", "partial", true] },
      { feature: "請求書連携", values: ["内蔵", "別途", "別途", "別途", "別途"] },
    ],
  },
  hr: {
    label: "人事・労務",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "SmartHR", sub: "" },
      { name: "freee人事労務", sub: "" },
      { name: "KING OF TIME", sub: "" },
      { name: "ジョブカン", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月額制", "月額制", "月300円/人", "月200円/人"] },
      { feature: "従業員管理", values: [true, true, true, "partial", true] },
      { feature: "勤怠管理", values: [true, "partial", true, true, true] },
      { feature: "給与計算", values: [true, "partial", true, false, true] },
      { feature: "年末調整", values: [true, true, true, false, true] },
      { feature: "社会保険手続き", values: [true, true, true, false, "partial"] },
    ],
  },
  crm: {
    label: "CRM・営業",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "Salesforce", sub: "" },
      { name: "HubSpot", sub: "" },
      { name: "kintone", sub: "" },
      { name: "Mazrica", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月$25〜/人", "無料〜", "月1,500円/人", "月5,500円〜/人"] },
      { feature: "リード管理", values: [true, true, true, true, true] },
      { feature: "商談パイプライン", values: [true, true, true, "partial", true] },
      { feature: "活動記録", values: [true, true, true, true, true] },
      { feature: "売上予実", values: [true, true, true, "partial", true] },
      { feature: "見積・請求連携", values: ["内蔵", "別途", "別途", "カスタム", "別途"] },
    ],
  },
  legal: {
    label: "法務・契約",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "クラウドサイン", sub: "" },
      { name: "GMOサイン", sub: "" },
      { name: "DocuSign", sub: "" },
      { name: "Adobe Sign", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月1万円〜", "月9,680円〜", "月$10〜", "月$12.99〜"] },
      { feature: "電子署名", values: [true, true, true, true, true] },
      { feature: "契約書作成", values: [true, "partial", "partial", "partial", "partial"] },
      { feature: "ブロックチェーン証明", values: [true, "partial", false, false, false] },
      { feature: "テンプレート", values: [true, true, true, true, true] },
      { feature: "請求書連携", values: ["内蔵", false, false, false, false] },
    ],
  },
  info: {
    label: "情報管理",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "Notion", sub: "" },
      { name: "Confluence", sub: "" },
      { name: "Asana", sub: "" },
      { name: "Monday", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "無料〜", "月$5.75〜", "無料〜", "月$8〜"] },
      { feature: "社内Wiki", values: [true, true, true, false, false] },
      { feature: "IT資産管理", values: [true, false, false, false, false] },
      { feature: "タスク管理", values: [true, true, "partial", true, true] },
      { feature: "ドキュメント管理", values: [true, true, true, "partial", "partial"] },
      { feature: "ERPとの統合", values: ["内蔵", false, false, false, false] },
    ],
  },
};

type CategoryKey = keyof typeof comparisonCategories;

const renderCell = (value: boolean | string | "partial") => {
  if (value === true) {
    return <CheckCircle className="h-5 w-5 text-chart-2 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-destructive mx-auto" />;
  }
  if (value === "partial") {
    return <Circle className="h-5 w-5 text-muted-foreground mx-auto" />;
  }
  return <span className="text-sm">{value}</span>;
};

export default function Landing() {
  const [activeTab, setActiveTab] = useState<CategoryKey>("invoice");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { enterDemoMode } = useDemo();
  const navigate = useNavigate();

  const handleDemoClick = () => {
    enterDemoMode();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center border-2 border-foreground bg-foreground text-background text-lg md:text-xl font-bold">
              T
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight">Totonos</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline" className="border-2">
                ログイン
              </Button>
            </Link>
            <Button onClick={handleDemoClick} variant="ghost">
              <Eye className="mr-2 h-4 w-4" />
              デモを見る
            </Button>
            <Link to="/auth">
              <Button>
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Button onClick={handleDemoClick} variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-2">
                      ログイン
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleDemoClick();
                    }} 
                    variant="ghost" 
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    デモを見る
                  </Button>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      無料で始める
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b-2 border-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-4 px-4 py-1 border-2 border-foreground bg-muted text-sm font-medium">
            🚀 完全無料の会社運営OS
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            10個のSaaSを
            <br />
            <span className="underline decoration-4 underline-offset-8">1つに統合</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            請求書・会計・人事・CRM・契約書・Wiki...
            <br />
            月額10万円以上かかる機能が、すべて無料で使えます。
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ クレジットカード不要</span>
            <span>✓ 機能制限なし</span>
            <span>✓ 永久無料</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b-2 border-foreground py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            10個のコア機能
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            freee + SmartHR + Salesforce + Notion + クラウドサイン...
            <br />
            すべての機能が1つのプラットフォームに統合されています。
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="border-2 border-foreground p-4 bg-card hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  {feature.title}
                  {'badge' in feature && feature.badge && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {feature.badge}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Comparison Banner */}
      <section className="border-b-2 border-foreground py-12 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div>
              <p className="text-lg opacity-80">競合サービスを全部揃えると</p>
              <p className="text-4xl font-bold line-through opacity-60">月額 10万円以上</p>
            </div>
            <div className="text-5xl font-bold">→</div>
            <div>
              <p className="text-lg opacity-80">Totonosなら</p>
              <p className="text-5xl font-bold text-chart-2">0円</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b-2 border-foreground py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Totonosで実現できること
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Comparison Table with Tabs */}
      <section className="border-b-2 border-foreground py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            カテゴリ別 競合比較
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            各カテゴリで業界トップのサービスと比較。Totonosはすべての機能を無料で提供します。
          </p>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryKey)} className="w-full">
            <TabsList className="flex flex-wrap justify-center mb-8 h-auto gap-2 bg-transparent">
              {Object.entries(comparisonCategories).map(([key, { label }]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-2"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(comparisonCategories).map(([key, { competitors, rows }]) => (
              <TabsContent key={key} value={key}>
                <div className="border-2 border-foreground overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-foreground bg-muted hover:bg-muted">
                        <TableHead className="font-bold text-foreground w-[160px] sticky left-0 bg-muted z-10">
                          機能
                        </TableHead>
                        {competitors.map((comp, i) => (
                          <TableHead 
                            key={comp.name} 
                            className={`font-bold text-center border-l-2 border-foreground min-w-[100px] ${
                              i === 0 ? 'bg-foreground text-background' : 'text-foreground'
                            }`}
                          >
                            <div>{comp.name}</div>
                            {comp.sub && <div className="text-xs font-normal opacity-70">{comp.sub}</div>}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <TableRow key={row.feature} className={rowIndex === 0 ? "bg-muted/30" : ""}>
                          <TableCell className={`font-medium sticky left-0 z-10 ${rowIndex === 0 ? 'bg-muted/30' : 'bg-background'}`}>
                            {row.feature}
                          </TableCell>
                          {row.values.map((value, colIndex) => (
                            <TableCell 
                              key={colIndex} 
                              className={`text-center border-l-2 border-foreground ${
                                colIndex === 0 ? 'bg-muted/50 font-bold' : ''
                              } ${rowIndex === 0 && colIndex === 0 ? 'text-chart-2' : ''}`}
                            >
                              {renderCell(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>

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
            今すぐ無料で始めましょう
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            クレジットカード不要、機能制限なし。
            <br />
            あなたのビジネスの成長を加速させる会社運営OSへようこそ。
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
          <p>© 2026 Totonos. All rights reserved.</p>
        </div>
      </footer>

      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  );
}
