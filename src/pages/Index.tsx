// Landing page - redirects to dashboard or shows welcome
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Bot,
  CheckCircle,
  X,
  Circle,
  FileText,
  ArrowLeftRight,
  Calculator,
  FileSignature,
  Users,
  Target,
  Book,
  Laptop,
  Mail,
  MessageSquare,
  Stethoscope,
} from "lucide-react";
import { FeedbackButton } from "@/components/FeedbackButton";

// Typing animation texts
const typingTexts = [
  "「株式会社ABCへ15万円の請求書を作成」",
  "「今月の売上を教えて」",
  "「山田商事との契約書を作成して送付」",
  "「経費登録 3000円 タクシー代」",
  "「新しいリードを登録 田中太郎」",
  "「来週の商談予定を確認」",
];

// Core features
const features = [
  { icon: FileText, title: "スマート請求書", description: "請求書作成からバーチャル口座発行まで" },
  { icon: ArrowLeftRight, title: "自動消込", description: "入金を自動検知し消込まで全自動化", badge: "準備中" },
  { icon: Zap, title: "ダイナミックブースト", description: "AI与信で最短即日資金調達", badge: "準備中" },
  { icon: Shield, title: "トラストパスポート", description: "信用スコアを可視化" },
  { icon: Calculator, title: "フル会計", description: "仕訳帳から決算書まで完全無料" },
  { icon: FileSignature, title: "スマート契約", description: "電子署名・ブロックチェーン証明" },
  { icon: Users, title: "HR Suite", description: "従業員・勤怠・給与計算を一元管理" },
  { icon: Target, title: "CRM & Sales", description: "リードから商談、売上予実まで" },
  { icon: Book, title: "Company Wiki", description: "社内ナレッジを一元管理" },
  { icon: Laptop, title: "IT資産管理", description: "PC・ソフトウェア・備品を可視化" },
  { icon: Mail, title: "Smart Email", description: "AIが自動分類・要約・返信案生成" },
  { icon: MessageSquare, title: "LINE Assistant", description: "LINEから全機能にアクセス", badge: "NEW" },
  { icon: Stethoscope, title: "電子カルテ", description: "HPKI対応の診療記録管理", badge: "NEW" },
];

// Comparison data
const comparisonCategories = {
  invoice: {
    label: "請求・経理",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "Bill One", sub: "Sansan" },
      { name: "freee", sub: "" },
      { name: "MFクラウド", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月10万円〜", "月1,980円〜", "月2,980円〜"] },
      { feature: "請求書作成", values: [true, "partial", true, true] },
      { feature: "自動消込", values: [true, "partial", "partial", "partial"] },
      { feature: "AI-OCR読取", values: [true, true, "partial", "partial"] },
    ],
  },
  accounting: {
    label: "会計",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "弥生会計", sub: "" },
      { name: "freee会計", sub: "" },
      { name: "MF会計", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月1,100円〜", "月2,380円〜", "月2,980円〜"] },
      { feature: "仕訳帳・元帳", values: [true, true, true, true] },
      { feature: "決算書作成", values: [true, true, true, true] },
      { feature: "請求書連携", values: ["内蔵", "別途", "別途", "別途"] },
    ],
  },
  hr: {
    label: "人事・労務",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "SmartHR", sub: "" },
      { name: "freee人事労務", sub: "" },
      { name: "ジョブカン", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月額制", "月額制", "月200円/人"] },
      { feature: "従業員管理", values: [true, true, true, true] },
      { feature: "給与計算", values: [true, "partial", true, true] },
      { feature: "年末調整", values: [true, true, true, true] },
    ],
  },
  crm: {
    label: "CRM",
    competitors: [
      { name: "Totonos", sub: "" },
      { name: "Salesforce", sub: "" },
      { name: "HubSpot", sub: "" },
      { name: "Mazrica", sub: "" },
    ],
    rows: [
      { feature: "基本料金", values: ["0円", "月$25〜/人", "無料〜", "月5,500円〜/人"] },
      { feature: "リード管理", values: [true, true, true, true] },
      { feature: "商談パイプライン", values: [true, true, true, true] },
      { feature: "見積・請求連携", values: ["内蔵", "別途", "別途", "別途"] },
    ],
  },
};

type CategoryKey = keyof typeof comparisonCategories;

