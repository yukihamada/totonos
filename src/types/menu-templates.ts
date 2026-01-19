import { MenuGroupConfig } from '@/hooks/useSettings';

export interface MobileNavItemConfig {
  id: string;
  visible: boolean;
  order: number;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  menuGroups: MenuGroupConfig[];
  mobileNavItems: MobileNavItemConfig[];
}

// Available mobile nav items with metadata
export const availableMobileNavItems = [
  { id: 'dashboard', label: 'ホーム', icon: 'Home' },
  { id: 'invoices', label: '請求書', icon: 'FileText' },
  { id: 'leads', label: 'リード', icon: 'UserPlus' },
  { id: 'deals', label: '商談', icon: 'Target' },
  { id: 'clients', label: '取引先', icon: 'Users' },
  { id: 'estimates', label: '見積書', icon: 'ClipboardList' },
  { id: 'contracts', label: '契約書', icon: 'FileSignature' },
  { id: 'expenses', label: '経費', icon: 'Wallet' },
  { id: 'employees', label: '従業員', icon: 'Users' },
  { id: 'projects', label: 'プロジェクト', icon: 'FolderKanban' },
  { id: 'wiki', label: 'Wiki', icon: 'Book' },
  { id: 'accounting', label: '会計', icon: 'Calculator' },
  { id: 'products', label: '商品', icon: 'Package' },
  { id: 'attendance', label: '勤怠', icon: 'Clock' },
  { id: 'reports', label: 'レポート', icon: 'BarChart3' },
  { id: 'notifications', label: '通知', icon: 'Bell' },
  { id: 'profile', label: 'プロフィール', icon: 'UserCircle' },
  { id: 'settings', label: '設定', icon: 'Settings' },
] as const;

export const defaultMobileNavItems: MobileNavItemConfig[] = [
  { id: 'dashboard', visible: true, order: 0 },
  { id: 'invoices', visible: true, order: 1 },
  { id: 'leads', visible: true, order: 2 },
];

