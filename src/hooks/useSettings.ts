import { useState, useEffect, useCallback } from 'react';
import { MobileNavItemConfig, defaultMobileNavItems, industryTemplates, dbTemplateKeyToMenuTemplateId } from '@/types/menu-templates';
import { UIStyleType, BorderRadiusType, borderRadiusMap } from '@/types/design-templates';

export interface MenuItemConfig {
  id: string;
  title: string;
  visible: boolean;  // メニューに表示するかどうか
  enabled: boolean;  // 機能を有効にするか（エージェントから使えるか）
  order: number;
}

export interface MenuGroupConfig {
  id: string;
  label: string;
  visible: boolean;  // グループをメニューに表示するかどうか
  enabled: boolean;  // グループの機能を有効にするか
  order: number;
  items: MenuItemConfig[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  compactMode: boolean;
  uiStyle: UIStyleType;
  borderRadius: BorderRadiusType;
  menuGroups: MenuGroupConfig[];
  mobileNavItems: MobileNavItemConfig[];
  currentTemplateId?: string;
  currentDesignTemplateId?: string;
}

// Protected menu items that should never be hidden or disabled
// システム管理系のアイテムはオフにできないようにする
export const PROTECTED_ITEM_IDS = [
  'settings', 
  'settings-menu', 
  'company-settings', 
  'team',
  'dashboard',
];
export const PROTECTED_GROUP_IDS = ['system', 'main'];

const defaultMenuGroups: MenuGroupConfig[] = [
  {
    id: 'main',
    label: 'メイン',
    visible: true,
    enabled: true,
    order: 0,
    items: [
      { id: 'dashboard', title: 'ダッシュボード', visible: true, enabled: true, order: 0 },
      { id: 'getting-started', title: '初めての方へ', visible: true, enabled: true, order: 1 },
      { id: 'notifications', title: '通知センター', visible: true, enabled: true, order: 2 },
      { id: 'profile', title: 'プロフィール', visible: true, enabled: true, order: 3 },
    ],
  },
  {
    id: 'crm',
    label: '営業・CRM',
    visible: true,
    enabled: true,
    order: 1,
    items: [
      { id: 'leads', title: 'リード', visible: true, enabled: true, order: 0 },
      { id: 'lead-scoring', title: 'AIスコアリング', visible: true, enabled: true, order: 1 },
      { id: 'deals', title: '商談', visible: true, enabled: true, order: 2 },
      { id: 'pipeline', title: 'パイプライン', visible: true, enabled: true, order: 3 },
      { id: 'activities', title: '活動履歴', visible: true, enabled: true, order: 4 },
      { id: 'clients', title: '取引先', visible: true, enabled: true, order: 5 },
      { id: 'sales-forecast', title: 'AI売上予測', visible: true, enabled: true, order: 6 },
    ],
  },
  {
    id: 'documents',
    label: 'ドキュメント',
    visible: true,
    enabled: true,
    order: 2,
    items: [
      { id: 'invoices', title: '請求書', visible: true, enabled: true, order: 0 },
      { id: 'estimates', title: '見積書', visible: true, enabled: true, order: 1 },
      { id: 'purchase-orders', title: '発注書', visible: true, enabled: true, order: 2 },
      { id: 'contracts', title: '契約書', visible: true, enabled: true, order: 3 },
      { id: 'contract-alerts', title: '契約期限アラート', visible: true, enabled: true, order: 4 },
    ],
  },
  {
    id: 'finance',
    label: 'ファイナンス',
    visible: true,
    enabled: true,
    order: 3,
    items: [
      { id: 'reconciliation', title: '自動消込', visible: true, enabled: true, order: 0 },
      { id: 'bank-connections', title: '銀行連携', visible: true, enabled: true, order: 1 },
      { id: 'boost', title: 'Dynamic Boost', visible: true, enabled: true, order: 2 },
      { id: 'trust-passport', title: 'Trust Passport', visible: true, enabled: true, order: 3 },
      { id: 'payment-links', title: '決済リンク', visible: true, enabled: true, order: 4 },
    ],
  },
  {
    id: 'accounting',
    label: '会計',
    visible: true,
    enabled: true,
    order: 4,
    items: [
      { id: 'accounting', title: '会計ダッシュボード', visible: true, enabled: true, order: 0 },
      { id: 'journal', title: '仕訳帳', visible: true, enabled: true, order: 1 },
      { id: 'ledger', title: '総勘定元帳', visible: true, enabled: true, order: 2 },
      { id: 'statements', title: '財務諸表', visible: true, enabled: true, order: 3 },
      { id: 'budget', title: '予算管理', visible: true, enabled: true, order: 4 },
      { id: 'receivables', title: '売掛金年齢表', visible: true, enabled: true, order: 5 },
      { id: 'payables', title: '買掛金管理', visible: true, enabled: true, order: 6 },
      { id: 'assets', title: '固定資産', visible: true, enabled: true, order: 7 },
      { id: 'expenses', title: '経費管理', visible: true, enabled: true, order: 8 },
      { id: 'receipt-capture', title: 'レシートOCR', visible: true, enabled: true, order: 9 },
      { id: 'tax', title: '消費税管理', visible: true, enabled: true, order: 10 },
      { id: 'period-close', title: '期末締め', visible: true, enabled: true, order: 11 },
    ],
  },
  {
    id: 'expense-reimbursement',
    label: '経費精算',
    visible: true,
    enabled: true,
    order: 5,
    items: [
      { id: 'expense-list', title: '経費一覧', visible: true, enabled: true, order: 0 },
      { id: 'advance-payment', title: '仮払い', visible: true, enabled: true, order: 1 },
      { id: 'expense-settings', title: '経費設定', visible: true, enabled: true, order: 2 },
    ],
  },
  {
    id: 'project-management',
    label: 'プロジェクト管理',
    visible: true,
    enabled: true,
    order: 6,
    items: [
      { id: 'projects', title: 'プロジェクト', visible: true, enabled: true, order: 0 },
      { id: 'gantt', title: 'ガントチャート', visible: true, enabled: true, order: 1 },
      { id: 'kanban', title: 'カンバン', visible: true, enabled: true, order: 2 },
      { id: 'timelog', title: '工数記録', visible: true, enabled: true, order: 3 },
    ],
  },
  {
    id: 'recruiting',
    label: '採用管理',
    visible: true,
    enabled: true,
    order: 7,
    items: [
      { id: 'recruiting', title: '採用ダッシュボード', visible: true, enabled: true, order: 0 },
      { id: 'job-postings', title: '求人管理', visible: true, enabled: true, order: 1 },
      { id: 'candidates', title: '候補者管理', visible: true, enabled: true, order: 2 },
      { id: 'interviews', title: '面接スケジュール', visible: true, enabled: true, order: 3 },
      { id: 'recruiting-reports', title: '採用レポート', visible: true, enabled: true, order: 4 },
    ],
  },
  {
    id: 'hr',
    label: '人事・労務',
    visible: true,
    enabled: true,
    order: 8,
    items: [
      { id: 'employees', title: '従業員', visible: true, enabled: true, order: 0 },
      { id: 'attendance', title: '勤怠管理', visible: true, enabled: true, order: 1 },
      { id: 'shifts', title: 'シフト管理', visible: true, enabled: true, order: 2 },
      { id: 'leave-requests', title: '休暇管理', visible: true, enabled: true, order: 3 },
      { id: 'payroll', title: '給与計算', visible: true, enabled: true, order: 4 },
      { id: 'payslips', title: 'Web給与明細', visible: true, enabled: true, order: 5 },
      { id: 'year-end', title: '年末調整', visible: true, enabled: true, order: 6 },
      { id: 'my-number', title: 'マイナンバー', visible: true, enabled: true, order: 7 },
      { id: 'social-insurance', title: '社会保険電子申請', visible: true, enabled: true, order: 8 },
      { id: 'employee-portal', title: '従業員ポータル', visible: true, enabled: true, order: 9 },
    ],
  },
  {
    id: 'info',
    label: '情報管理',
    visible: true,
    enabled: true,
    order: 9,
    items: [
      { id: 'wiki', title: '社内Wiki', visible: true, enabled: true, order: 0 },
      { id: 'wiki-hierarchy', title: 'Wiki（階層）', visible: true, enabled: true, order: 1 },
      { id: 'database-views', title: 'データベース', visible: true, enabled: true, order: 2 },
      { id: 'it-assets', title: 'IT資産', visible: true, enabled: true, order: 3 },
      { id: 'products', title: '商品管理', visible: true, enabled: true, order: 4 },
      { id: 'delivery-notes', title: '納品書', visible: true, enabled: true, order: 5 },
      { id: 'auto-reorder', title: '自動発注', visible: true, enabled: true, order: 6 },
    ],
  },
  {
    id: 'integrations',
    label: '連携',
    visible: true,
    enabled: true,
    order: 10,
    items: [
      { id: 'integrations', title: '連携一覧', visible: true, enabled: true, order: 0 },
      { id: 'email-integration', title: 'メール連携', visible: true, enabled: true, order: 1 },
      { id: 'inbound-emails', title: 'メール受信', visible: true, enabled: true, order: 2 },
      { id: 'email-templates', title: 'メールテンプレート', visible: true, enabled: true, order: 3 },
      { id: 'line-settings', title: 'LINE連携', visible: true, enabled: true, order: 4 },
      { id: 'slack-integration', title: 'Slack連携', visible: true, enabled: true, order: 5 },
      { id: 'sso-settings', title: 'SSO設定', visible: true, enabled: true, order: 6 },
    ],
  },
  {
    id: 'system',
    label: 'システム管理',
    visible: true,
    enabled: true,
    order: 11,
    items: [
      { id: 'settings', title: '設定', visible: true, enabled: true, order: 0 },
      { id: 'company-settings', title: '会社設定', visible: true, enabled: true, order: 1 },
      { id: 'team', title: 'チーム', visible: true, enabled: true, order: 2 },
      { id: 'workflows', title: 'ワークフロー', visible: true, enabled: true, order: 3 },
      { id: 'approval-workflow', title: '承認ワークフロー', visible: true, enabled: true, order: 4 },
      { id: 'audit-log', title: '監査ログ', visible: true, enabled: true, order: 5 },
      { id: 'ai-settings', title: 'AI設定', visible: true, enabled: true, order: 6 },
      { id: 'data-import', title: 'データ取込', visible: true, enabled: true, order: 7 },
      { id: 'backup', title: 'バックアップ設定', visible: true, enabled: true, order: 8 },
      { id: 'settings-menu', title: 'メニュー設定', visible: true, enabled: true, order: 9 },
      { id: 'developer', title: '開発者設定', visible: true, enabled: true, order: 10 },
      { id: 'api-docs', title: 'APIドキュメント', visible: true, enabled: true, order: 11 },
      { id: 'mcp-settings', title: 'MCP設定', visible: true, enabled: true, order: 12 },
    ],
  },
  {
    id: 'billing',
    label: '課金・クレジット',
    visible: true,
    enabled: true,
    order: 12,
    items: [
      { id: 'credits', title: 'クレジット', visible: true, enabled: true, order: 0 },
      { id: 'credit-logs', title: '利用履歴', visible: true, enabled: true, order: 1 },
      { id: 'pricing', title: '料金プラン', visible: true, enabled: true, order: 2 },
    ],
  },
  {
    id: 'other',
    label: 'その他',
    visible: true,
    enabled: true,
    order: 13,
    items: [
      { id: 'reports', title: 'レポート', visible: true, enabled: true, order: 0 },
      { id: 'referrals', title: '紹介プログラム', visible: true, enabled: true, order: 1 },
      { id: 'usage', title: '使用状況', visible: true, enabled: true, order: 2 },
      { id: 'e-bookkeeping', title: '電子帳簿保存', visible: true, enabled: true, order: 3 },
      { id: 'pages', title: 'ページ一覧', visible: true, enabled: true, order: 4 },
    ],
  },
  // === 医療・ヘルスケア（専門機能、デフォルトOFF） ===
  {
    id: 'healthcare',
    label: '医療・ヘルスケア',
    visible: false,
    enabled: false, // 専門機能のためデフォルトOFF
    order: 14,
    items: [
      { id: 'emr-dashboard', title: '電子カルテ', visible: false, enabled: false, order: 0 },
      { id: 'emr-reception', title: '受付', visible: false, enabled: false, order: 1 },
      { id: 'emr-patients', title: '患者管理', visible: false, enabled: false, order: 2 },
      { id: 'emr-records', title: 'カルテ', visible: false, enabled: false, order: 3 },
      { id: 'emr-sales', title: '売上レポート', visible: false, enabled: false, order: 4 },
      { id: 'emr-hpki', title: 'HPKI署名', visible: false, enabled: false, order: 5 },
      { id: 'web-inquiry', title: 'Web問診', visible: false, enabled: false, order: 6 },
      { id: 'medical-reservation', title: '予約管理', visible: false, enabled: false, order: 7 },
      { id: 'receipt-claim', title: 'レセプト', visible: false, enabled: false, order: 8 },
      { id: 'pharmacy', title: '処方箋・薬局', visible: false, enabled: false, order: 9 },
      { id: 'home-visit', title: '訪問診療', visible: false, enabled: false, order: 10 },
      { id: 'telemedicine', title: '遠隔診療', visible: false, enabled: false, order: 11 },
      { id: 'health-checkup', title: '健診・人間ドック', visible: false, enabled: false, order: 12 },
    ],
  },
  // === 会員管理（道場・フィットネス等） ===
  {
    id: 'membership',
    label: '会員管理',
    visible: false,
    enabled: false, // 専門機能のためデフォルトOFF
    order: 15,
    items: [
      { id: 'members-dashboard', title: '会員ダッシュボード', visible: false, enabled: false, order: 0 },
      { id: 'members-list', title: '会員一覧', visible: false, enabled: false, order: 1 },
      { id: 'membership-plans', title: 'プラン管理', visible: false, enabled: false, order: 2 },
      { id: 'class-schedules', title: 'スケジュール', visible: false, enabled: false, order: 3 },
      { id: 'class-bookings', title: '予約', visible: false, enabled: false, order: 4 },
      { id: 'member-checkins', title: 'チェックイン', visible: false, enabled: false, order: 5 },
      { id: 'member-purchases', title: '物販', visible: false, enabled: false, order: 6 },
    ],
  },
  // === サポート・CS ===
  {
    id: 'support-cs',
    label: 'サポート・CS',
    visible: false,
    enabled: true, // 一般的に使える機能（表示はOFF）
    order: 16,
    items: [
      { id: 'tickets', title: 'チケット管理', visible: false, enabled: true, order: 0 },
      { id: 'help-center', title: 'ヘルプセンター', visible: false, enabled: true, order: 1 },
      { id: 'chatbot', title: 'チャットボット', visible: false, enabled: true, order: 2 },
      { id: 'cti', title: 'CTI（電話連携）', visible: false, enabled: true, order: 3 },
      { id: 'customer-success', title: 'カスタマーサクセス', visible: false, enabled: true, order: 4 },
      { id: 'community', title: 'コミュニティ', visible: false, enabled: true, order: 5 },
    ],
  },
  // === マーケティング ===
  {
    id: 'marketing',
    label: 'マーケティング',
    visible: false,
    enabled: true, // 一般的に使える機能（表示はOFF）
    order: 17,
    items: [
      { id: 'email-marketing', title: 'メールマーケティング', visible: false, enabled: true, order: 0 },
      { id: 'campaigns', title: 'キャンペーン管理', visible: false, enabled: true, order: 1 },
      { id: 'lp-builder', title: 'LPビルダー', visible: false, enabled: true, order: 2 },
      { id: 'web-analytics', title: 'Web解析', visible: false, enabled: true, order: 3 },
      { id: 'ad-management', title: '広告管理', visible: false, enabled: true, order: 4 },
      { id: 'sns-management', title: 'SNS管理', visible: false, enabled: true, order: 5 },
    ],
  },
  // === 店舗・EC ===
  {
    id: 'retail-ec',
    label: '店舗・EC',
    visible: false,
    enabled: true, // 一般的に使える機能（表示はOFF）
    order: 18,
    items: [
      { id: 'cloud-pos', title: 'クラウドPOS', visible: false, enabled: true, order: 0 },
      { id: 'ec-site', title: 'ECサイト構築', visible: false, enabled: true, order: 1 },
      { id: 'omni-inventory', title: 'オムニチャネル在庫', visible: false, enabled: true, order: 2 },
      { id: 'store-shift', title: '店舗シフト', visible: false, enabled: true, order: 3 },
      { id: 'member-app', title: '会員アプリ', visible: false, enabled: true, order: 4 },
      { id: 'loyalty-points', title: 'ポイント管理', visible: false, enabled: true, order: 5 },
    ],
  },
  // === 教育・研修（LMS） ===
  {
    id: 'lms',
    label: '教育・研修（LMS）',
    visible: false,
    enabled: true, // 一般的に使える機能（表示はOFF）
    order: 19,
    items: [
      { id: 'courses', title: 'コース管理', visible: false, enabled: true, order: 0 },
      { id: 'tests', title: 'テスト・試験', visible: false, enabled: true, order: 1 },
      { id: 'study-history', title: '受講履歴', visible: false, enabled: true, order: 2 },
      { id: 'skill-map', title: 'スキルマップ', visible: false, enabled: true, order: 3 },
      { id: 'certifications', title: '資格管理', visible: false, enabled: true, order: 4 },
    ],
  },
  // === 法務・ガバナンス ===
  {
    id: 'legal-governance',
    label: '法務・ガバナンス',
    visible: false,
    enabled: true, // 一般的に使える機能（表示はOFF）
    order: 20,
    items: [
      { id: 'shareholder-meetings', title: '株主総会・取締役会', visible: false, enabled: true, order: 0 },
      { id: 'corporate-registry', title: '登記管理', visible: false, enabled: true, order: 1 },
      { id: 'whistleblowing', title: '内部通報窓口', visible: false, enabled: true, order: 2 },
      { id: 'antisocial-check', title: '反社チェック', visible: false, enabled: true, order: 3 },
      { id: 'ip-management', title: '知財管理', visible: false, enabled: true, order: 4 },
    ],
  },
  // === 民泊管理 ===
  {
    id: 'vacation-rental',
    label: '民泊管理',
    visible: false,
    enabled: false, // 専門機能のためデフォルトOFF
    order: 21,
    items: [
      { id: 'vacation-dashboard', title: '民泊ダッシュボード', visible: false, enabled: false, order: 0 },
      { id: 'vacation-properties', title: '物件管理', visible: false, enabled: false, order: 1 },
      { id: 'vacation-calendar', title: '予約カレンダー', visible: false, enabled: false, order: 2 },
      { id: 'vacation-bookings', title: '予約一覧', visible: false, enabled: false, order: 3 },
      { id: 'vacation-guests', title: 'ゲスト管理', visible: false, enabled: false, order: 4 },
      { id: 'vacation-cleaning', title: '清掃スケジュール', visible: false, enabled: false, order: 5 },
      { id: 'vacation-operating-days', title: '営業日数管理', visible: false, enabled: false, order: 6 },
    ],
  },
];

const defaultSettings: AppSettings = {
  theme: 'system',
  accentColor: 'default',
  fontSize: 'base',
  compactMode: false,
  uiStyle: 'default',
  borderRadius: 'md',
  menuGroups: defaultMenuGroups,
  mobileNavItems: defaultMobileNavItems,
};

const SETTINGS_KEY = 'app_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(`text-${settings.fontSize}`);
  }, [settings.fontSize]);

  // Apply UI style and border radius
  useEffect(() => {
    const root = document.documentElement;
    
    // Set UI style attribute
    root.setAttribute('data-ui-style', settings.uiStyle);
    
    // Set border radius CSS variable
    root.style.setProperty('--radius', borderRadiusMap[settings.borderRadius]);
  }, [settings.uiStyle, settings.borderRadius]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateMenuGroup = useCallback((groupId: string, updates: Partial<MenuGroupConfig>) => {
    // Protect system group from being hidden
    if (PROTECTED_GROUP_IDS.includes(groupId) && updates.visible === false) {
      return; // Prevent hiding protected groups
    }
    
    setSettings(prev => ({
      ...prev,
      menuGroups: prev.menuGroups.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    }));
  }, []);

  const updateMenuItem = useCallback((groupId: string, itemId: string, updates: Partial<MenuItemConfig>) => {
    // Protect settings menu from being hidden
    if (PROTECTED_ITEM_IDS.includes(itemId) && updates.visible === false) {
      return; // Prevent hiding protected items
    }
    
    setSettings(prev => ({
      ...prev,
      menuGroups: prev.menuGroups.map(group =>
        group.id === groupId
          ? {
              ...group,
              items: group.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : group
      ),
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const updateMobileNavItems = useCallback((items: MobileNavItemConfig[]) => {
    setSettings(prev => ({ ...prev, mobileNavItems: items }));
  }, []);

  const applyTemplate = useCallback((templateId: string) => {
    const template = industryTemplates.find(t => t.id === templateId);
    if (template) {
      // Build a set of visible item IDs from the template
      const templateItemIds = new Set<string>();
      const templateGroupIds = new Set<string>();

      template.menuGroups.forEach(group => {
        templateGroupIds.add(group.id);
        group.items.forEach(item => {
          if (item.visible) {
            templateItemIds.add(item.id);
          }
        });
      });

      // Merge with defaultMenuGroups: keep all items but set visibility/enabled based on template
      const mergedMenuGroups: MenuGroupConfig[] = defaultMenuGroups.map(group => {
        const templateGroup = template.menuGroups.find(tg => tg.id === group.id);
        
        // Protected groups stay visible and enabled
        const isProtectedGroup = PROTECTED_GROUP_IDS.includes(group.id);

        return {
          ...group,
          visible: isProtectedGroup || (templateGroup?.visible ?? false),
          enabled: isProtectedGroup || (templateGroup?.enabled ?? group.enabled),
          order: templateGroup?.order ?? group.order,
          items: group.items.map(item => {
            const templateItem = templateGroup?.items.find(ti => ti.id === item.id);
            // Protected items stay visible and enabled
            const isProtectedItem = PROTECTED_ITEM_IDS.includes(item.id);
            return {
              ...item,
              visible: isProtectedItem || (templateItem?.visible ?? false),
              enabled: isProtectedItem || (templateItem?.enabled ?? item.enabled),
              order: templateItem?.order ?? item.order,
            };
          }),
        };
      });

      // Also include any template groups that might not exist in defaults
      template.menuGroups.forEach(templateGroup => {
        if (!mergedMenuGroups.find(g => g.id === templateGroup.id)) {
          // Convert TemplateMenuGroupConfig to MenuGroupConfig with defaults
          const convertedGroup: MenuGroupConfig = {
            id: templateGroup.id,
            label: templateGroup.label,
            visible: templateGroup.visible,
            enabled: templateGroup.enabled ?? true,
            order: templateGroup.order,
            items: templateGroup.items.map(item => ({
              id: item.id,
              title: item.title,
              visible: item.visible,
              enabled: item.enabled ?? true,
              order: item.order,
            })),
          };
          mergedMenuGroups.push(convertedGroup);
        }
      });

      // Sort by order
      mergedMenuGroups.sort((a, b) => a.order - b.order);

      setSettings(prev => ({
        ...prev,
        menuGroups: mergedMenuGroups,
        mobileNavItems: template.mobileNavItems,
        currentTemplateId: templateId,
      }));
    }
  }, []);

  // Apply template using DB template_key (e.g., from industry LP)
  const applyTemplateByDbKey = useCallback((dbTemplateKey: string): boolean => {
    const menuTemplateId = dbTemplateKeyToMenuTemplateId[dbTemplateKey];
    if (menuTemplateId) {
      applyTemplate(menuTemplateId);
      return true;
    }
    return false;
  }, [applyTemplate]);

  // Check if an item is protected
  const isProtectedItem = useCallback((itemId: string): boolean => {
    return PROTECTED_ITEM_IDS.includes(itemId);
  }, []);

  // Check if a group is protected
  const isProtectedGroup = useCallback((groupId: string): boolean => {
    return PROTECTED_GROUP_IDS.includes(groupId);
  }, []);

  return {
    settings,
    updateSettings,
    updateMenuGroup,
    updateMenuItem,
    resetToDefaults,
    updateMobileNavItems,
    applyTemplate,
    applyTemplateByDbKey,
    isProtectedItem,
    isProtectedGroup,
  };
}
