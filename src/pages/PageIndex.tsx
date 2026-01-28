import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  Users,
  ArrowLeftRight,
  Zap,
  Shield,
  BarChart3,
  Settings,
  FileSignature,
  Calculator,
  BookOpen,
  PieChart,
  Building2,
  Wallet,
  UserPlus,
  Target,
  Book,
  Laptop,
  Clock,
  DollarSign,
  FileCheck,
  UserCircle,
  ClipboardList,
  ShoppingCart,
  Activity,
  Kanban,
  Scale,
  Banknote,
  CalendarDays,
  Palmtree,
  Map,
  LucideIcon,
  Bell,
  Workflow,
  Package,
  CreditCard,
  Mail,
  Coins,
  History,
  FileBox,
  RefreshCw,
  UserSearch,
  Megaphone,
  Calendar,
  Receipt,
  Menu,
  Bot,
  Code,
  Upload,
  ScrollText,
  Database,
  Inbox,
  MessageCircle,
  Hash,
  Key,
  GanttChart,
  Timer,
  Gift,
  FileCode,
  TrendingUp,
  BarChart,
  Briefcase,
  FileSpreadsheet,
  Eye,
  Rocket,
  HelpCircle,
  Building,
  Heart,
  GraduationCap,
  Truck,
  HardHat,
  Utensils,
  Scissors,
  Stethoscope,
  Car,
  Dog,
  Pill,
  Gem,
  Sofa,
  Dumbbell,
  Hotel,
  Sparkle,
  Home,
  Coffee,
  Cake,
  Baby,
  Cross,
  Cat,
  Monitor,
  Film,
  Camera,
  Tractor,
  Warehouse,
  Bike,
  Languages,
  School,
  HeartHandshake,
} from 'lucide-react';

interface PageInfo {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
  category: string;
}