// Industry templates
export const industryTemplates: IndustryTemplate[] = [
  {
    id: 'consulting',
    name: 'コンサルティング',
    description: '営業・CRM、見積書、契約書管理に特化',
    icon: 'Briefcase',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'leads', visible: true, order: 1 },
      { id: 'contracts', visible: true, order: 2 },
    ],
    menuGroups: [
      {
        id: 'main',
        label: 'メイン',
        visible: true,
        order: 0,
        items: [
          { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
        ],
      },
      {
        id: 'crm',
        label: '営業・CRM',
        visible: true,
        order: 1,
        items: [
          { id: 'leads', title: 'リード', visible: true, order: 0 },
          { id: 'deals', title: '商談', visible: true, order: 1 },
          { id: 'pipeline', title: 'パイプライン', visible: true, order: 2 },
          { id: 'activities', title: '活動履歴', visible: true, order: 3 },
          { id: 'clients', title: '取引先', visible: true, order: 4 },
        ],
      },
      {
        id: 'documents',
        label: 'ドキュメント',
        visible: true,
        order: 2,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'project-management',
        label: 'プロジェクト',
        visible: true,
        order: 3,
        items: [
          { id: 'projects', title: 'プロジェクト', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 4,
        items: [
          { id: 'reports', title: 'レポート', visible: true, order: 0 },
          { id: 'settings', title: '設定', visible: true, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'retail',
    name: '小売・EC',
    description: '商品管理、請求書、在庫に特化',
    icon: 'ShoppingCart',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'products', visible: true, order: 1 },
      { id: 'invoices', visible: true, order: 2 },
    ],
    menuGroups: [
      {
        id: 'main',
        label: 'メイン',
        visible: true,
        order: 0,
        items: [
          { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
        ],
      },
      {
        id: 'inventory',
        label: '在庫・商品',
        visible: true,
        order: 1,
        items: [
          { id: 'products', title: '商品管理', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注書', visible: true, order: 1 },
          { id: 'auto-reorder', title: '自動発注', visible: true, order: 2 },
        ],
      },
      {
        id: 'sales',
        label: '販売',
        visible: true,
        order: 2,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'clients', title: '取引先', visible: true, order: 1 },
          { id: 'payment-links', title: '決済リンク', visible: true, order: 2 },
        ],
      },
      {
        id: 'accounting',
        label: '会計',
        visible: true,
        order: 3,
        items: [
          { id: 'accounting', title: '会計ダッシュボード', visible: true, order: 0 },
          { id: 'expenses', title: '経費管理', visible: true, order: 1 },
          { id: 'receipt-capture', title: 'レシートOCR', visible: true, order: 2 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 4,
        items: [
          { id: 'reports', title: 'レポート', visible: true, order: 0 },
          { id: 'settings', title: '設定', visible: true, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'service',
    name: 'サービス業',
    description: '予約・顧客管理、スタッフ勤怠に特化',
    icon: 'Users',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'attendance', visible: true, order: 2 },
    ],
    menuGroups: [
      {
        id: 'main',
        label: 'メイン',
        visible: true,
        order: 0,
        items: [
          { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
        ],
      },
      {
        id: 'crm',
        label: '顧客管理',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '顧客', visible: true, order: 0 },
          { id: 'activities', title: '活動履歴', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: '人事・労務',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠管理', visible: true, order: 1 },
          { id: 'shifts', title: 'シフト管理', visible: true, order: 2 },
          { id: 'payroll', title: '給与計算', visible: true, order: 3 },
        ],
      },
      {
        id: 'documents',
        label: '請求・経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'expenses', title: '経費管理', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 4,
        items: [
          { id: 'reports', title: 'レポート', visible: true, order: 0 },
          { id: 'settings', title: '設定', visible: true, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'manufacturing',
    name: '製造業',
    description: '発注・在庫・工程管理に特化',
    icon: 'Factory',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'products', visible: true, order: 1 },
      { id: 'projects', visible: true, order: 2 },
    ],
    menuGroups: [
      {
        id: 'main',
        label: 'メイン',
        visible: true,
        order: 0,
        items: [
          { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
        ],
      },
      {
        id: 'inventory',
        label: '在庫・資材',
        visible: true,
        order: 1,
        items: [
          { id: 'products', title: '商品・資材', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注書', visible: true, order: 1 },
          { id: 'auto-reorder', title: '自動発注', visible: true, order: 2 },
        ],
      },
      {
        id: 'project-management',
        label: '工程管理',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: 'プロジェクト', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'sales',
        label: '営業・取引',
        visible: true,
        order: 3,
        items: [
          { id: 'clients', title: '取引先', visible: true, order: 0 },
          { id: 'estimates', title: '見積書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: '人事・労務',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠管理', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 5,
        items: [
          { id: 'reports', title: 'レポート', visible: true, order: 0 },
          { id: 'settings', title: '設定', visible: true, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'it',
    name: 'IT・ソフトウェア',
    description: 'プロジェクト管理、採用、契約に特化',
    icon: 'Code',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'projects', visible: true, order: 1 },
      { id: 'contracts', visible: true, order: 2 },
    ],
    menuGroups: [
      {
        id: 'main',
        label: 'メイン',
        visible: true,
        order: 0,
        items: [
          { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
        ],
      },
      {
        id: 'project-management',
        label: 'プロジェクト',
        visible: true,
        order: 1,
        items: [
          { id: 'projects', title: 'プロジェクト', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'crm',
        label: '営業・CRM',
        visible: true,
        order: 2,
        items: [
          { id: 'leads', title: 'リード', visible: true, order: 0 },
          { id: 'deals', title: '商談', visible: true, order: 1 },
          { id: 'clients', title: '取引先', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: 'ドキュメント',
        visible: true,
        order: 3,
        items: [
          { id: 'contracts', title: '契約書', visible: true, order: 0 },
          { id: 'estimates', title: '見積書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'recruiting',
        label: '採用',
        visible: true,
        order: 4,
        items: [
          { id: 'recruiting', title: '採用ダッシュボード', visible: true, order: 0 },
          { id: 'job-postings', title: '求人管理', visible: true, order: 1 },
          { id: 'candidates', title: '候補者管理', visible: true, order: 2 },
        ],
      },
      {
        id: 'info',
        label: '情報管理',
        visible: true,
        order: 5,
        items: [
          { id: 'wiki', title: '社内Wiki', visible: true, order: 0 },
          { id: 'it-assets', title: 'IT資産', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 6,
        items: [
          { id: 'reports', title: 'レポート', visible: true, order: 0 },
          { id: 'settings', title: '設定', visible: true, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'accounting-firm',
    name: '会計事務所',
    description: '会計・税務・顧問先管理に特化',
    icon: 'Calculator',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'accounting', visible: true, order: 2 },
    ],
    menuGroups: [
      {
        id: 'main',
        label: 'メイン',
        visible: true,
        order: 0,
        items: [
          { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
        ],
      },
      {
        id: 'clients',
        label: '顧問先',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '顧問先一覧', visible: true, order: 0 },
          { id: 'contracts', title: '顧問契約', visible: true, order: 1 },
        ],
      },
      {
        id: 'accounting',
        label: '会計業務',
        visible: true,
        order: 2,
        items: [
          { id: 'accounting', title: '会計ダッシュボード', visible: true, order: 0 },
          { id: 'journal', title: '仕訳帳', visible: true, order: 1 },
          { id: 'statements', title: '財務諸表', visible: true, order: 2 },
          { id: 'e-bookkeeping', title: '電子帳簿保存', visible: true, order: 3 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'estimates', title: '見積書', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 4,
        items: [
          { id: 'reports', title: 'レポート', visible: true, order: 0 },
          { id: 'settings', title: '設定', visible: true, order: 1 },
        ],
      },
    ],
  },
];
