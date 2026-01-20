import { useState, useEffect, useCallback } from 'react';
import { MobileNavItemConfig, defaultMobileNavItems, industryTemplates } from '@/types/menu-templates';

export interface MenuItemConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface MenuGroupConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  items: MenuItemConfig[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  compactMode: boolean;
  menuGroups: MenuGroupConfig[];
  mobileNavItems: MobileNavItemConfig[];
  currentTemplateId?: string;
}

const defaultMenuGroups: MenuGroupConfig[] = [
  {
    id: 'main',
    label: 'メイン',
    visible: true,
    order: 0,
    items: [
      { id: 'dashboard', title: 'ダッシュボード', visible: true, order: 0 },
      { id: 'getting-started', title: '初めての方へ', visible: true, order: 1 },
    ],
  },
  {
    id: 'crm',
    label: '営業・CRM',
    visible: true,
    order: 1,
    items: [
      { id: 'leads', title: 'リード', visible: true, order: 0 },
      { id: 'lead-scoring', title: 'AIスコアリング', visible: true, order: 1 },
      { id: 'deals', title: '商談', visible: true, order: 2 },
      { id: 'pipeline', title: 'パイプライン', visible: true, order: 3 },
      { id: 'activities', title: '活動履歴', visible: true, order: 4 },
      { id: 'clients', title: '取引先', visible: true, order: 5 },
      { id: 'email-integration', title: 'メール連携', visible: true, order: 6 },
      { id: 'sales-forecast', title: 'AI売上予測', visible: true, order: 7 },
    ],
  },
  {
    id: 'documents',
    label: 'ドキュメント',
    visible: true,
    order: 2,
    items: [
      { id: 'invoices', title: '請求書', visible: true, order: 0 },
      { id: 'estimates', title: '見積書', visible: true, order: 1 },
      { id: 'purchase-orders', title: '発注書', visible: true, order: 2 },
      { id: 'contracts', title: '契約書', visible: true, order: 3 },
      { id: 'contract-alerts', title: '契約期限アラート', visible: true, order: 4 },
      { id: 'e-bookkeeping', title: '電子帳簿保存', visible: true, order: 5 },
    ],
  },
  {
    id: 'finance',
    label: 'ファイナンス',
    visible: true,
    order: 3,
    items: [
      { id: 'reconciliation', title: '自動消込', visible: true, order: 0 },
      { id: 'bank-connections', title: '銀行連携', visible: true, order: 1 },
      { id: 'boost', title: 'Dynamic Boost', visible: true, order: 2 },
      { id: 'trust-passport', title: 'Trust Passport', visible: true, order: 3 },
      { id: 'payment-links', title: '決済リンク', visible: true, order: 4 },
    ],
  },
  {
    id: 'accounting',
    label: '会計',
    visible: true,
    order: 4,
    items: [
      { id: 'accounting', title: '会計ダッシュボード', visible: true, order: 0 },
      { id: 'journal', title: '仕訳帳', visible: true, order: 1 },
      { id: 'statements', title: '財務諸表', visible: true, order: 2 },
      { id: 'budget', title: '予算管理', visible: true, order: 3 },
      { id: 'receivables', title: '売掛金年齢表', visible: true, order: 4 },
      { id: 'assets', title: '固定資産', visible: true, order: 5 },
      { id: 'expenses', title: '経費管理', visible: true, order: 6 },
      { id: 'receipt-capture', title: 'レシートOCR', visible: true, order: 7 },
    ],
  },
  {
    id: 'expense-reimbursement',
    label: '経費精算',
    visible: true,
    order: 5,
    items: [
      { id: 'expense-list', title: '経費一覧', visible: true, order: 0 },
      { id: 'advance-payment', title: '仮払い', visible: true, order: 1 },
      { id: 'expense-settings', title: '経費設定', visible: true, order: 2 },
    ],
  },
  {
    id: 'project-management',
    label: 'プロジェクト管理',
    visible: true,
    order: 6,
    items: [
      { id: 'projects', title: 'プロジェクト', visible: true, order: 0 },
      { id: 'timelog', title: '工数記録', visible: true, order: 1 },
    ],
  },
  {
    id: 'recruiting',
    label: '採用管理',
    visible: true,
    order: 7,
    items: [
      { id: 'recruiting', title: '採用ダッシュボード', visible: true, order: 0 },
      { id: 'job-postings', title: '求人管理', visible: true, order: 1 },
      { id: 'candidates', title: '候補者管理', visible: true, order: 2 },
      { id: 'interviews', title: '面接スケジュール', visible: true, order: 3 },
      { id: 'recruiting-reports', title: '採用レポート', visible: true, order: 4 },
    ],
  },
  {
    id: 'hr',
    label: '人事・労務',
    visible: true,
    order: 8,
    items: [
      { id: 'employees', title: '従業員', visible: true, order: 0 },
      { id: 'attendance', title: '勤怠管理', visible: true, order: 1 },
      { id: 'shifts', title: 'シフト管理', visible: true, order: 2 },
      { id: 'leave-requests', title: '休暇管理', visible: true, order: 3 },
      { id: 'payroll', title: '給与計算', visible: true, order: 4 },
      { id: 'payslips', title: 'Web給与明細', visible: true, order: 5 },
      { id: 'year-end', title: '年末調整', visible: true, order: 6 },
      { id: 'my-number', title: 'マイナンバー', visible: true, order: 7 },
      { id: 'social-insurance', title: '社会保険電子申請', visible: true, order: 8 },
    ],
  },
  {
    id: 'info',
    label: '情報管理',
    visible: true,
    order: 9,
    items: [
      { id: 'wiki', title: '社内Wiki', visible: true, order: 0 },
      { id: 'wiki-hierarchy', title: 'Wiki（階層）', visible: true, order: 1 },
      { id: 'database-views', title: 'データベース', visible: true, order: 2 },
      { id: 'it-assets', title: 'IT資産', visible: true, order: 3 },
      { id: 'products', title: '商品管理', visible: true, order: 4 },
    ],
  },
  {
    id: 'system',
    label: 'システム管理',
    visible: true,
    order: 10,
    items: [
      { id: 'notifications', title: '通知', visible: true, order: 0 },
      { id: 'team', title: 'チーム', visible: true, order: 1 },
      { id: 'workflows', title: 'ワークフロー', visible: true, order: 2 },
      { id: 'approval-workflow', title: '承認ワークフロー', visible: true, order: 3 },
      { id: 'email-templates', title: 'メールテンプレート', visible: true, order: 4 },
      { id: 'audit-log', title: '監査ログ', visible: true, order: 5 },
      { id: 'sso-settings', title: 'SSO設定', visible: true, order: 6 },
      { id: 'ai-settings', title: 'AI設定', visible: true, order: 7 },
      { id: 'line-settings', title: 'LINE連携', visible: true, order: 8 },
      { id: 'data-import', title: 'データ取込', visible: true, order: 9 },
      { id: 'settings-menu', title: 'メニュー設定', visible: true, order: 10 },
      { id: 'developer', title: '開発者設定', visible: true, order: 11 },
      { id: 'api-docs', title: 'APIドキュメント', visible: true, order: 12 },
      { id: 'mcp-settings', title: 'MCP設定', visible: true, order: 13 },
    ],
  },
  {
    id: 'billing',
    label: '課金・クレジット',
    visible: true,
    order: 11,
    items: [
      { id: 'credits', title: 'クレジット', visible: true, order: 0 },
      { id: 'credit-logs', title: '利用履歴', visible: true, order: 1 },
      { id: 'pricing', title: '料金プラン', visible: true, order: 2 },
      { id: 'referrals', title: '友達招待', visible: true, order: 3 },
    ],
  },
  {
    id: 'other',
    label: 'その他',
    visible: true,
    order: 12,
    items: [
      { id: 'reports', title: 'レポート', visible: true, order: 0 },
      { id: 'profile', title: 'プロフィール', visible: true, order: 1 },
      { id: 'settings', title: '設定', visible: true, order: 2 },
      { id: 'pages', title: 'ページ一覧', visible: true, order: 3 },
    ],
  },
];