const renderCell = (value: boolean | string | "partial") => {
  if (value === true) return <CheckCircle className="h-4 w-4 text-chart-2 mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-destructive mx-auto" />;
  if (value === "partial") return <Circle className="h-4 w-4 text-muted-foreground mx-auto" />;
  return <span className="text-xs">{value}</span>;
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryKey>("invoice");

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Typing animation
  useEffect(() => {
    const currentText = typingTexts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % typingTexts.length);
        }
      }
    }, isDeleting ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

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
      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            10個以上のSaaSを
            <span className="text-primary block sm:inline"> 1つに統合</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 px-4 max-w-2xl mx-auto">
            請求書、会計、人事労務、CRM、契約管理まで。
            <span className="hidden sm:inline">中小企業に必要な全機能を無料で提供。</span>
          </p>

          {/* Typing Animation */}
          <div className="h-14 flex items-center justify-center mb-6 animate-fade-in">
            <div className="bg-muted/50 border border-border rounded-lg px-4 py-2.5 min-w-[280px] md:min-w-[450px]">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm md:text-base font-mono truncate">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </div>
            </div>
          </div>

          {/* AI Feature Highlight */}
          <div className="max-w-md mx-auto mb-8 p-3 border border-primary/50 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">AIエージェントで全操作可能</span>
            </div>
            <p className="text-xs text-muted-foreground">
              自然言語で話しかけるだけで、請求書作成から経費登録まで全て操作できます
            </p>
          </div>

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

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>✓ クレジットカード不要</span>
            <span>✓ 機能制限なし</span>
            <span>✓ 永久無料</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-16 max-w-5xl mx-auto">
          {features.slice(0, 10).map((feature) => (
            <div key={feature.title} className="text-center p-3 sm:p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
              <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-xs sm:text-sm mb-1 flex items-center justify-center gap-1">
                {feature.title}
                {feature.badge && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {feature.badge}
                  </span>
                )}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Price Comparison Banner */}
        <div className="mt-16 py-8 px-4 bg-foreground text-background rounded-xl max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-sm opacity-80">競合サービスを全部揃えると</p>
              <p className="text-2xl sm:text-3xl font-bold line-through opacity-60">月額 10万円以上</p>
            </div>
            <div className="text-3xl font-bold">→</div>
            <div>
              <p className="text-sm opacity-80">Totonosなら</p>
              <p className="text-4xl sm:text-5xl font-bold text-chart-2">0円</p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">競合比較</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            各カテゴリで業界トップのサービスと比較
          </p>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryKey)} className="w-full">
            <TabsList className="flex flex-wrap justify-center mb-6 h-auto gap-1 sm:gap-2 bg-transparent">
              {Object.entries(comparisonCategories).map(([key, { label }]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-xs sm:text-sm"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(comparisonCategories).map(([key, { competitors, rows }]) => (
              <TabsContent key={key} value={key}>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="font-bold text-foreground w-[120px] text-xs sm:text-sm">機能</TableHead>
                        {competitors.map((comp, i) => (
                          <TableHead
                            key={comp.name}
                            className={`font-bold text-center text-xs sm:text-sm min-w-[80px] ${
                              i === 0 ? "bg-primary text-primary-foreground" : "text-foreground"
                            }`}
                          >
                            {comp.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <TableRow key={row.feature} className={rowIndex === 0 ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium text-xs sm:text-sm">{row.feature}</TableCell>
                          {row.values.map((value, colIndex) => (
                            <TableCell
                              key={colIndex}
                              className={`text-center ${colIndex === 0 ? "bg-muted/50 font-bold" : ""} ${
                                rowIndex === 0 && colIndex === 0 ? "text-chart-2" : ""
                              }`}
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

          <div className="text-center mt-4 text-xs text-muted-foreground flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-chart-2" /> 対応
            </span>
            <span className="inline-flex items-center gap-1">
              <Circle className="h-3 w-3 text-muted-foreground" /> 一部対応
            </span>
            <span className="inline-flex items-center gap-1">
              <X className="h-3 w-3 text-destructive" /> 非対応
            </span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">今すぐ無料で始めましょう</h2>
          <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
            クレジットカード不要、機能制限なし。
            あなたのビジネスの成長を加速させる会社運営OSへようこそ。
          </p>
          <Button size="lg" asChild>
            <Link to="/auth">
              無料アカウントを作成
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Totonos. All rights reserved.</p>
        </div>
      </footer>

      <FeedbackButton />
    </div>
  );
};

export default Index;
