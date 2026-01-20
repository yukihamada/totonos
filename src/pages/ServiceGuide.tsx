import { Link } from "react-router-dom";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CREDIT_COSTS, PLANS, type PlanType } from "@/hooks/useCredits";

// サービスカテゴリ定義
const SERVICE_CATEGORIES = {
  crm: {
    name: "CRM・営業管理",
    description: "顧客管理、リード追跡、商談管理を効率化",
    features: [
      { name: "リード管理", description: "見込み客の登録・管理・スコアリング" },
      { name: "商談（Deal）管理", description: "商談の進捗をパイプラインで可視化" },
      { name: "顧客管理", description: "取引先情報の一元管理" },
      { name: "活動記録", description: "メール・電話・打ち合わせの履歴管理" },
      { name: "AI売上予測", description: "過去データからAIが売上を予測" },
      { name: "リードスコアリング", description: "AIが見込み度を自動スコアリング" },
    ],
  },
  invoicing: {
    name: "請求・見積管理",
    description: "請求書・見積書・発注書の作成と管理",
    features: [
      { name: "請求書作成", description: "プロフェッショナルな請求書をワンクリックで作成" },
      { name: "見積書作成", description: "見積書の作成・PDF出力・メール送信" },
      { name: "発注書管理", description: "仕入先への発注書作成・管理" },
      { name: "納品書管理", description: "納品書の作成・OCR読み取り" },
      { name: "自動リマインダー", description: "支払期限前の自動通知" },
      { name: "決済リンク", description: "オンライン決済リンクの発行" },
    ],
  },
  contracts: {
    name: "契約管理",
    description: "契約書の作成から電子署名まで一気通貫",
    features: [
      { name: "契約書作成", description: "テンプレートから契約書を簡単作成" },
      { name: "電子署名", description: "法的に有効な電子署名" },
      { name: "契約アラート", description: "更新期限・終了日の自動通知" },
      { name: "ブロックチェーン証明", description: "改ざん防止のためのブロックチェーン記録" },
      { name: "バージョン管理", description: "契約書の変更履歴を追跡" },
    ],
  },
  accounting: {
    name: "会計・経理",
    description: "仕訳から決算書作成まで完全サポート",
    features: [
      { name: "仕訳入力", description: "複合仕訳対応の仕訳帳" },
      { name: "総勘定元帳", description: "勘定科目ごとの取引一覧" },
      { name: "財務諸表", description: "貸借対照表・損益計算書の自動生成" },
      { name: "固定資産管理", description: "減価償却の自動計算" },
      { name: "予算管理", description: "部門別・プロジェクト別の予算設定" },
      { name: "銀行連携", description: "口座明細の自動取り込み" },
    ],
  },
  hr: {
    name: "HR・人事",
    description: "従業員管理から給与計算まで",
    features: [
      { name: "従業員管理", description: "従業員情報の一元管理" },
      { name: "勤怠管理", description: "出退勤の記録・集計" },
      { name: "シフト管理", description: "シフトの作成・共有" },
      { name: "休暇管理", description: "有給・休暇申請のワークフロー" },
      { name: "給与計算", description: "給与・賞与の自動計算" },
      { name: "年末調整", description: "年末調整の電子化" },
      { name: "採用管理", description: "求人・応募者・面接の管理" },
    ],
  },
  expense: {
    name: "経費精算",
    description: "経費申請から承認まで効率化",
    features: [
      { name: "経費申請", description: "スマホから簡単に経費申請" },
      { name: "領収書OCR", description: "レシートを撮影して自動入力" },
      { name: "承認ワークフロー", description: "多段階の承認フローに対応" },
      { name: "仮払金管理", description: "仮払い・精算の管理" },
      { name: "経費レポート", description: "部門別・項目別の経費分析" },
    ],
  },
  project: {
    name: "プロジェクト管理",
    description: "タスク・進捗・工数を一元管理",
    features: [
      { name: "プロジェクト作成", description: "プロジェクトの基本情報設定" },
      { name: "タスク管理", description: "タスクの作成・担当者割当" },
      { name: "カンバンボード", description: "ドラッグ&ドロップでタスク管理" },
      { name: "ガントチャート", description: "スケジュールの可視化" },
      { name: "工数管理", description: "作業時間の記録・集計" },
    ],
  },
  ai: {
    name: "AI・自動化",
    description: "AIと自動化で業務を効率化",
    features: [
      { name: "AIチャット", description: "業務データを活用したAIアシスタント" },
      { name: "AI画像解析", description: "画像からのデータ抽出" },
      { name: "AI PDF解析", description: "PDFドキュメントの内容解析" },
      { name: "メールAI", description: "メールの自動分類・返信生成" },
      { name: "ワークフロー自動化", description: "条件に基づく自動アクション" },
      { name: "LINE/Slack連携", description: "チャットツールとの連携" },
    ],
  },
};

