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

  // 営業・CRM
  { title: 'リード', url: '/leads', icon: UserPlus, description: 'リード（見込み客）管理', category: '営業・CRM' },
  { title: '商談', url: '/deals', icon: Target, description: '商談・案件管理', category: '営業・CRM' },
  { title: 'パイプライン', url: '/pipeline', icon: Kanban, description: '商談パイプラインのかんばんビュー', category: '営業・CRM' },
  { title: '活動履歴', url: '/activities', icon: Activity, description: '営業活動の記録と管理', category: '営業・CRM' },
  { title: '取引先', url: '/clients', icon: Users, description: '取引先マスタ管理', category: '営業・CRM' },

  // ドキュメント
  { title: '請求書', url: '/invoices', icon: FileText, description: '請求書の作成・管理', category: 'ドキュメント' },
  { title: '見積書', url: '/estimates', icon: ClipboardList, description: '見積書の作成・請求書変換', category: 'ドキュメント' },
  { title: '発注書', url: '/purchase-orders', icon: ShoppingCart, description: '発注書の作成・承認', category: 'ドキュメント' },
  { title: '契約書', url: '/contracts', icon: FileSignature, description: '契約書の作成・電子署名', category: 'ドキュメント' },

  // ファイナンス
  { title: '自動消込', url: '/reconciliation', icon: ArrowLeftRight, description: '入金と請求書の自動マッチング', category: 'ファイナンス' },
  { title: '銀行連携', url: '/bank-connections', icon: Building2, description: '銀行口座API連携・明細自動取込', category: 'ファイナンス' },
  { title: 'Dynamic Boost', url: '/boost', icon: Zap, description: '請求書の即時資金化', category: 'ファイナンス' },
  { title: 'Trust Passport', url: '/trust-passport', icon: Shield, description: '信用スコアとランク確認', category: 'ファイナンス' },
  { title: '決済リンク', url: '/payment-links', icon: CreditCard, description: 'オンライン決済リンク生成', category: 'ファイナンス' },

  // 会計
  { title: '会計ダッシュボード', url: '/accounting', icon: Calculator, description: '会計概要と残高確認', category: '会計' },
  { title: '仕訳帳', url: '/accounting/journal', icon: BookOpen, description: '仕訳の入力・確認', category: '会計' },
  { title: '財務諸表', url: '/accounting/statements', icon: PieChart, description: 'BS/PL/CF表示', category: '会計' },
  { title: '予算管理', url: '/accounting/budget', icon: Scale, description: '予算登録と予実分析', category: '会計' },
  { title: '売掛金年齢表', url: '/accounting/receivables', icon: Banknote, description: '売掛金の回収状況分析', category: '会計' },
  { title: '固定資産', url: '/accounting/assets', icon: Building2, description: '固定資産台帳', category: '会計' },
  { title: '経費管理', url: '/accounting/expenses', icon: Wallet, description: '経費精算・管理', category: '会計' },

  // 人事・労務
  { title: '従業員', url: '/employees', icon: Users, description: '従業員マスタ管理', category: '人事・労務' },
  { title: '勤怠管理', url: '/attendance', icon: Clock, description: '出退勤記録', category: '人事・労務' },
  { title: 'シフト管理', url: '/shifts', icon: CalendarDays, description: 'シフトカレンダー表示', category: '人事・労務' },
  { title: '休暇管理', url: '/leave-requests', icon: Palmtree, description: '休暇申請・取得状況', category: '人事・労務' },
  { title: '給与計算', url: '/payroll', icon: DollarSign, description: '給与計算・明細', category: '人事・労務' },
  { title: '年末調整', url: '/year-end', icon: FileCheck, description: '年末調整処理', category: '人事・労務' },

  // 情報管理
  { title: '社内Wiki', url: '/wiki', icon: Book, description: 'ナレッジベース・ドキュメント', category: '情報管理' },
  { title: 'IT資産', url: '/it-assets', icon: Laptop, description: 'IT機器・ソフトウェア管理', category: '情報管理' },
  { title: '商品管理', url: '/products', icon: Package, description: '商品マスタ・在庫管理', category: '情報管理' },

  // システム管理
  { title: '通知センター', url: '/notifications', icon: Bell, description: '通知一覧・管理', category: 'システム管理' },
  { title: 'チーム管理', url: '/team', icon: Users, description: 'チームメンバー・権限管理', category: 'システム管理' },
  { title: 'ワークフロー', url: '/workflows', icon: Workflow, description: '業務自動化・ワークフロー設定', category: 'システム管理' },
  { title: 'メールテンプレート', url: '/email-templates', icon: Mail, description: 'メールテンプレート管理', category: 'システム管理' },

  // その他
  { title: 'レポート', url: '/reports', icon: BarChart3, description: 'ビジネスレポート・分析', category: 'その他' },
  { title: 'プロフィール', url: '/profile', icon: UserCircle, description: 'ユーザープロフィール', category: 'その他' },
  { title: '設定', url: '/settings', icon: Settings, description: 'アプリケーション設定', category: 'その他' },
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
  '情報管理',
  'システム管理',
  'その他',
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
