import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Menu,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Settings,
  Smartphone,
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  Users,
  Factory,
  Code,
  Calculator,
  Check,
  ArrowUp,
  ArrowDown,
  LucideIcon,
  Scale,
  Palette,
  Warehouse,
  Utensils,
  Scissors,
  HardHat,
  Globe,
  Stethoscope,
  Heart,
  GraduationCap,
  HeartHandshake,
  Truck,
  Building,
  Rocket,
  User,
  Download,
  Power,
  PowerOff,
  Lock,
  Search,
  Map,
  Plus,
  FileText,
  ArrowLeftRight,
  Zap,
  Shield,
  BarChart3,
  FileSignature,
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
  Activity,
  Kanban,
  Banknote,
  CalendarDays,
  Palmtree,
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
  Bot,
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
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import { HpkiBridgeDownload } from '@/components/emr/HpkiBridgeDownload';
import { useAppSettings } from '@/contexts/SettingsContext';
import { type MenuItemConfig } from '@/hooks/useSettings';
import { industryTemplates, availableMobileNavItems } from '@/types/menu-templates';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Icon mapping for templates
const templateIconMap: Record<string, LucideIcon> = {
  Briefcase,
  ShoppingCart,
  Users,
  Factory,
  Code,
  Calculator,
  Scale,
  Palette,
  Warehouse,
  Utensils,
  Scissors,
  HardHat,
  Globe,
  Stethoscope,
  Heart,
  GraduationCap,
  HeartHandshake,
  Truck,
  Building,
  Rocket,
  User,
};

// Page Index Data for the "Pages" tab
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
  { title: '自動消込', url: '/reconciliation', icon: ArrowLeftRight, description: '入金と請求書の自動マッチング', category: 'ファイナンス' },
  { title: '銀行連携', url: '/bank-connections', icon: Building2, description: '銀行口座API連携・明細自動取込', category: 'ファイナンス' },
  { title: 'Dynamic Boost', url: '/boost', icon: Zap, description: '請求書の即時資金化', category: 'ファイナンス' },
  { title: 'Trust Passport', url: '/trust-passport', icon: Shield, description: '信用スコアとランク確認', category: 'ファイナンス' },
  { title: '決済リンク', url: '/payment-links', icon: CreditCard, description: 'オンライン決済リンク生成', category: 'ファイナンス' },
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
  { title: 'LINE連携', url: '/settings/line', icon: MessageCircle, description: 'LINE公式アカウント連携', category: '連携' },
  { title: 'Slack連携', url: '/integrations/slack', icon: Hash, description: 'Slack連携設定', category: '連携' },
  { title: 'SSO設定', url: '/settings/sso', icon: Key, description: 'シングルサインオン', category: '連携' },
  // その他
  { title: 'レポート', url: '/reports', icon: BarChart3, description: 'ビジネスレポート・分析', category: 'その他' },
  { title: '紹介プログラム', url: '/referrals', icon: Gift, description: '紹介報酬プログラム', category: 'その他' },
  { title: 'APIドキュメント', url: '/api-docs', icon: FileCode, description: 'REST API仕様', category: 'その他' },
  { title: 'ヘルプ', url: '/help', icon: HelpCircle, description: 'ヘルプ・ドキュメント', category: 'その他' },
];

const categoryOrder = [
  'メイン', '営業・CRM', 'ドキュメント', 'ファイナンス', '会計',
  '人事・労務', '採用', 'プロジェクト', '情報管理', 'クレジット・決済',
  'システム管理', '連携', 'その他',
];

// Page icon mapping for menu items
const pageIconMap: Record<string, LucideIcon> = allPages.reduce((acc, page) => {
  acc[page.url] = page.icon;
  return acc;
}, {} as Record<string, LucideIcon>);