// ユースケース
const USE_CASES = [
  {
    title: "スタートアップの請求管理",
    description: "創業間もない企業が、請求書発行から入金管理まで一人で効率的に管理",
    features: ["請求書作成", "入金確認", "AI自動仕訳"],
  },
  {
    title: "営業チームのCRM活用",
    description: "10名の営業チームが商談をパイプラインで管理し、売上予測をAIで実現",
    features: ["リード管理", "商談管理", "AI売上予測"],
  },
  {
    title: "バックオフィスの効率化",
    description: "経理・人事の業務を一元化し、月次決算を自動化",
    features: ["会計仕訳", "給与計算", "経費精算"],
  },
  {
    title: "リモートワーク対応",
    description: "全社員がリモートでも勤怠・経費・契約を管理",
    features: ["勤怠管理", "電子署名", "経費OCR"],
  },
];

// FAQ
const FAQ_ITEMS = [
  {
    question: "Totonosは無料で使えますか？",
    answer: "はい、Freeプランでは月100クレジットまで無料でご利用いただけます。基本的な機能はすべてお試しいただけます。",
  },
  {
    question: "クレジットとは何ですか？",
    answer: "クレジットは、AIチャット、PDF生成、メール送信などの機能利用時に消費されるポイントです。各機能の消費量は本ページのクレジット消費表をご覧ください。",
  },
  {
    question: "クレジットが足りなくなったらどうなりますか？",
    answer: "クレジットが不足すると、クレジット消費を伴う機能が利用できなくなります。追加クレジットをチャージするか、プランをアップグレードしてください。基本的なデータ閲覧・編集機能は引き続きご利用いただけます。",
  },
  {
    question: "データのバックアップはありますか？",
    answer: "はい、全プランで日次自動バックアップを実施しています。データはお客様のものであり、いつでもJSON/CSV形式でエクスポートできます。",
  },
  {
    question: "複数人で使えますか？",
    answer: "はい、Standardプラン以上でチームメンバーを招待できます。Standardは5名まで、Proは無制限です。",
  },
  {
    question: "スマートフォンからも使えますか？",
    answer: "はい、レスポンシブデザインにより、スマートフォン・タブレットからも快適にご利用いただけます。経費の領収書撮影など、モバイル向け機能も充実しています。",
  },
  {
    question: "他のサービスと連携できますか？",
    answer: "はい、Slack、LINE、Google Chat、メール（IMAP）との連携に対応しています。また、API経由で外部システムとの連携も可能です（Standardプラン以上）。",
  },
  {
    question: "データは安全ですか？",
    answer: "はい、すべてのデータは暗号化されて保存されます。また、行レベルセキュリティ（RLS）により、アクセス権限を厳密に制御しています。詳しくは利用契約書・SLAをご覧ください。",
  },
  {
    question: "解約はいつでもできますか？",
    answer: "はい、いつでも解約可能です。解約後30日間はデータを保持しますので、その間にエクスポートしてください。",
  },
  {
    question: "導入サポートはありますか？",
    answer: "Enterpriseプランでは専任のアカウントマネージャーによる導入支援を提供しています。その他のプランでもメール・チャットサポートをご利用いただけます。",
  },
];

// クレジットコストをカテゴリ別に整理
const CREDIT_CATEGORIES = {
  ai: {
    name: "AI機能",
    items: ["ai_chat", "ai_chat_image", "ai_chat_pdf", "ai_email_analysis", "ai_email_reply", "ai_email_command", "ai_forecast", "ai_scoring", "lead_scoring"],
  },
  document: {
    name: "ドキュメント処理",
    items: ["ai_document_generate", "ocr", "ocr_delivery_note", "pdf"],
  },
  communication: {
    name: "メール・エクスポート",
    items: ["email", "export"],
  },
  contract: {
    name: "契約管理",
    items: ["contract_create", "contract_sign", "contract_blockchain"],
  },
  other: {
    name: "その他",
    items: ["mcp_call", "barcode_lookup"],
  },
};

