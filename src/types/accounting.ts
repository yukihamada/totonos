// Accounting types for Totonos

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type JournalSourceType = 'manual' | 'invoice' | 'payment' | 'expense' | 'depreciation' | 'purchase_order' | 'bank_import' | 'payroll' | 'tax';
export type AssetCategory = 'building' | 'vehicle' | 'equipment' | 'software' | 'furniture' | 'other';
export type DepreciationMethod = 'straight_line' | 'declining_balance';
export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
export type TaxType = 'taxable' | 'exempt' | 'zero_rated' | 'reverse_charge';
export type BankTransactionStatus = 'unmatched' | 'matched' | 'reconciled' | 'ignored';
export type CurrencyCode = 'JPY' | 'USD' | 'EUR' | 'GBP' | 'CNY' | 'KRW';

export interface FiscalPeriod {
  id: string;
  user_id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  parent_account_id: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_number: string;
  entry_date: string;
  description: string | null;
  source_type: JournalSourceType;
  source_id: string | null;
  is_posted: boolean;
  fiscal_period_id: string | null;
  created_at: string;
  updated_at: string;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string | null;
  created_at: string;
  account?: Account;
}

export interface FixedAsset {
  id: string;
  user_id: string;
  asset_name: string;
  asset_code: string;
  asset_category: AssetCategory;
  acquisition_date: string;
  acquisition_cost: number;
  depreciation_method: DepreciationMethod;
  useful_life_years: number;
  salvage_value: number;
  current_book_value: number;
  disposal_date: string | null;
  disposal_amount: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepreciationSchedule {
  id: string;
  fixed_asset_id: string;
  fiscal_period_id: string | null;
  depreciation_date: string;
  depreciation_amount: number;
  accumulated_depreciation: number;
  book_value_after: number;
  journal_entry_id: string | null;
  created_at: string;
}

export interface ExpenseClaim {
  id: string;
  user_id: string;
  claim_number: string;
  claim_date: string;
  claimant_name: string | null;
  total_amount: number;
  status: ExpenseStatus;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  items?: ExpenseItem[];
}

export interface ExpenseItem {
  id: string;
  expense_claim_id: string;
  expense_date: string;
  account_id: string | null;
  description: string;
  amount: number;
  receipt_url: string | null;
  vendor_name: string | null;
  created_at: string;
  account?: Account;
}

export interface TaxSettings {
  id: string;
  user_id: string;
  fiscal_year_start_month: number;
  consumption_tax_rate: number;
  corporate_tax_rate: number | null;
  is_simplified_taxation: boolean;
  created_at: string;
  updated_at: string;
}

// Utility functions
export function getAccountTypeLabel(type: AccountType): string {
  switch (type) {
    case 'asset': return '資産';
    case 'liability': return '負債';
    case 'equity': return '純資産';
    case 'revenue': return '収益';
    case 'expense': return '費用';
  }
}

export function getAccountTypeColor(type: AccountType): string {
  switch (type) {
    case 'asset': return 'bg-chart-1/20 text-chart-1';
    case 'liability': return 'bg-chart-4/20 text-chart-4';
    case 'equity': return 'bg-chart-2/20 text-chart-2';
    case 'revenue': return 'bg-chart-2/20 text-chart-2';
    case 'expense': return 'bg-destructive/20 text-destructive';
  }
}

export function getAssetCategoryLabel(category: AssetCategory): string {
  switch (category) {
    case 'building': return '建物';
    case 'vehicle': return '車両運搬具';
    case 'equipment': return '機械設備';
    case 'software': return 'ソフトウェア';
    case 'furniture': return '器具備品';
    case 'other': return 'その他';
  }
}

export function getDepreciationMethodLabel(method: DepreciationMethod): string {
  switch (method) {
    case 'straight_line': return '定額法';
    case 'declining_balance': return '定率法';
  }
}

export function getExpenseStatusLabel(status: ExpenseStatus): string {
  switch (status) {
    case 'draft': return '下書き';
    case 'pending': return '承認待ち';
    case 'approved': return '承認済み';
    case 'rejected': return '却下';
    case 'paid': return '精算済み';
  }
}

export function getExpenseStatusColor(status: ExpenseStatus): string {
  switch (status) {
    case 'draft': return 'bg-muted text-muted-foreground';
    case 'pending': return 'bg-chart-1/20 text-chart-1';
    case 'approved': return 'bg-chart-2/20 text-chart-2';
    case 'rejected': return 'bg-destructive/20 text-destructive';
    case 'paid': return 'bg-chart-4/20 text-chart-4';
  }
}

// Standard chart of accounts for Japan
export const defaultAccounts: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  // Assets (1xxx)
  { account_code: '1000', account_name: '現金', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1100', account_name: '普通預金', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1200', account_name: '売掛金', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1300', account_name: '受取手形', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1400', account_name: '棚卸資産', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1500', account_name: '前払費用', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1600', account_name: '仮払金', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1700', account_name: '建物', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1710', account_name: '建物減価償却累計額', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1800', account_name: '車両運搬具', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1810', account_name: '車両減価償却累計額', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1900', account_name: '器具備品', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1910', account_name: '器具備品減価償却累計額', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '1950', account_name: 'ソフトウェア', account_type: 'asset', parent_account_id: null, is_system: true, is_active: true },
  