const defaultSettings: AppSettings = {
  theme: 'system',
  accentColor: 'default',
  fontSize: 'base',
  compactMode: false,
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

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateMenuGroup = useCallback((groupId: string, updates: Partial<MenuGroupConfig>) => {
    setSettings(prev => ({
      ...prev,
      menuGroups: prev.menuGroups.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    }));
  }, []);

  const updateMenuItem = useCallback((groupId: string, itemId: string, updates: Partial<MenuItemConfig>) => {
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

      // Merge with defaultMenuGroups: keep all items but set visibility based on template
      const mergedMenuGroups = defaultMenuGroups.map(group => {
        const templateGroup = template.menuGroups.find(tg => tg.id === group.id);
        
        return {
          ...group,
          visible: templateGroup?.visible ?? false,
          order: templateGroup?.order ?? group.order,
          items: group.items.map(item => {
            const templateItem = templateGroup?.items.find(ti => ti.id === item.id);
            return {
              ...item,
              visible: templateItem?.visible ?? false,
              order: templateItem?.order ?? item.order,
            };
          }),
        };
      });

      // Also include any template groups that might not exist in defaults
      template.menuGroups.forEach(templateGroup => {
        if (!mergedMenuGroups.find(g => g.id === templateGroup.id)) {
          mergedMenuGroups.push(templateGroup);
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

  return {
    settings,
    updateSettings,
    updateMenuGroup,
    updateMenuItem,
    resetToDefaults,
    updateMobileNavItems,
    applyTemplate,
  };
}