export default function ServiceGuide() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto py-12 px-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8 print-hidden">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            印刷
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-4">サービスガイド</h1>
        <p className="text-muted-foreground mb-8">
          最終更新日: 2026年1月20日
        </p>

        {/* 目次 */}
        <nav className="mb-12 p-6 bg-muted/50 print-hidden">
          <h2 className="text-lg font-semibold mb-4">目次</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#overview" className="hover:underline">1. Totonosとは</a></li>
            <li><a href="#features" className="hover:underline">2. 機能詳細</a></li>
            <li><a href="#use-cases" className="hover:underline">3. ユースケース</a></li>
            <li><a href="#credits" className="hover:underline">4. クレジット消費表</a></li>
            <li><a href="#plans" className="hover:underline">5. 料金プラン</a></li>
            <li><a href="#faq" className="hover:underline">6. よくある質問</a></li>
          </ul>
        </nav>

        {/* 1. サービス概要 */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">1. Totonosとは</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              Totonosは、中小企業・スタートアップ向けの統合ビジネスプラットフォームです。
              CRM、請求管理、契約管理、会計、人事、経費精算、プロジェクト管理、AI自動化の
              8つのサービスを1つのプラットフォームで提供します。
            </p>
            <p>
              複数のSaaSを契約・管理する手間を省き、データを一元化することで、
              業務効率を大幅に向上させます。AIアシスタントが日々の業務をサポートし、
              経営判断に必要な情報をリアルタイムで提供します。
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {Object.entries(SERVICE_CATEGORIES).slice(0, 8).map(([key, category]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. 機能詳細 */}
        <section id="features" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">2. 機能詳細</h2>

          <Tabs defaultValue="crm" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6 print-hidden">
              {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="text-sm">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">機能</TableHead>
                          <TableHead>説明</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.features.map((feature, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{feature.name}</TableCell>
                            <TableCell>{feature.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* 印刷用：全カテゴリを表示 */}
          <div className="hidden print:block space-y-8">
            {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
              <div key={key}>
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">機能</TableHead>
                      <TableHead>説明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.features.map((feature, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell>{feature.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ユースケース */}
        <section id="use-cases" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">3. ユースケース</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {USE_CASES.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {useCase.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-muted text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. クレジット消費表 */}
        <section id="credits" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">4. クレジット消費表</h2>
          <p className="text-muted-foreground mb-6">
            以下の機能を利用するとクレジットが消費されます。基本的なデータ閲覧・編集はクレジット不要です。
          </p>

          <div className="space-y-6">
            {Object.entries(CREDIT_CATEGORIES).map(([categoryKey, category]) => (
              <Card key={categoryKey}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>機能</TableHead>
                        <TableHead className="text-right w-32">消費クレジット</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.items.map((itemKey) => {
                        const item = CREDIT_COSTS[itemKey as keyof typeof CREDIT_COSTS];
                        if (!item) return null;
                        return (
                          <TableRow key={itemKey}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right font-mono">
                              {item.cost === 0 ? "無料" : `${item.cost} クレジット`}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 5. 料金プラン */}
        <section id="plans" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">5. 料金プラン</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>プラン</TableHead>
                <TableHead className="text-right">月額料金</TableHead>
                <TableHead className="text-right">月間クレジット</TableHead>
                <TableHead>主な特徴</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {plan.price === 0 && key !== "enterprise" ? "無料" :
                     key === "enterprise" ? "お問い合わせ" :
                     `¥${plan.price.toLocaleString()}`}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {plan.monthlyCredits === Infinity ? "無制限" : plan.monthlyCredits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key === "free" && "個人利用、お試しに最適"}
                    {key === "starter" && "小規模ビジネス向け"}
                    {key === "standard" && "成長企業向け、チーム機能"}
                    {key === "pro" && "大規模チーム、SLA保証"}
                    {key === "enterprise" && "カスタム対応、専任サポート"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            ※ 年額プランは20%割引が適用されます。詳細は
            <Link to="/pricing" className="underline hover:text-foreground print-hidden">料金ページ</Link>
            <span className="hidden print:inline">料金ページ</span>
            をご覧ください。
          </p>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">6. よくある質問</h2>

          {/* インタラクティブ版（画面表示用） */}
          <Accordion type="single" collapsible className="print-hidden">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* 印刷用：全て展開表示 */}
          <div className="hidden print:block space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index}>
                <h4 className="font-medium">{item.question}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* フッター */}
        <footer className="border-t pt-8">
          <h3 className="font-semibold mb-4">関連リンク</h3>
          <ul className="space-y-2 text-sm print-hidden">
            <li>
              <Link to="/service-agreement" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                利用契約書・SLA
              </Link>
            </li>
            <li>
              <Link to="/terms" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                利用規約
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" />
                料金プラン
              </Link>
            </li>
          </ul>
          <div className="hidden print:block">
            <p className="text-sm text-muted-foreground">
              利用契約書・SLA: /service-agreement | 利用規約: /terms | プライバシーポリシー: /privacy
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
