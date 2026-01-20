// Template item config - enabled is optional (defaults to true when not specified)
export interface TemplateMenuItemConfig {
  id: string;
  title: string;
  visible: boolean;
  enabled?: boolean; // Optional in templates, defaults to true
  order: number;
}

// Template group config - enabled is optional (defaults to true when not specified)
export interface TemplateMenuGroupConfig {
  id: string;
  label: string;
  visible: boolean;
  enabled?: boolean; // Optional in templates, defaults to true
  order: number;
  items: TemplateMenuItemConfig[];
}

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
  menuGroups: TemplateMenuGroupConfig[];
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
  // === 専門サービス ===
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
  {
    id: 'law-firm',
    name: '法律事務所',
    description: '契約書・案件管理、顧問先対応に特化',
    icon: 'Scale',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'contracts', visible: true, order: 1 },
      { id: 'clients', visible: true, order: 2 },
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
        label: '顧問先・依頼者',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '依頼者管理', visible: true, order: 0 },
          { id: 'activities', title: '対応履歴', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: '契約・書類',
        visible: true,
        order: 2,
        items: [
          { id: 'contracts', title: '契約書', visible: true, order: 0 },
          { id: 'estimates', title: '見積書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'project-management',
        label: '案件管理',
        visible: true,
        order: 3,
        items: [
          { id: 'projects', title: '案件', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
          { id: 'wiki', title: '判例・資料', visible: true, order: 2 },
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
    id: 'design-agency',
    name: 'デザイン事務所',
    description: 'クリエイティブ案件・ポートフォリオ管理',
    icon: 'Palette',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'projects', visible: true, order: 1 },
      { id: 'clients', visible: true, order: 2 },
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
        label: 'クライアント',
        visible: true,
        order: 2,
        items: [
          { id: 'clients', title: 'クライアント', visible: true, order: 0 },
          { id: 'leads', title: '新規問い合わせ', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: 'ドキュメント',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 4,
        items: [
          { id: 'wiki', title: 'ナレッジ', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },

  // === 小売・流通 ===
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
    id: 'wholesale',
    name: '卸売業',
    description: '大口取引・発注・在庫管理に特化',
    icon: 'Warehouse',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'purchase-orders', visible: true, order: 1 },
      { id: 'products', visible: true, order: 2 },
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
        label: '営業・取引',
        visible: true,
        order: 2,
        items: [
          { id: 'clients', title: '取引先', visible: true, order: 0 },
          { id: 'leads', title: '新規開拓', visible: true, order: 1 },
          { id: 'estimates', title: '見積書', visible: true, order: 2 },
          { id: 'invoices', title: '請求書', visible: true, order: 3 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'accounting', title: '会計', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
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

  // === 飲食・サービス ===
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
    id: 'restaurant',
    name: '飲食店',
    description: 'シフト・仕入れ・スタッフ管理に特化',
    icon: 'Utensils',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'attendance', visible: true, order: 1 },
      { id: 'expenses', visible: true, order: 2 },
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
        id: 'hr',
        label: 'スタッフ管理',
        visible: true,
        order: 1,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'inventory',
        label: '仕入れ',
        visible: true,
        order: 2,
        items: [
          { id: 'purchase-orders', title: '発注書', visible: true, order: 0 },
          { id: 'products', title: '食材管理', visible: true, order: 1 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'receipt-capture', title: 'レシートOCR', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
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
    id: 'salon-beauty',
    name: '美容・サロン',
    description: '予約・顧客カルテ・スタッフ管理に特化',
    icon: 'Scissors',
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
          { id: 'clients', title: '顧客カルテ', visible: true, order: 0 },
          { id: 'activities', title: '施術履歴', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'inventory',
        label: '商材',
        visible: true,
        order: 3,
        items: [
          { id: 'products', title: '商材管理', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 4,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
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

  // === 建設・製造 ===
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
    id: 'construction',
    name: '建設業',
    description: '工事案件・下請管理・労務に特化',
    icon: 'HardHat',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'projects', visible: true, order: 1 },
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
        id: 'project-management',
        label: '工事管理',
        visible: true,
        order: 1,
        items: [
          { id: 'projects', title: '工事案件', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'crm',
        label: '取引先',
        visible: true,
        order: 2,
        items: [
          { id: 'clients', title: '元請・下請', visible: true, order: 0 },
          { id: 'leads', title: '新規案件', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
          { id: 'purchase-orders', title: '発注書', visible: true, order: 3 },
        ],
      },
      {
        id: 'hr',
        label: '労務',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: '作業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
          { id: 'payroll', title: '給与', visible: true, order: 2 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 5,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },

  // === IT・クリエイティブ ===
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
    id: 'web-agency',
    name: 'Web制作会社',
    description: 'Web案件・制作進行管理に特化',
    icon: 'Globe',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'projects', visible: true, order: 1 },
      { id: 'clients', visible: true, order: 2 },
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
        label: '制作管理',
        visible: true,
        order: 1,
        items: [
          { id: 'projects', title: '案件', visible: true, order: 0 },
          { id: 'timelog', title: '工数', visible: true, order: 1 },
        ],
      },
      {
        id: 'crm',
        label: 'クライアント',
        visible: true,
        order: 2,
        items: [
          { id: 'clients', title: 'クライアント', visible: true, order: 0 },
          { id: 'leads', title: '問い合わせ', visible: true, order: 1 },
          { id: 'deals', title: '商談', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: 'ドキュメント',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'info',
        label: 'ナレッジ',
        visible: true,
        order: 4,
        items: [
          { id: 'wiki', title: 'Wiki', visible: true, order: 0 },
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

  // === 医療・福祉 ===
  {
    id: 'clinic',
    name: 'クリニック・医院',
    description: '患者管理・スタッフ・経理に特化',
    icon: 'Stethoscope',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'employees', visible: true, order: 2 },
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
        label: '患者管理',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '患者', visible: true, order: 0 },
          { id: 'activities', title: '診療履歴', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '請求', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
          { id: 'accounting', title: '会計', visible: true, order: 2 },
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
    id: 'clinic-emr',
    name: 'クリニック（電子カルテ）',
    description: '電子カルテ・患者管理・HPKI署名に特化',
    icon: 'Stethoscope',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'emr-dashboard', visible: true, order: 1 },
      { id: 'emr-patients', visible: true, order: 2 },
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
        id: 'emr',
        label: '電子カルテ',
        visible: true,
        order: 1,
        items: [
          { id: 'emr-dashboard', title: '電子カルテ', visible: true, order: 0 },
          { id: 'emr-reception', title: '受付', visible: true, order: 1 },
          { id: 'emr-patients', title: '患者管理', visible: true, order: 2 },
          { id: 'emr-records', title: 'カルテ', visible: true, order: 3 },
          { id: 'emr-hpki', title: 'HPKI署名', visible: true, order: 4 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '請求', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
          { id: 'accounting', title: '会計', visible: true, order: 2 },
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
    id: 'care-facility',
    name: '介護施設',
    description: '利用者・スタッフシフト・労務管理に特化',
    icon: 'Heart',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'shifts', visible: true, order: 2 },
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
        label: '利用者',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '利用者', visible: true, order: 0 },
          { id: 'activities', title: 'ケア記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: '職員管理',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: '職員', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'leave-requests', title: '休暇申請', visible: true, order: 3 },
          { id: 'payroll', title: '給与', visible: true, order: 4 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '請求', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
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

  // === 教育・非営利 ===
  {
    id: 'school',
    name: '学習塾・スクール',
    description: '生徒・講師・授業管理に特化',
    icon: 'GraduationCap',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'employees', visible: true, order: 2 },
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
        label: '生徒管理',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '生徒', visible: true, order: 0 },
          { id: 'activities', title: '授業履歴', visible: true, order: 1 },
          { id: 'leads', title: '問い合わせ', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: '講師',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: '講師', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '月謝請求', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
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
    id: 'npo',
    name: 'NPO・社団法人',
    description: '会員管理・活動記録・助成金管理に特化',
    icon: 'HeartHandshake',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
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
        id: 'crm',
        label: '会員・支援者',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '会員', visible: true, order: 0 },
          { id: 'activities', title: '活動記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'project-management',
        label: '事業',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: '事業・プロジェクト', visible: true, order: 0 },
          { id: 'timelog', title: '活動時間', visible: true, order: 1 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'accounting', title: '会計', visible: true, order: 0 },
          { id: 'invoices', title: '請求・領収書', visible: true, order: 1 },
          { id: 'expenses', title: '経費', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
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

  // === 物流・その他 ===
  {
    id: 'logistics',
    name: '運送・物流',
    description: '配送管理・ドライバー勤怠に特化',
    icon: 'Truck',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'employees', visible: true, order: 1 },
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
        label: '取引先',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '取引先', visible: true, order: 0 },
          { id: 'contracts', title: '運送契約', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: 'ドライバー',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: 'ドライバー', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
          { id: 'payroll', title: '給与', visible: true, order: 2 },
        ],
      },
      {
        id: 'it-assets',
        label: '車両',
        visible: true,
        order: 3,
        items: [
          { id: 'it-assets', title: '車両管理', visible: true, order: 0 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 4,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
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
    id: 'real-estate',
    name: '不動産',
    description: '物件・顧客・契約管理に特化',
    icon: 'Building',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
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
        label: '顧客',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '顧客', visible: true, order: 0 },
          { id: 'leads', title: '問い合わせ', visible: true, order: 1 },
          { id: 'activities', title: '対応履歴', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: '契約・書類',
        visible: true,
        order: 2,
        items: [
          { id: 'contracts', title: '契約書', visible: true, order: 0 },
          { id: 'estimates', title: '見積書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'accounting', title: '会計', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: '人事',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
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
    id: 'startup',
    name: 'スタートアップ',
    description: '少人数チーム向け・全機能バランス型',
    icon: 'Rocket',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'deals', visible: true, order: 1 },
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
        id: 'crm',
        label: '営業',
        visible: true,
        order: 1,
        items: [
          { id: 'leads', title: 'リード', visible: true, order: 0 },
          { id: 'deals', title: '商談', visible: true, order: 1 },
          { id: 'pipeline', title: 'パイプライン', visible: true, order: 2 },
          { id: 'clients', title: '取引先', visible: true, order: 3 },
        ],
      },
      {
        id: 'project-management',
        label: 'プロダクト',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: 'プロジェクト', visible: true, order: 0 },
          { id: 'timelog', title: '工数', visible: true, order: 1 },
          { id: 'wiki', title: 'ドキュメント', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: 'ドキュメント',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'recruiting',
        label: '採用',
        visible: true,
        order: 4,
        items: [
          { id: 'recruiting', title: '採用', visible: true, order: 0 },
          { id: 'candidates', title: '候補者', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 5,
        items: [
          { id: 'employees', title: 'メンバー', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'freelance',
    name: 'フリーランス',
    description: '個人事業主向け・シンプル構成',
    icon: 'User',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'invoices', visible: true, order: 1 },
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
        id: 'work',
        label: '仕事',
        visible: true,
        order: 1,
        items: [
          { id: 'projects', title: '案件', visible: true, order: 0 },
          { id: 'timelog', title: '稼働時間', visible: true, order: 1 },
          { id: 'clients', title: 'クライアント', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 2,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'receipt-capture', title: 'レシートOCR', visible: true, order: 1 },
          { id: 'accounting', title: '確定申告', visible: true, order: 2 },
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

  // === 追加業種テンプレート ===

  // 小売・流通 追加
  {
    id: 'car-dealer',
    name: '自動車ディーラー',
    description: '車両販売・顧客管理・アフターサービスに特化',
    icon: 'Car',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'leads', visible: true, order: 1 },
      { id: 'estimates', visible: true, order: 2 },
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
          { id: 'leads', title: '来店見込', visible: true, order: 0 },
          { id: 'deals', title: '商談', visible: true, order: 1 },
          { id: 'pipeline', title: 'パイプライン', visible: true, order: 2 },
          { id: 'clients', title: '顧客', visible: true, order: 3 },
          { id: 'activities', title: '対応履歴', visible: true, order: 4 },
        ],
      },
      {
        id: 'inventory',
        label: '在庫・車両',
        visible: true,
        order: 2,
        items: [
          { id: 'products', title: '車両在庫', visible: true, order: 0 },
          { id: 'purchase-orders', title: '仕入', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
          { id: 'delivery-notes', title: '納品書', visible: true, order: 3 },
        ],
      },
      {
        id: 'hr',
        label: '人事',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
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
    id: 'pet-service',
    name: 'ペットサービス',
    description: 'ペットサロン・ペットホテル・トリミングに特化',
    icon: 'PawPrint',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'products', visible: true, order: 2 },
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
        label: '顧客・ペット',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '顧客・ペット情報', visible: true, order: 0 },
          { id: 'activities', title: '施術履歴', visible: true, order: 1 },
          { id: 'leads', title: '新規問合せ', visible: true, order: 2 },
        ],
      },
      {
        id: 'inventory',
        label: '商品・仕入',
        visible: true,
        order: 2,
        items: [
          { id: 'products', title: '商品管理', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 3,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 4,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
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

  // 飲食・サービス 追加
  {
    id: 'fitness',
    name: 'フィットネス・ジム',
    description: '会員管理・予約・スタッフ勤怠に特化',
    icon: 'Dumbbell',
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
        label: '会員管理',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '会員', visible: true, order: 0 },
          { id: 'activities', title: '利用履歴', visible: true, order: 1 },
          { id: 'leads', title: '見学・体験', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'contracts', title: '会員契約', visible: true, order: 0 },
          { id: 'invoices', title: '請求書', visible: true, order: 1 },
          { id: 'expenses', title: '経費', visible: true, order: 2 },
        ],
      },
      {
        id: 'inventory',
        label: '商品',
        visible: true,
        order: 4,
        items: [
          { id: 'products', title: '物販商品', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注', visible: true, order: 1 },
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
    id: 'hotel',
    name: 'ホテル・旅館',
    description: '予約・宿泊管理・スタッフ勤怠に特化',
    icon: 'Hotel',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'shifts', visible: true, order: 2 },
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
        label: '顧客・予約',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '顧客', visible: true, order: 0 },
          { id: 'activities', title: '宿泊履歴', visible: true, order: 1 },
          { id: 'leads', title: '問い合わせ', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '請求書', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
          { id: 'accounting', title: '会計', visible: true, order: 2 },
        ],
      },
      {
        id: 'inventory',
        label: '備品',
        visible: true,
        order: 4,
        items: [
          { id: 'products', title: '備品・消耗品', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注', visible: true, order: 1 },
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
    id: 'cleaning',
    name: '清掃サービス',
    description: '顧客管理・スケジュール・見積りに特化',
    icon: 'SprayCan',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'estimates', visible: true, order: 2 },
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
          { id: 'leads', title: '見込み客', visible: true, order: 1 },
          { id: 'activities', title: '作業履歴', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 2,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 3,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'payroll', title: '給与', visible: true, order: 3 },
        ],
      },
      {
        id: 'inventory',
        label: '備品',
        visible: true,
        order: 4,
        items: [
          { id: 'products', title: '清掃用品', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 5,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },

  // 専門サービス 追加
  {
    id: 'patent',
    name: '特許事務所',
    description: '案件管理・顧客対応・書類作成に特化',
    icon: 'ScrollText',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'projects', visible: true, order: 1 },
      { id: 'clients', visible: true, order: 2 },
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
        label: '顧客',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '依頼者', visible: true, order: 0 },
          { id: 'activities', title: '対応履歴', visible: true, order: 1 },
        ],
      },
      {
        id: 'project-management',
        label: '案件管理',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: '案件', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'info',
        label: 'ナレッジ',
        visible: true,
        order: 4,
        items: [
          { id: 'wiki', title: '判例・資料', visible: true, order: 0 },
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
    id: 'insurance',
    name: '保険代理店',
    description: '顧客管理・契約・更新管理に特化',
    icon: 'Shield',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
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
          { id: 'leads', title: '見込み客', visible: true, order: 0 },
          { id: 'deals', title: '商談', visible: true, order: 1 },
          { id: 'pipeline', title: 'パイプライン', visible: true, order: 2 },
          { id: 'clients', title: '顧客', visible: true, order: 3 },
          { id: 'activities', title: '対応履歴', visible: true, order: 4 },
        ],
      },
      {
        id: 'documents',
        label: '契約・書類',
        visible: true,
        order: 2,
        items: [
          { id: 'contracts', title: '保険契約', visible: true, order: 0 },
          { id: 'estimates', title: '見積書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: '人事',
        visible: true,
        order: 3,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 4,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },

  // 医療・福祉 追加
  {
    id: 'nursery',
    name: '保育園',
    description: '園児・保護者管理・職員勤怠に特化',
    icon: 'Baby',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'clients', visible: true, order: 1 },
      { id: 'shifts', visible: true, order: 2 },
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
        label: '園児・保護者',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '園児・保護者', visible: true, order: 0 },
          { id: 'activities', title: '保育記録', visible: true, order: 1 },
          { id: 'leads', title: '入園問合せ', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: '職員管理',
        visible: true,
        order: 2,
        items: [
          { id: 'employees', title: '職員', visible: true, order: 0 },
          { id: 'shifts', title: 'シフト', visible: true, order: 1 },
          { id: 'attendance', title: '勤怠', visible: true, order: 2 },
          { id: 'leave-requests', title: '休暇申請', visible: true, order: 3 },
          { id: 'payroll', title: '給与', visible: true, order: 4 },
        ],
      },
      {
        id: 'documents',
        label: '経理',
        visible: true,
        order: 3,
        items: [
          { id: 'invoices', title: '保育料請求', visible: true, order: 0 },
          { id: 'expenses', title: '経費', visible: true, order: 1 },
          { id: 'accounting', title: '会計', visible: true, order: 2 },
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

  // 建設・製造 追加
  {
    id: 'food-manufacturing',
    name: '食品製造',
    description: '製造管理・在庫・品質管理に特化',
    icon: 'UtensilsCrossed',
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
        label: '在庫・原材料',
        visible: true,
        order: 1,
        items: [
          { id: 'products', title: '製品・原材料', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注書', visible: true, order: 1 },
          { id: 'auto-reorder', title: '自動発注', visible: true, order: 2 },
        ],
      },
      {
        id: 'project-management',
        label: '製造管理',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: '製造計画', visible: true, order: 0 },
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
          { id: 'delivery-notes', title: '納品書', visible: true, order: 3 },
        ],
      },
      {
        id: 'hr',
        label: '人事・労務',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
          { id: 'payroll', title: '給与', visible: true, order: 2 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 5,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'printing',
    name: '印刷業',
    description: '受注管理・見積・納品管理に特化',
    icon: 'Printer',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'estimates', visible: true, order: 1 },
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
        id: 'crm',
        label: '顧客・営業',
        visible: true,
        order: 1,
        items: [
          { id: 'clients', title: '取引先', visible: true, order: 0 },
          { id: 'leads', title: '新規問合せ', visible: true, order: 1 },
          { id: 'deals', title: '商談', visible: true, order: 2 },
        ],
      },
      {
        id: 'project-management',
        label: '受注・製造',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: '受注案件', visible: true, order: 0 },
          { id: 'timelog', title: '工数', visible: true, order: 1 },
        ],
      },
      {
        id: 'documents',
        label: '書類',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'invoices', title: '請求書', visible: true, order: 1 },
          { id: 'delivery-notes', title: '納品書', visible: true, order: 2 },
        ],
      },
      {
        id: 'inventory',
        label: '在庫・資材',
        visible: true,
        order: 4,
        items: [
          { id: 'products', title: '資材・用紙', visible: true, order: 0 },
          { id: 'purchase-orders', title: '発注', visible: true, order: 1 },
        ],
      },
      {
        id: 'hr',
        label: '人事',
        visible: true,
        order: 5,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 6,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },

  // IT・クリエイティブ 追加
  {
    id: 'production',
    name: '映像制作',
    description: 'プロジェクト・工数・クライアント管理に特化',
    icon: 'Clapperboard',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'projects', visible: true, order: 1 },
      { id: 'clients', visible: true, order: 2 },
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
        label: '制作管理',
        visible: true,
        order: 1,
        items: [
          { id: 'projects', title: 'プロジェクト', visible: true, order: 0 },
          { id: 'timelog', title: '工数記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'crm',
        label: 'クライアント',
        visible: true,
        order: 2,
        items: [
          { id: 'clients', title: 'クライアント', visible: true, order: 0 },
          { id: 'leads', title: '問い合わせ', visible: true, order: 1 },
          { id: 'deals', title: '商談', visible: true, order: 2 },
        ],
      },
      {
        id: 'documents',
        label: 'ドキュメント',
        visible: true,
        order: 3,
        items: [
          { id: 'estimates', title: '見積書', visible: true, order: 0 },
          { id: 'contracts', title: '契約書', visible: true, order: 1 },
          { id: 'invoices', title: '請求書', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: 'スタッフ',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: 'スタッフ', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
          { id: 'payroll', title: '報酬', visible: true, order: 2 },
        ],
      },
      {
        id: 'info',
        label: 'ナレッジ',
        visible: true,
        order: 5,
        items: [
          { id: 'wiki', title: '制作資料', visible: true, order: 0 },
          { id: 'it-assets', title: '機材管理', visible: true, order: 1 },
        ],
      },
      {
        id: 'other',
        label: 'その他',
        visible: true,
        order: 6,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'reports', title: 'レポート', visible: true, order: 1 },
          { id: 'settings', title: '設定', visible: true, order: 2 },
        ],
      },
    ],
  },

  // 物流・農業 追加
  {
    id: 'agriculture',
    name: '農業',
    description: '生産管理・出荷・会計に特化',
    icon: 'Wheat',
    mobileNavItems: [
      { id: 'dashboard', visible: true, order: 0 },
      { id: 'products', visible: true, order: 1 },
      { id: 'clients', visible: true, order: 2 },
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
        label: '生産・在庫',
        visible: true,
        order: 1,
        items: [
          { id: 'products', title: '農産物・在庫', visible: true, order: 0 },
          { id: 'purchase-orders', title: '資材発注', visible: true, order: 1 },
        ],
      },
      {
        id: 'project-management',
        label: '生産管理',
        visible: true,
        order: 2,
        items: [
          { id: 'projects', title: '作付計画', visible: true, order: 0 },
          { id: 'timelog', title: '作業記録', visible: true, order: 1 },
        ],
      },
      {
        id: 'sales',
        label: '販売・出荷',
        visible: true,
        order: 3,
        items: [
          { id: 'clients', title: '出荷先', visible: true, order: 0 },
          { id: 'invoices', title: '請求書', visible: true, order: 1 },
          { id: 'delivery-notes', title: '納品書', visible: true, order: 2 },
        ],
      },
      {
        id: 'hr',
        label: '人員',
        visible: true,
        order: 4,
        items: [
          { id: 'employees', title: '従業員', visible: true, order: 0 },
          { id: 'attendance', title: '勤怠', visible: true, order: 1 },
        ],
      },
      {
        id: 'accounting',
        label: '経理',
        visible: true,
        order: 5,
        items: [
          { id: 'expenses', title: '経費', visible: true, order: 0 },
          { id: 'accounting', title: '会計', visible: true, order: 1 },
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
];

// DB template_key → menu template id mapping
export const dbTemplateKeyToMenuTemplateId: Record<string, string> = {
  // 小売・流通
  'retail': 'retail',
  'car-dealer': 'car-dealer',
  'pet-service': 'pet-service',
  // 飲食・サービス
  'restaurant': 'restaurant',
  'beauty-salon': 'salon-beauty',
  'fitness': 'fitness',
  'hotel': 'hotel',
  'cleaning': 'cleaning',
  // 専門サービス
  'consulting': 'consulting',
  'legal': 'law-firm',
  'tax-accountant': 'accounting-firm',
  'patent': 'patent',
  'real-estate': 'real-estate',
  'insurance': 'insurance',
  'design': 'design-agency',
  // 医療・福祉
  'healthcare': 'clinic',
  'clinic-emr': 'clinic-emr',
  'nursery': 'nursery',
  'welfare': 'care-facility',
  // 建設・製造
  'construction': 'construction',
  'manufacturing': 'manufacturing',
  'food-manufacturing': 'food-manufacturing',
  'printing': 'printing',
  // IT・クリエイティブ
  'it': 'it',
  'production': 'production',
  'accounting-firm': 'accounting-firm',
  // 物流・農業
  'logistics': 'logistics',
  'agriculture': 'agriculture',
  // 教育
  'education': 'school',
};