const allPages: PageInfo[] = [
  // メイン
  { title: 'ダッシュボード', url: '/dashboard', icon: LayoutDashboard, description: 'KPIと概要の確認', category: 'メイン' },
  { title: 'はじめに', url: '/getting-started', icon: Rocket, description: '初期設定ガイド', category: 'メイン' },
  { title: '通知センター', url: '/notifications', icon: Bell, description: '通知一覧・管理', category: 'メイン' },
  { title: 'プロフィール', url: '/profile', icon: UserCircle, description: 'ユーザープロフィール', category: 'メイン' },

  // 営業・CRM
  { title: 'リード', url: '/leads', icon: UserPlus, description: 'リード（見込み客）管理', category: '営業・CRM' },
  { title: '商談', url: '/deals', icon: Target, description: '商談・案件管理', category: '営業・CRM' },
  { title: 'パイプライン', url: '/pipeline', icon: Kanban, description: '商談パイプラインのかんばんビュー', category: '営業・CRM' },
  { title: '活動履歴', url: '/activities', icon: Activity, description: '営業活動の記録と管理', category: '営業・CRM' },
  { title: '取引先', url: '/clients', icon: Users, description: '取引先マスタ管理', category: '営業・CRM' },
  { title: 'リードスコアリング', url: '/lead-scoring', icon: TrendingUp, description: 'AIによるリード評価', category: '営業・CRM' },
  { title: '売上予測', url: '/sales-forecast', icon: BarChart, description: 'AI売上予測', category: '営業・CRM' },

  // ドキュメント
  { title: '請求書', url: '/invoices', icon: FileText, description: '請求書の作成・管理', category: 'ドキュメント' },
  { title: '見積書', url: '/estimates', icon: ClipboardList, description: '見積書の作成・請求書変換', category: 'ドキュメント' },
  { title: '発注書', url: '/purchase-orders', icon: ShoppingCart, description: '発注書の作成・承認', category: 'ドキュメント' },
  { title: '契約書', url: '/contracts', icon: FileSignature, description: '契約書の作成・電子署名', category: 'ドキュメント' },
  { title: '契約アラート', url: '/contract-alerts', icon: Bell, description: '契約更新・期限アラート', category: 'ドキュメント' },

  // ファイナンス
  { title: '自動消込', url: '/reconciliation', icon: ArrowLeftRight, description: '入金と請求書の自動マッチング（準備中）', category: 'ファイナンス' },
  { title: '銀行連携', url: '/bank-connections', icon: Building2, description: '銀行口座API連携・明細自動取込（準備中）', category: 'ファイナンス' },
  { title: 'ダイナミックブースト', url: '/boost', icon: Zap, description: '請求書の即時資金化（準備中）', category: 'ファイナンス' },
  { title: 'トラストパスポート', url: '/trust-passport', icon: Shield, description: '信用スコアとランク確認（準備中）', category: 'ファイナンス' },
  { title: '決済リンク', url: '/payment-links', icon: CreditCard, description: 'オンライン決済リンク生成（準備中）', category: 'ファイナンス' },

  // 会計
  { title: '会計ダッシュボード', url: '/accounting', icon: Calculator, description: '会計概要と残高確認', category: '会計' },
  { title: '仕訳帳', url: '/accounting/journal', icon: BookOpen, description: '仕訳の入力・確認', category: '会計' },
  { title: '総勘定元帳', url: '/accounting/ledger', icon: FileSpreadsheet, description: '勘定科目別明細', category: '会計' },
  { title: '財務諸表', url: '/accounting/statements', icon: PieChart, description: 'BS/PL/CF表示', category: '会計' },
  { title: '予算管理', url: '/accounting/budget', icon: Scale, description: '予算登録と予実分析', category: '会計' },
  { title: '売掛金年齢表', url: '/accounting/receivables', icon: Banknote, description: '売掛金の回収状況分析', category: '会計' },
  { title: '買掛金管理', url: '/accounting/payables', icon: Wallet, description: '買掛金・支払い管理', category: '会計' },
  { title: '固定資産', url: '/accounting/assets', icon: Building2, description: '固定資産台帳', category: '会計' },
  { title: '経費管理', url: '/expenses', icon: Wallet, description: '経費精算・管理', category: '会計' },
  { title: '領収書スキャン', url: '/receipt-capture', icon: Receipt, description: '領収書OCR読取', category: '会計' },
  { title: '消費税管理', url: '/accounting/tax', icon: FileCheck, description: '消費税計算・申告', category: '会計' },
  { title: '期末締め', url: '/accounting/period-close', icon: Calendar, description: '月次・年次締め処理', category: '会計' },

  // 人事・労務
  { title: '従業員', url: '/employees', icon: Users, description: '従業員マスタ管理', category: '人事・労務' },
  { title: '勤怠管理', url: '/attendance', icon: Clock, description: '出退勤記録', category: '人事・労務' },
  { title: 'シフト管理', url: '/shifts', icon: CalendarDays, description: 'シフトカレンダー表示', category: '人事・労務' },
  { title: '休暇管理', url: '/leave-requests', icon: Palmtree, description: '休暇申請・取得状況', category: '人事・労務' },
  { title: '給与計算', url: '/payroll', icon: DollarSign, description: '給与計算・明細', category: '人事・労務' },
  { title: '給与明細', url: '/payslips', icon: Receipt, description: '給与明細の確認', category: '人事・労務' },
  { title: '社会保険', url: '/social-insurance', icon: Shield, description: '社会保険手続き', category: '人事・労務' },
  { title: 'マイナンバー管理', url: '/my-number', icon: CreditCard, description: 'マイナンバー管理', category: '人事・労務' },
  { title: '年末調整', url: '/year-end', icon: FileCheck, description: '年末調整処理', category: '人事・労務' },
  { title: '従業員ポータル', url: '/employee-portal', icon: UserCircle, description: '従業員セルフサービス', category: '人事・労務' },

  // 採用
  { title: '採用ダッシュボード', url: '/recruiting', icon: Briefcase, description: '採用状況の概要', category: '採用' },
  { title: '求人一覧', url: '/job-postings', icon: Megaphone, description: '求人票の作成・公開', category: '採用' },
  { title: '候補者管理', url: '/candidates', icon: UserSearch, description: '応募者の管理', category: '採用' },
  { title: '面接スケジュール', url: '/interview-schedule', icon: Calendar, description: '面接日程管理', category: '採用' },
  { title: '採用レポート', url: '/recruiting-reports', icon: BarChart3, description: '採用分析レポート', category: '採用' },

  // プロジェクト
  { title: 'プロジェクト', url: '/projects', icon: Briefcase, description: 'プロジェクト一覧', category: 'プロジェクト' },
  { title: 'ガントチャート', url: '/projects/gantt', icon: GanttChart, description: 'プロジェクトガントチャート', category: 'プロジェクト' },
  { title: 'カンバン', url: '/projects/kanban', icon: Kanban, description: 'タスクカンバンボード', category: 'プロジェクト' },
  { title: '工数記録', url: '/projects/timelog', icon: Timer, description: '作業時間記録', category: 'プロジェクト' },

  // 情報管理
  { title: '社内Wiki', url: '/wiki', icon: Book, description: 'ナレッジベース・ドキュメント', category: '情報管理' },
  { title: 'IT資産', url: '/it-assets', icon: Laptop, description: 'IT機器・ソフトウェア管理', category: '情報管理' },
  { title: '商品管理', url: '/products', icon: Package, description: '商品マスタ・在庫管理', category: '情報管理' },
  { title: '納品書', url: '/delivery-notes', icon: FileBox, description: '納品書のOCR読取・検収', category: '情報管理' },
  { title: '自動発注', url: '/auto-reorder', icon: RefreshCw, description: '在庫自動発注設定', category: '情報管理' },

  // クレジット・決済
  { title: 'クレジット', url: '/credits', icon: Coins, description: 'クレジット残高・チャージ', category: 'クレジット・決済' },
  { title: 'クレジット履歴', url: '/credit-logs', icon: History, description: 'クレジット利用履歴', category: 'クレジット・決済' },
  { title: '料金プラン', url: '/pricing', icon: CreditCard, description: 'サブスクリプション・プラン選択', category: 'クレジット・決済' },

  // システム管理
  { title: '設定', url: '/settings', icon: Settings, description: 'アプリケーション設定', category: 'システム管理' },
  { title: '会社設定', url: '/settings/company', icon: Building2, description: '会社情報設定', category: 'システム管理' },
  { title: 'チーム管理', url: '/team', icon: Users, description: 'チームメンバー・権限管理', category: 'システム管理' },
  { title: 'メニュー設定', url: '/settings/menu', icon: Menu, description: 'サイドバー・モバイル設定', category: 'システム管理' },
  { title: 'AI設定', url: '/settings/ai', icon: Bot, description: 'AIモデル・プロバイダー設定', category: 'システム管理' },
  { title: '開発者設定', url: '/developer', icon: Code, description: 'API・Webhook設定', category: 'システム管理' },
  { title: 'データインポート', url: '/data-import', icon: Upload, description: 'CSV/Excelインポート', category: 'システム管理' },
  { title: '監査ログ', url: '/audit-log', icon: ScrollText, description: '操作履歴', category: 'システム管理' },
  { title: 'バックアップ', url: '/settings/backup', icon: Database, description: 'バックアップ設定', category: 'システム管理' },
  { title: 'ワークフロー', url: '/workflows', icon: Workflow, description: '業務自動化・ワークフロー設定', category: 'システム管理' },
  { title: '承認フロー', url: '/approval-workflow', icon: FileCheck, description: '承認ワークフロー設定', category: 'システム管理' },

  // 連携
  { title: '連携一覧', url: '/integrations', icon: Zap, description: '外部サービス連携', category: '連携' },
  { title: 'メール連携', url: '/email-integration', icon: Mail, description: 'メール連携設定', category: '連携' },
  { title: 'メール受信', url: '/inbound-emails', icon: Inbox, description: '受信メール一覧', category: '連携' },
  { title: 'メールテンプレート', url: '/email-templates', icon: Mail, description: 'メールテンプレート管理', category: '連携' },
  { title: 'LINE連携', url: '/line-settings', icon: MessageCircle, description: 'LINE公式アカウント連携', category: '連携' },
  { title: 'Slack連携', url: '/slack-integration', icon: Hash, description: 'Slack連携設定', category: '連携' },
  { title: 'SSO設定', url: '/sso-settings', icon: Key, description: 'シングルサインオン', category: '連携' },

  // その他
  { title: 'レポート', url: '/reports', icon: BarChart3, description: 'ビジネスレポート・分析', category: 'その他' },
  { title: '紹介プログラム', url: '/referrals', icon: Gift, description: '紹介報酬プログラム', category: 'その他' },
  { title: '使用状況', url: '/usage', icon: Eye, description: 'システム使用状況', category: 'その他' },
  { title: 'APIドキュメント', url: '/api-docs', icon: FileCode, description: 'REST API仕様', category: 'その他' },
  { title: 'ヘルプ', url: '/help', icon: HelpCircle, description: 'ヘルプ・ドキュメント', category: 'その他' },

  // 業種別ランディング
  { title: '業種一覧', url: '/industries', icon: Building, description: 'テンプレート選択', category: '業種LP' },
  // 小売・流通
  { title: '小売・EC', url: '/lp/retail', icon: ShoppingCart, description: '小売業向け', category: '業種LP' },
  { title: '自動車販売・整備', url: '/lp/car-dealer', icon: Car, description: '自動車業向け', category: '業種LP' },
  { title: 'ペットサービス', url: '/lp/pet-service', icon: Dog, description: 'ペット業向け', category: '業種LP' },
  { title: '薬局・ドラッグストア', url: '/lp/pharmacy', icon: Pill, description: '薬局向け', category: '業種LP' },
  { title: 'ジュエリー・時計販売', url: '/lp/jewelry', icon: Gem, description: '宝飾業向け', category: '業種LP' },
  { title: '家具・インテリア', url: '/lp/furniture', icon: Sofa, description: '家具店向け', category: '業種LP' },
  // 飲食・サービス
  { title: '飲食店', url: '/lp/restaurant', icon: Utensils, description: '飲食業向け', category: '業種LP' },
  { title: '美容室・サロン', url: '/lp/beauty-salon', icon: Scissors, description: '美容業向け', category: '業種LP' },
  { title: 'フィットネス・ジム', url: '/lp/fitness', icon: Dumbbell, description: 'ジム向け', category: '業種LP' },
  { title: 'ホテル・旅館', url: '/lp/hotel', icon: Hotel, description: '宿泊業向け', category: '業種LP' },
  { title: '清掃サービス', url: '/lp/cleaning', icon: Sparkle, description: '清掃業向け', category: '業種LP' },
  { title: '民泊・バケーションレンタル', url: '/lp/vacation-rental', icon: Home, description: '民泊向け', category: '業種LP' },
  { title: 'カフェ・喫茶店', url: '/lp/cafe', icon: Coffee, description: 'カフェ向け', category: '業種LP' },
  { title: 'パン屋・ケーキ屋', url: '/lp/bakery', icon: Cake, description: 'ベーカリー向け', category: '業種LP' },
  { title: 'エステ・スパ', url: '/lp/spa', icon: Sparkle, description: 'スパ向け', category: '業種LP' },
  { title: 'ウェディング・イベント', url: '/lp/wedding', icon: Heart, description: 'イベント業向け', category: '業種LP' },
  // 専門サービス
  { title: 'コンサルティング', url: '/lp/consulting', icon: Briefcase, description: 'コンサル向け', category: '業種LP' },
  { title: '法律事務所', url: '/lp/legal', icon: Scale, description: '法律事務所向け', category: '業種LP' },
  { title: '税理士事務所', url: '/lp/tax-accountant', icon: Calculator, description: '税理士向け', category: '業種LP' },
  { title: '特許事務所', url: '/lp/patent', icon: FileCode, description: '特許事務所向け', category: '業種LP' },
  { title: '不動産', url: '/lp/real-estate', icon: Building2, description: '不動産業向け', category: '業種LP' },
  { title: '保険代理店', url: '/lp/insurance', icon: Shield, description: '保険業向け', category: '業種LP' },
  { title: 'デザイン事務所', url: '/lp/design', icon: Film, description: 'デザイン業向け', category: '業種LP' },
  { title: '建築設計事務所', url: '/lp/architect', icon: Building, description: '建築設計向け', category: '業種LP' },
  { title: '翻訳・通訳', url: '/lp/translation', icon: Languages, description: '翻訳業向け', category: '業種LP' },
  { title: '人材紹介・派遣', url: '/lp/hr-agency', icon: Users, description: '人材業向け', category: '業種LP' },
  // 医療・福祉
  { title: '医療・クリニック', url: '/lp/healthcare', icon: Heart, description: 'クリニック向け', category: '業種LP' },
  { title: '保育園・幼稚園', url: '/lp/nursery', icon: Baby, description: '保育園向け', category: '業種LP' },
  { title: '介護・福祉施設', url: '/lp/welfare', icon: HeartHandshake, description: '介護施設向け', category: '業種LP' },
  { title: '歯科医院', url: '/lp/dental', icon: Stethoscope, description: '歯科向け', category: '業種LP' },
  { title: '調剤薬局', url: '/lp/pharmacy-clinic', icon: Cross, description: '調剤薬局向け', category: '業種LP' },
  { title: '動物病院', url: '/lp/veterinary', icon: Cat, description: '動物病院向け', category: '業種LP' },
  // 建設・製造
  { title: '建設・工事', url: '/lp/construction', icon: HardHat, description: '建設業向け', category: '業種LP' },
  { title: '製造業', url: '/lp/manufacturing', icon: HardHat, description: '製造業向け', category: '業種LP' },
  { title: '食品製造', url: '/lp/food-manufacturing', icon: Cake, description: '食品製造向け', category: '業種LP' },
  { title: '印刷業', url: '/lp/printing', icon: FileText, description: '印刷業向け', category: '業種LP' },
  { title: '電気工事', url: '/lp/electrical', icon: Zap, description: '電気工事向け', category: '業種LP' },
  { title: '設備工事', url: '/lp/plumbing', icon: HardHat, description: '設備工事向け', category: '業種LP' },
  // IT・クリエイティブ
  { title: 'IT・ソフトウェア', url: '/lp/it', icon: Monitor, description: 'IT企業向け', category: '業種LP' },
  { title: '制作会社', url: '/lp/production', icon: Film, description: '制作会社向け', category: '業種LP' },
  { title: '会計事務所', url: '/lp/accounting-firm', icon: Calculator, description: '会計事務所向け', category: '業種LP' },
  { title: 'SaaS・サブスクビジネス', url: '/lp/saas', icon: Rocket, description: 'SaaS向け', category: '業種LP' },
  { title: 'マーケティング代理店', url: '/lp/marketing-agency', icon: Megaphone, description: '広告代理店向け', category: '業種LP' },
  { title: '写真スタジオ', url: '/lp/photo-studio', icon: Camera, description: 'スタジオ向け', category: '業種LP' },
  // 物流・農業
  { title: '物流・運送', url: '/lp/logistics', icon: Truck, description: '物流業向け', category: '業種LP' },
  { title: '農業・漁業', url: '/lp/agriculture', icon: Tractor, description: '農業向け', category: '業種LP' },
  { title: '倉庫・3PL', url: '/lp/warehouse', icon: Warehouse, description: '倉庫業向け', category: '業種LP' },
  { title: 'フードデリバリー', url: '/lp/food-delivery', icon: Bike, description: 'デリバリー向け', category: '業種LP' },
  // 教育・非営利
  { title: '学習塾・教育', url: '/lp/education', icon: GraduationCap, description: '教育業向け', category: '業種LP' },
  { title: 'NPO・社団法人', url: '/lp/npo', icon: HeartHandshake, description: 'NPO向け', category: '業種LP' },
  { title: '自動車教習所', url: '/lp/driving-school', icon: Car, description: '教習所向け', category: '業種LP' },
];

