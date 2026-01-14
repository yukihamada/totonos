export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type SourceService = 
  | 'freee'
  | 'mf'
  | 'yayoi'
  | 'smarthr'
  | 'salesforce'
  | 'kintone'
  | 'notion'
  | 'excel'
  | 'csv';

export type TargetModule = 
  | 'clients'
  | 'invoices'
  | 'estimates'
  | 'leads'
  | 'deals'
  | 'employees'
  | 'accounts'
  | 'journal_entries'
  | 'wiki_pages';

export interface ImportJob {
  id: string;
  user_id: string;
  source_service: SourceService;
  target_module: TargetModule;
  status: ImportStatus;
  file_name?: string;
  total_rows: number;
  processed_rows: number;
  error_rows: number;
  mapping_config?: MappingConfig;
  error_summary?: ErrorSummary;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportError {
  id: string;
  job_id: string;
  row_number: number;
  original_data: Record<string, unknown>;
  error_message: string;
  created_at: string;
}

export interface ImportTemplate {
  id: string;
  user_id: string;
  template_name: string;
  source_service: SourceService;
  target_module: TargetModule;
  mapping: MappingConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface MappingConfig {
  fieldMappings: FieldMapping[];
  skipFirstRow: boolean;
  dateFormat?: string;
  encoding?: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'date' | 'number' | 'boolean' | 'trim';
  defaultValue?: string;
}

export interface ErrorSummary {
  totalErrors: number;
  errorTypes: Record<string, number>;
  sampleErrors: string[];
}

export interface ServiceConfig {
  id: SourceService;
  name: string;
  icon: string;
  description: string;
  supportedModules: TargetModule[];
  importMethods: ('csv' | 'api')[];
}

export const SERVICE_CONFIGS: ServiceConfig[] = [
  {
    id: 'freee',
    name: 'freee会計',
    icon: '📊',
    description: '取引先、請求書、仕訳データをインポート',
    supportedModules: ['clients', 'invoices', 'accounts', 'journal_entries'],
    importMethods: ['csv', 'api'],
  },
  {
    id: 'mf',
    name: 'マネーフォワード',
    icon: '💰',
    description: '取引先、仕訳、請求書データをインポート',
    supportedModules: ['clients', 'invoices', 'accounts', 'journal_entries'],
    importMethods: ['csv'],
  },
  {
    id: 'yayoi',
    name: '弥生会計',
    icon: '📒',
    description: '仕訳、勘定科目データをインポート',
    supportedModules: ['accounts', 'journal_entries'],
    importMethods: ['csv'],
  },
  {
    id: 'smarthr',
    name: 'SmartHR',
    icon: '👥',
    description: '従業員マスタデータをインポート',
    supportedModules: ['employees'],
    importMethods: ['csv', 'api'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    description: 'リード、商談、取引先データをインポート',
    supportedModules: ['leads', 'deals', 'clients'],
    importMethods: ['csv'],
  },
  {
    id: 'kintone',
    name: 'kintone',
    icon: '🔧',
    description: 'カスタムデータをインポート',
    supportedModules: ['clients', 'leads', 'deals'],
    importMethods: ['csv'],
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Wikiページデータをインポート',
    supportedModules: ['wiki_pages'],
    importMethods: ['csv'],
  },
  {
    id: 'excel',
    name: 'Excel',
    icon: '📗',
    description: 'Excelファイルから汎用インポート',
    supportedModules: ['clients', 'invoices', 'leads', 'employees'],
    importMethods: ['csv'],
  },
  {
    id: 'csv',
    name: 'CSV',
    icon: '📄',
    description: 'CSVファイルから汎用インポート',
    supportedModules: ['clients', 'invoices', 'leads', 'employees', 'accounts'],
    importMethods: ['csv'],
  },
];

export const TARGET_MODULE_LABELS: Record<TargetModule, string> = {
  clients: '取引先',
  invoices: '請求書',
  estimates: '見積書',
  leads: 'リード',
  deals: '商談',
  employees: '従業員',
  accounts: '勘定科目',
  journal_entries: '仕訳',
  wiki_pages: 'Wikiページ',
};

export const TARGET_MODULE_FIELDS: Record<TargetModule, string[]> = {
  clients: ['name', 'email', 'phone', 'address', 'notes'],
  invoices: ['title', 'amount', 'due_date', 'status', 'description'],
  estimates: ['title', 'amount', 'valid_until', 'status', 'description'],
  leads: ['company_name', 'contact_name', 'email', 'phone', 'status', 'source', 'notes'],
  deals: ['deal_name', 'amount', 'stage', 'expected_close_date', 'notes'],
  employees: ['name', 'name_kana', 'email', 'phone', 'department', 'position', 'hire_date'],
  accounts: ['account_code', 'account_name', 'account_type'],
  journal_entries: ['entry_date', 'description', 'debit_account', 'credit_account', 'amount'],
  wiki_pages: ['title', 'content', 'category'],
};