  // Liabilities (2xxx)
  { account_code: '2000', account_name: '買掛金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2100', account_name: '支払手形', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2200', account_name: '未払金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2300', account_name: '未払費用', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2400', account_name: '前受金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2500', account_name: '預り金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2600', account_name: '仮受金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2700', account_name: '短期借入金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2800', account_name: '長期借入金', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2900', account_name: '未払法人税等', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '2910', account_name: '未払消費税等', account_type: 'liability', parent_account_id: null, is_system: true, is_active: true },
  
  // Equity (3xxx)
  { account_code: '3000', account_name: '資本金', account_type: 'equity', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '3100', account_name: '資本準備金', account_type: 'equity', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '3200', account_name: '利益準備金', account_type: 'equity', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '3300', account_name: '繰越利益剰余金', account_type: 'equity', parent_account_id: null, is_system: true, is_active: true },
  
  // Revenue (4xxx)
  { account_code: '4000', account_name: '売上高', account_type: 'revenue', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '4100', account_name: '受取利息', account_type: 'revenue', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '4200', account_name: '受取配当金', account_type: 'revenue', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '4300', account_name: '雑収入', account_type: 'revenue', parent_account_id: null, is_system: true, is_active: true },
  
  // Expenses (5xxx-8xxx)
  { account_code: '5000', account_name: '仕入高', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6000', account_name: '給料手当', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6100', account_name: '法定福利費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6200', account_name: '福利厚生費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6300', account_name: '旅費交通費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6400', account_name: '通信費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6500', account_name: '消耗品費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6600', account_name: '水道光熱費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6700', account_name: '地代家賃', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6800', account_name: '支払手数料', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '6900', account_name: '広告宣伝費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7000', account_name: '接待交際費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7100', account_name: '会議費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7200', account_name: '租税公課', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7300', account_name: '保険料', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7400', account_name: '減価償却費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7500', account_name: '支払利息', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '7600', account_name: '雑費', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
  { account_code: '8000', account_name: '法人税等', account_type: 'expense', parent_account_id: null, is_system: true, is_active: true },
];

// ===== 新機能用の型定義 =====

// 消費税計算
export interface TaxCalculation {
  id: string;
  user_id: string;
  fiscal_period_id: string;
  calculation_date: string;
  sales_taxable: number;
  sales_tax_collected: number;
  purchases_taxable: number;
  purchases_tax_paid: number;
  tax_payable: number;
  tax_refundable: number;
  net_tax_liability: number;
  created_at: string;
}

// 銀行取引
export interface BankTransaction {
  id: string;
  user_id: string;
  bank_account_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  balance_after: number;
  reference_number: string | null;
  status: BankTransactionStatus;
  matched_journal_entry_id: string | null;
  imported_at: string;
  created_at: string;
}

// 銀行口座
export interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  branch_name: string | null;
  account_number: string;
  account_type: 'ordinary' | 'checking' | 'savings';
  linked_account_id: string | null;
  current_balance: number;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
}

// 仕訳テンプレート
export interface JournalTemplate {
  id: string;
  user_id: string;
  template_name: string;
  description: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  next_run_date: string | null;
  lines: JournalTemplateLine[];
  created_at: string;
  updated_at: string;
}

export interface JournalTemplateLine {
  id: string;
  template_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string | null;
  account?: Account;
}

// コストセンター（部門）
export interface CostCenter {
  id: string;
  user_id: string;
  code: string;
  name: string;
  parent_id: string | null;
  manager_name: string | null;
  is_active: boolean;
  created_at: string;
}

// 買掛金
export interface AccountsPayable {
  id: string;
  user_id: string;
  vendor_id: string | null;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  balance: number;
  status: 'open' | 'partial' | 'paid' | 'overdue';
  journal_entry_id: string | null;
  created_at: string;
}

// 予算
export interface Budget {
  id: string;
  user_id: string;
  fiscal_period_id: string;
  account_id: string;
  cost_center_id: string | null;
  budget_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  account?: Account;
  cost_center?: CostCenter;
}

// 為替レート
export interface ExchangeRate {
  id: string;
  user_id: string;
  from_currency: CurrencyCode;
  to_currency: CurrencyCode;
  rate: number;
  effective_date: string;
  created_at: string;
}

// キャッシュフロー計算書用
export interface CashFlowItem {
  category: 'operating' | 'investing' | 'financing';
  subcategory: string;
  description: string;
  amount: number;
}

export interface CashFlowStatement {
  period_start: string;
  period_end: string;
  operating_activities: CashFlowItem[];
  investing_activities: CashFlowItem[];
  financing_activities: CashFlowItem[];
  net_operating: number;
  net_investing: number;
  net_financing: number;
  net_change: number;
  beginning_cash: number;
  ending_cash: number;
}

// 決算処理
export interface PeriodCloseProcess {
  id: string;
  user_id: string;
  fiscal_period_id: string;
  step: 'draft' | 'adjustments' | 'tax_calculation' | 'closing_entries' | 'completed';
  adjusting_entries_count: number;
  closing_entries_count: number;
  net_income: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ユーティリティ関数追加
export function getTaxTypeLabel(type: TaxType): string {
  switch (type) {
    case 'taxable': return '課税';
    case 'exempt': return '非課税';
    case 'zero_rated': return '免税';
    case 'reverse_charge': return 'リバースチャージ';
  }
}

export function getBankTransactionStatusLabel(status: BankTransactionStatus): string {
  switch (status) {
    case 'unmatched': return '未照合';
    case 'matched': return '照合済';
    case 'reconciled': return '消込済';
    case 'ignored': return '対象外';
  }
}

export function getCurrencySymbol(code: CurrencyCode): string {
  switch (code) {
    case 'JPY': return '¥';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CNY': return '¥';
    case 'KRW': return '₩';
  }
}