// Group pages by category
const pagesByCategory = allPages.reduce((acc, page) => {
  if (!acc[page.category]) {
    acc[page.category] = [];
  }
  acc[page.category].push(page);
  return acc;
}, {} as Record<string, PageInfo[]>);

const categoryOrder = [
  'メイン',
  '営業・CRM',
  'ドキュメント',
  'ファイナンス',
  '会計',
  '人事・労務',
  '採用',
  'プロジェクト',
  '情報管理',
  'クレジット・決済',
  'システム管理',
  '連携',
  'その他',
  '業種LP',
];

export default function PageIndex() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Map className="h-8 w-8" />
              ページ一覧
            </h1>
            <p className="text-muted-foreground">
              全 {allPages.length} ページ
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総ページ数</CardDescription>
              <CardTitle className="text-2xl">{allPages.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>カテゴリ数</CardDescription>
              <CardTitle className="text-2xl">{categoryOrder.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>会計ページ</CardDescription>
              <CardTitle className="text-2xl">{pagesByCategory['会計']?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>人事ページ</CardDescription>
              <CardTitle className="text-2xl">{pagesByCategory['人事・労務']?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pages by Category */}
        {categoryOrder.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>{pagesByCategory[category]?.length || 0} ページ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pagesByCategory[category]?.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Link
                      key={page.url}
                      to={page.url}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{page.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{page.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs font-mono">
                          {page.url}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Quick Reference Table */}
        <Card>
          <CardHeader>
            <CardTitle>URL一覧</CardTitle>
            <CardDescription>全ページのURLリファレンス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm font-mono">
              {allPages.map((page) => (
                <Link
                  key={page.url}
                  to={page.url}
                  className="p-2 rounded hover:bg-muted flex justify-between items-center"
                >
                  <span className="text-muted-foreground">{page.title}</span>
                  <span className="text-primary">{page.url}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
