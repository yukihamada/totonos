import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  ja: {
    translation: {
      // Common
      common: {
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        edit: '編集',
        create: '作成',
        add: '追加',
        search: '検索',
        filter: 'フィルター',
        loading: '読み込み中...',
        noData: 'データがありません',
        confirm: '確認',
        back: '戻る',
        next: '次へ',
        submit: '送信',
        close: '閉じる',
        actions: 'アクション',
        status: 'ステータス',
        date: '日付',
        amount: '金額',
        description: '説明',
        name: '名前',
        email: 'メールアドレス',
        phone: '電話番号',
        address: '住所',
        notes: 'メモ',
        required: '必須',
        optional: '任意',
      },
      // Navigation
      nav: {
        dashboard: 'ダッシュボード',
        invoices: '請求書',
        contracts: '契約書',
        clients: '取引先',
        projects: 'プロジェクト',
        employees: '従業員',
        recruiting: '採用',
        accounting: '会計',
        settings: '設定',
        help: 'ヘルプ',
        logout: 'ログアウト',
      },
      // Dashboard
      dashboard: {
        title: 'ダッシュボード',
        welcome: 'おかえりなさい',
        overview: '概要',
        recentActivity: '最近の活動',
        quickActions: 'クイックアクション',
        totalRevenue: '総収益',
        pendingInvoices: '未払い請求書',
        activeProjects: '進行中プロジェクト',
        upcomingTasks: '今後のタスク',
      },
      // Invoices
      invoices: {
        title: '請求書',
        subtitle: '請求書の作成・管理',
        create: '請求書を作成',
        empty: {
          title: 'まだ請求書がありません',
          description: '請求書を作成して売上を管理しましょう',
        },
        status: {
          draft: '下書き',
          sent: '送信済み',
          pending: '未払い',
          paid: '支払済み',
          overdue: '期限超過',
          cancelled: 'キャンセル',
        },
        fields: {
          invoiceNumber: '請求書番号',
          client: '取引先',
          issueDate: '発行日',
          dueDate: '支払期限',
          amount: '金額',
          items: '品目',
        },
      },
      // Contracts
      contracts: {
        title: '契約書',
        subtitle: '契約書の作成・管理・オンライン締結',
        create: '契約書を作成',
        empty: {
          title: 'まだ契約書がありません',
          description: '契約書を作成して取引先との合意を記録しましょう',
        },
        status: {
          draft: '下書き',
          pending: '署名待ち',
          active: '有効',
          completed: '完了',
          cancelled: 'キャンセル',
        },
      },
      // Clients
      clients: {
        title: '取引先',
        subtitle: '取引先情報の管理',
        create: '取引先を追加',
        empty: {
          title: 'まだ取引先がありません',
          description: '取引先を登録して請求書や契約書を作成しましょう',
        },
        fields: {
          companyName: '会社名',
          contactPerson: '担当者',
          email: 'メール',
          phone: '電話',
          address: '住所',
        },
      },
      // Projects
      projects: {
        title: 'プロジェクト管理',
        subtitle: 'プロジェクトの進捗を管理',
        create: 'プロジェクトを作成',
        empty: {
          title: 'まだプロジェクトがありません',
          description: 'プロジェクトを作成してタスクを管理しましょう',
        },
        status: {
          planning: '計画中',
          active: '進行中',
          on_hold: '保留中',
          completed: '完了',
          cancelled: 'キャンセル',
        },
        fields: {
          name: 'プロジェクト名',
          description: '説明',
          startDate: '開始日',
          endDate: '終了日',
          progress: '進捗',
          budget: '予算',
        },
      },
      // Employees
      employees: {
        title: '従業員管理',
        subtitle: '従業員情報の管理',
        create: '従業員を追加',
        empty: {
          title: 'まだ従業員がいません',
          description: '従業員を登録して人事管理を始めましょう',
        },
        fields: {
          employeeNumber: '社員番号',
          name: '氏名',
          department: '部署',
          position: '役職',
          hireDate: '入社日',
          employmentType: '雇用形態',
        },
        employmentTypes: {
          full_time: '正社員',
          part_time: 'パート',
          contract: '契約社員',
          intern: 'インターン',
        },
      },
      // CRM / Leads
      leads: {
        title: 'リード管理',
        subtitle: '見込み客の管理',
        create: 'リードを追加',
        empty: {
          title: 'まだリードがありません',
          description: '最初のリードを追加して営業活動を開始しましょう',
        },
        status: {
          new: '新規',
          contacted: '連絡済み',
          qualified: '見込み確定',
          converted: '顧客化',
          lost: '失注',
        },
        source: {
          website: 'Webサイト',
          referral: '紹介',
          advertisement: '広告',
          cold_call: '電話営業',
          event: 'イベント',
          other: 'その他',
        },
      },
      // Settings
      settings: {
        title: '設定',
        profile: 'プロフィール',
        organization: '組織',
        billing: '課金',
        security: 'セキュリティ',
        notifications: '通知',
        appearance: '表示設定',
        language: '言語',
        timezone: 'タイムゾーン',
      },
      // Auth
      auth: {
        login: 'ログイン',
        logout: 'ログアウト',
        signup: 'アカウント作成',
        forgotPassword: 'パスワードを忘れた方',
        resetPassword: 'パスワードリセット',
        email: 'メールアドレス',
        password: 'パスワード',
        confirmPassword: 'パスワード（確認）',
        rememberMe: 'ログイン状態を保持',
      },
      // Errors
      errors: {
        generic: 'エラーが発生しました',
        notFound: 'ページが見つかりません',
        unauthorized: 'アクセス権限がありません',
        networkError: 'ネットワークエラーが発生しました',
        validationError: '入力内容を確認してください',
      },
      // Success messages
      success: {
        saved: '保存しました',
        deleted: '削除しました',
        created: '作成しました',
        updated: '更新しました',
        sent: '送信しました',
      },
    },
  },
  en: {
    translation: {
      // Common
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        loading: 'Loading...',
        noData: 'No data',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        close: 'Close',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        amount: 'Amount',
        description: 'Description',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        notes: 'Notes',
        required: 'Required',
        optional: 'Optional',
      },
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        invoices: 'Invoices',
        contracts: 'Contracts',
        clients: 'Clients',
        projects: 'Projects',
        employees: 'Employees',
        recruiting: 'Recruiting',
        accounting: 'Accounting',
        settings: 'Settings',
        help: 'Help',
        logout: 'Logout',
      },
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back',
        overview: 'Overview',
        recentActivity: 'Recent Activity',
        quickActions: 'Quick Actions',
        totalRevenue: 'Total Revenue',
        pendingInvoices: 'Pending Invoices',
        activeProjects: 'Active Projects',
        upcomingTasks: 'Upcoming Tasks',
      },
      // Invoices
      invoices: {
        title: 'Invoices',
        subtitle: 'Create and manage invoices',
        create: 'Create Invoice',
        empty: {
          title: 'No invoices yet',
          description: 'Create an invoice to start tracking revenue',
        },
        status: {
          draft: 'Draft',
          sent: 'Sent',
          pending: 'Pending',
          paid: 'Paid',
          overdue: 'Overdue',
          cancelled: 'Cancelled',
        },
        fields: {
          invoiceNumber: 'Invoice Number',
          client: 'Client',
          issueDate: 'Issue Date',
          dueDate: 'Due Date',
          amount: 'Amount',
          items: 'Items',
        },
      },
      // Contracts
      contracts: {
        title: 'Contracts',
        subtitle: 'Create, manage, and sign contracts online',
        create: 'Create Contract',
        empty: {
          title: 'No contracts yet',
          description: 'Create a contract to record agreements with clients',
        },
        status: {
          draft: 'Draft',
          pending: 'Pending Signature',
          active: 'Active',
          completed: 'Completed',
          cancelled: 'Cancelled',
        },
      },
      // Clients
      clients: {
        title: 'Clients',
        subtitle: 'Manage client information',
        create: 'Add Client',
        empty: {
          title: 'No clients yet',
          description: 'Add clients to create invoices and contracts',
        },
        fields: {
          companyName: 'Company Name',
          contactPerson: 'Contact Person',
          email: 'Email',
          phone: 'Phone',
          address: 'Address',
        },
      },
      // Projects
      projects: {
        title: 'Project Management',
        subtitle: 'Track project progress',
        create: 'Create Project',
        empty: {
          title: 'No projects yet',
          description: 'Create a project to manage tasks',
        },
        status: {
          planning: 'Planning',
          active: 'Active',
          on_hold: 'On Hold',
          completed: 'Completed',
          cancelled: 'Cancelled',
        },
        fields: {
          name: 'Project Name',
          description: 'Description',
          startDate: 'Start Date',
          endDate: 'End Date',
          progress: 'Progress',
          budget: 'Budget',
        },
      },
      // Employees
      employees: {
        title: 'Employee Management',
        subtitle: 'Manage employee information',
        create: 'Add Employee',
        empty: {
          title: 'No employees yet',
          description: 'Add employees to start HR management',
        },
        fields: {
          employeeNumber: 'Employee Number',
          name: 'Name',
          department: 'Department',
          position: 'Position',
          hireDate: 'Hire Date',
          employmentType: 'Employment Type',
        },
        employmentTypes: {
          full_time: 'Full-time',
          part_time: 'Part-time',
          contract: 'Contract',
          intern: 'Intern',
        },
      },
      // CRM / Leads
      leads: {
        title: 'Lead Management',
        subtitle: 'Manage potential customers',
        create: 'Add Lead',
        empty: {
          title: 'No leads yet',
          description: 'Add your first lead to start sales activities',
        },
        status: {
          new: 'New',
          contacted: 'Contacted',
          qualified: 'Qualified',
          converted: 'Converted',
          lost: 'Lost',
        },
        source: {
          website: 'Website',
          referral: 'Referral',
          advertisement: 'Advertisement',
          cold_call: 'Cold Call',
          event: 'Event',
          other: 'Other',
        },
      },
      // Settings
      settings: {
        title: 'Settings',
        profile: 'Profile',
        organization: 'Organization',
        billing: 'Billing',
        security: 'Security',
        notifications: 'Notifications',
        appearance: 'Appearance',
        language: 'Language',
        timezone: 'Timezone',
      },
      // Auth
      auth: {
        login: 'Login',
        logout: 'Logout',
        signup: 'Sign Up',
        forgotPassword: 'Forgot Password',
        resetPassword: 'Reset Password',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        rememberMe: 'Remember me',
      },
      // Errors
      errors: {
        generic: 'An error occurred',
        notFound: 'Page not found',
        unauthorized: 'Unauthorized access',
        networkError: 'Network error occurred',
        validationError: 'Please check your input',
      },
      // Success messages
      success: {
        saved: 'Saved successfully',
        deleted: 'Deleted successfully',
        created: 'Created successfully',
        updated: 'Updated successfully',
        sent: 'Sent successfully',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;

// Language options for settings
export const languageOptions = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

// Helper to format currency based on locale
export function formatCurrencyLocale(amount: number, locale: string = 'ja'): string {
  const currency = locale === 'ja' ? 'JPY' : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper to format date based on locale
export function formatDateLocale(date: Date | string, locale: string = 'ja'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}