export default function SettingsMenu() {
  const { 
    settings, 
    updateMenuGroup, 
    updateMenuItem, 
    resetToDefaults,
    updateMobileNavItems,
    reorderGroups,
    reorderItems,
    applyTemplate,
    isProtectedItem,
    isProtectedGroup,
  } = useAppSettings();
  
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(
    settings.menuGroups.map(g => g.id)
  ));
  const [activeTab, setActiveTab] = useState("menu");
  const [pageSearchQuery, setPageSearchQuery] = useState("");

  // Drag and drop state
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [dropTargetGroupId, setDropTargetGroupId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [draggingFromGroupId, setDraggingFromGroupId] = useState<string | null>(null);
  const [dropTargetItemId, setDropTargetItemId] = useState<string | null>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Group drag handlers
  const handleGroupDragStart = (e: React.DragEvent, groupId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingGroupId(groupId);
  };

  const handleGroupDragOver = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (draggingGroupId && draggingGroupId !== targetGroupId && !draggingItemId) {
      setDropTargetGroupId(targetGroupId);
    }
  };

  const handleGroupDragEnd = () => {
    setDraggingGroupId(null);
    setDropTargetGroupId(null);
  };

  const handleGroupDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (draggingGroupId && draggingGroupId !== targetGroupId && !draggingItemId) {
      reorderGroups(draggingGroupId, targetGroupId);
      toast.success('グループの順序を変更しました');
    }
    setDraggingGroupId(null);
    setDropTargetGroupId(null);
  };

  // Item drag handlers
  const handleItemDragStart = (e: React.DragEvent, groupId: string, itemId: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    setDraggingItemId(itemId);
    setDraggingFromGroupId(groupId);
  };

  const handleItemDragOver = (e: React.DragEvent, groupId: string, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingItemId && draggingFromGroupId === groupId && draggingItemId !== targetItemId) {
      setDropTargetItemId(targetItemId);
    }
  };

  const handleItemDragEnd = () => {
    setDraggingItemId(null);
    setDraggingFromGroupId(null);
    setDropTargetItemId(null);
  };

  const handleItemDrop = (e: React.DragEvent, groupId: string, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingItemId && draggingFromGroupId === groupId && draggingItemId !== targetItemId) {
      reorderItems(groupId, draggingItemId, targetItemId);
    }
    setDraggingItemId(null);
    setDraggingFromGroupId(null);
    setDropTargetItemId(null);
  };

  const handleGroupVisibilityChange = (groupId: string, visible: boolean) => {
    updateMenuGroup(groupId, { visible });
    toast.success(visible ? 'グループを表示しました' : 'グループを非表示にしました');
  };

  const handleGroupEnabledChange = (groupId: string, enabled: boolean) => {
    updateMenuGroup(groupId, { enabled });
    toast.success(enabled ? '機能を有効化しました' : '機能を無効化しました');
  };

  const handleItemVisibilityChange = (groupId: string, itemId: string, visible: boolean) => {
    updateMenuItem(groupId, itemId, { visible });
  };

  const handleItemEnabledChange = (groupId: string, itemId: string, enabled: boolean) => {
    updateMenuItem(groupId, itemId, { enabled });
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success('メニュー設定をリセットしました');
  };


  // Mobile nav handlers
  const handleMobileNavToggle = (itemId: string, visible: boolean) => {
    const existingItem = settings.mobileNavItems.find(i => i.id === itemId);
    
    if (existingItem) {
      const updated = settings.mobileNavItems.map(item =>
        item.id === itemId ? { ...item, visible } : item
      );
      updateMobileNavItems(updated);
    } else {
      const maxOrder = Math.max(...settings.mobileNavItems.map(i => i.order), -1);
      updateMobileNavItems([
        ...settings.mobileNavItems,
        { id: itemId, visible, order: maxOrder + 1 }
      ]);
    }
  };

  const handleMobileNavMove = (itemId: string, direction: 'up' | 'down') => {
    const items = [...settings.mobileNavItems].sort((a, b) => a.order - b.order);
    const currentIndex = items.findIndex(i => i.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const updated = items.map((item, index) => {
      if (index === currentIndex) return { ...item, order: newIndex };
      if (index === newIndex) return { ...item, order: currentIndex };
      return item;
    });

    updateMobileNavItems(updated);
  };

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate(templateId);
    toast.success("テンプレートを適用しました");
  };

  // Sort groups and items by order
  const sortedGroups = [...settings.menuGroups].sort((a, b) => a.order - b.order);
  const sortedMobileNav = [...settings.mobileNavItems].sort((a, b) => a.order - b.order);

  const visibleItemCount = settings.menuGroups.reduce(
    (acc, group) => acc + (group.visible ? group.items.filter(i => i.visible).length : 0),
    0
  );

  const totalItemCount = settings.menuGroups.reduce(
    (acc, group) => acc + group.items.length,
    0
  );

  const visibleMobileCount = settings.mobileNavItems.filter(i => i.visible).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Menu className="h-8 w-8" />
              メニュー設定
            </h1>
            <p className="text-muted-foreground">
              サイドバーとモバイルナビゲーションをカスタマイズ
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            デフォルトに戻す
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[550px]">
            <TabsTrigger value="menu">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              サイドバー
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              モバイル
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Briefcase className="h-4 w-4 mr-2" />
              テンプレート
            </TabsTrigger>
            <TabsTrigger value="pages">
              <Map className="h-4 w-4 mr-2" />
              ページ一覧
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            {/* 統計 */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>表示中のメニュー</CardDescription>
                  <CardTitle className="text-2xl">
                    {visibleItemCount} / {totalItemCount}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>表示中のグループ</CardDescription>
                  <CardTitle className="text-2xl">
                    {settings.menuGroups.filter(g => g.visible).length} / {settings.menuGroups.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>カスタマイズ状態</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {visibleItemCount === totalItemCount ? '全表示' : 'カスタム'}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* メニューグループ一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>メニューグループ</CardTitle>
                <CardDescription>
                  グループの表示/非表示と機能の有効/無効を切り替えできます。
                  <br />
                  <span className="text-xs">
                    <Power className="h-3 w-3 inline mr-1" />機能ON：エージェントから利用可能
                    <Eye className="h-3 w-3 inline ml-3 mr-1" />表示ON：メニューに表示
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {sortedGroups.map((group, groupIndex) => {
                      const sortedItems = [...group.items].sort((a, b) => a.order - b.order);
                      const isExpanded = expandedGroups.has(group.id);
                      const visibleCount = group.items.filter(i => i.visible).length;

                      return (
                        <Collapsible
                          key={group.id}
                          open={isExpanded}
                          onOpenChange={() => toggleGroup(group.id)}
                        >
                          <div 
                            className={`border rounded-lg transition-all ${
                              !group.enabled ? 'opacity-40' : !group.visible ? 'opacity-60' : ''
                            } ${
                              draggingGroupId === group.id ? 'opacity-50 border-dashed' : ''
                            } ${
                              dropTargetGroupId === group.id ? 'border-2 border-primary bg-primary/5' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleGroupDragStart(e, group.id)}
                            onDragOver={(e) => handleGroupDragOver(e, group.id)}
                            onDragEnd={handleGroupDragEnd}
                            onDrop={(e) => handleGroupDrop(e, group.id)}
                          >
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 mr-2" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 mr-2" />
                                    )}
                                    <span className="font-medium">{group.label}</span>
                                  </Button>
                                </CollapsibleTrigger>
                                <Badge variant="secondary" className="text-xs">
                                  {visibleCount}/{group.items.length}表示
                                </Badge>
                                {!group.enabled && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    <PowerOff className="h-3 w-3 mr-1" />
                                    機能OFF
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                {/* 機能の有効/無効 */}
                                <div className="flex items-center gap-2">
                                  <Power className={`h-4 w-4 ${group.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <Switch
                                    checked={group.enabled}
                                    disabled={isProtectedGroup(group.id)}
                                    onCheckedChange={(checked) =>
                                      handleGroupEnabledChange(group.id, checked)
                                    }
                                  />
                                </div>
                                {/* 表示の有効/無効 */}
                                <div className="flex items-center gap-2">
                                  {group.visible ? (
                                    <Eye className="h-4 w-4 text-primary" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Switch
                                    checked={group.visible}
                                    disabled={isProtectedGroup(group.id) || !group.enabled}
                                    onCheckedChange={(checked) =>
                                      handleGroupVisibilityChange(group.id, checked)
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <CollapsibleContent>
                              <Separator />
                              <div className="p-4 space-y-2 bg-muted/30">
                                {sortedItems.map((item, itemIndex) => (
                                  <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-3 bg-background rounded-md border transition-all ${
                                      !item.enabled ? 'opacity-40' : !item.visible ? 'opacity-60' : ''
                                    } ${
                                      draggingItemId === item.id ? 'opacity-50 border-dashed' : ''
                                    } ${
                                      dropTargetItemId === item.id ? 'border-2 border-primary bg-primary/5' : ''
                                    }`}
                                    draggable
                                    onDragStart={(e) => handleItemDragStart(e, group.id, item.id)}
                                    onDragOver={(e) => handleItemDragOver(e, group.id, item.id)}
                                    onDragEnd={handleItemDragEnd}
                                    onDrop={(e) => handleItemDrop(e, group.id, item.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                      <span className="text-sm">{item.title}</span>
                                      {isProtectedItem(item.id) && (
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {/* 機能の有効/無効 */}
                                      <div className="flex items-center gap-1">
                                        <Power className={`h-3 w-3 ${item.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <Switch
                                          checked={item.enabled}
                                          disabled={isProtectedItem(item.id)}
                                          onCheckedChange={(checked) =>
                                            handleItemEnabledChange(group.id, item.id, checked)
                                          }
                                        />
                                      </div>
                                      {/* 表示の有効/無効 */}
                                      <div className="flex items-center gap-1">
                                        {item.visible ? (
                                          <Eye className="h-3 w-3 text-primary" />
                                        ) : (
                                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <Switch
                                          checked={item.visible}
                                          disabled={isProtectedItem(item.id) || !item.enabled}
                                          onCheckedChange={(checked) =>
                                            handleItemVisibilityChange(group.id, item.id, checked)
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* EMR HPKI Bridge Download Section - shown when EMR group is visible */}
            {settings.menuGroups.find(g => g.id === 'emr')?.visible && (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-600" />
                    <CardTitle>電子カルテ用アプリ</CardTitle>
                  </div>
                  <CardDescription>
                    HPKI電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HpkiBridgeDownload showTitle={false} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>モバイルフッターナビゲーション</CardTitle>
                <CardDescription>
                  モバイル画面下部に表示するメニューを選択（最大3つ + チャット + メニュー）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant={visibleMobileCount > 3 ? "destructive" : "secondary"}>
                    選択中: {visibleMobileCount}/3
                  </Badge>
                  {visibleMobileCount > 3 && (
                    <p className="text-sm text-destructive mt-2">
                      ※ 最大3つまで表示されます。4つ以上選択した場合、上位3つのみ表示されます。
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  {availableMobileNavItems.map((navItem) => {
                    const existingItem = settings.mobileNavItems.find(i => i.id === navItem.id);
                    const isVisible = existingItem?.visible ?? false;
                    const visibleItems = sortedMobileNav.filter(i => i.visible);
                    const visibleIndex = visibleItems.findIndex(i => i.id === navItem.id);

                    return (
                      <div 
                        key={navItem.id}
                        className={`flex items-center justify-between py-3 px-4 rounded-lg border ${isVisible ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isVisible}
                            onCheckedChange={(checked) => handleMobileNavToggle(navItem.id, checked)}
                          />
                          <span className={isVisible ? "font-medium" : "text-muted-foreground"}>
                            {navItem.label}
                          </span>
                          {isVisible && visibleIndex >= 0 && visibleIndex < 3 && (
                            <Badge variant="outline">{visibleIndex + 1}番目</Badge>
                          )}
                          {isVisible && visibleIndex >= 3 && (
                            <Badge variant="secondary">非表示（4番目以降）</Badge>
                          )}
                        </div>
                        {isVisible && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMobileNavMove(navItem.id, 'up')}
                              disabled={visibleIndex === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMobileNavMove(navItem.id, 'down')}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>業界別テンプレート</CardTitle>
                <CardDescription>
                  業界に最適化されたメニュー構成を一括で適用できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {industryTemplates.map((template) => {
                    const Icon = templateIconMap[template.icon] || Briefcase;
                    const isActive = settings.currentTemplateId === template.id;

                    return (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handleApplyTemplate(template.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                            </div>
                            {isActive && (
                              <Badge variant="default">
                                <Check className="h-3 w-3 mr-1" />
                                適用中
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.menuGroups.slice(0, 4).map((group) => (
                              <Badge key={group.id} variant="outline" className="text-xs">
                                {group.label}
                              </Badge>
                            ))}
                            {template.menuGroups.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.menuGroups.length - 4}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      ページ一覧
                    </CardTitle>
                    <CardDescription>
                      全 {allPages.length} ページ • クリックでページに移動
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ページを検索..."
                      value={pageSearchQuery}
                      onChange={(e) => setPageSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-6 pr-4">
                    {categoryOrder.map((category) => {
                      const pagesInCategory = allPages.filter(p => p.category === category);
                      const filteredPages = pagesInCategory.filter(page =>
                        pageSearchQuery === '' ||
                        page.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
                        page.description.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
                        page.url.toLowerCase().includes(pageSearchQuery.toLowerCase())
                      );

                      if (filteredPages.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            {category}
                            <Badge variant="secondary" className="text-xs">{filteredPages.length}</Badge>
                          </h3>
                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPages.map((page) => {
                              const Icon = page.icon;
                              return (
                                <Link
                                  key={page.url}
                                  to={page.url}
                                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <Icon className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{page.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{page.description}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Stats */}
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
                  <CardTitle className="text-2xl">{allPages.filter(p => p.category === '会計').length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>人事ページ</CardDescription>
                  <CardTitle className="text-2xl">{allPages.filter(p => p.category === '人事・労務').length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Developer Link */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">開発者向けページ一覧</p>
                      <p className="text-xs text-muted-foreground">URL一覧など詳細な開発者情報</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dev/pages">開発者ページへ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ヒント */}
        <Card className="bg-accent/50 border-accent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent rounded-full">
                <Settings className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-medium">
                  メニューカスタマイズのヒント
                </h3>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>・よく使うメニューを上に移動すると便利です</li>
                  <li>・使わない機能は非表示にしてスッキリ</li>
                  <li>・業界テンプレートで最適なメニュー構成を素早く適用</li>
                  <li>・設定は自動保存され、次回ログイン時も維持されます</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
