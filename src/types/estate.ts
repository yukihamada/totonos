// Estate Management Types

export type PropertyStatus = 'vacant' | 'occupied' | 'notice_given' | 'under_renovation';
export type RentalContractStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type ProrationRuleType =
  | 'actual_days'
  | 'fixed_30_days'
  | 'fixed_31_days'
  | 'include_start_day'
  | 'exclude_start_day'
  | 'include_end_day'
  | 'exclude_end_day';

export interface PropertyOwner {
  id: string;
  user_id: string;
  name: string;
  name_kana: string | null;
  owner_type: 'individual' | 'corporation';
  phone: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  postal_code: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  account_type: '普通' | '当座' | null;
  account_number: string | null;
  account_holder: string | null;
  management_fee_rate: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  user_id: string;
  owner_id: string | null;
  name: string;
  property_code: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  address_line1: string | null;
  address_line2: string | null;
  building_type: string | null;
  structure: string | null;
  floors_above: number | null;
  floors_below: number | null;
  total_units: number | null;
  year_built: number | null;
  is_managed: boolean;
  management_start_date: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  units?: Unit[];
  owner?: PropertyOwner;
}

export interface Unit {
  id: string;
  user_id: string;
  building_id: string;
  unit_number: string;
  floor: number | null;
  layout: string | null;
  area_sqm: number | null;
  balcony_sqm: number | null;
  base_rent: number | null;
  management_fee: number | null;
  status: PropertyStatus;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  building?: Building;
}

export interface Tenant {
  id: string;
  user_id: string;
  name: string;
  name_kana: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  current_address: string | null;
  current_postal_code: string | null;
  employer_name: string | null;
  employer_phone: string | null;
  annual_income: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RentalContract {
  id: string;
  user_id: string;
  unit_id: string;
  tenant_id: string;
  contract_number: string | null;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  management_fee: number;
  deposit: number;
  key_money: number;
  payment_day: number;
  payment_method: string;
  proration_rules: {
    move_in: ProrationRuleType[];
    move_out: ProrationRuleType[];
  };
  status: RentalContractStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  unit?: Unit;
  tenant?: Tenant;
}

export interface RentInvoice {
  id: string;
  user_id: string;
  contract_id: string;
  tenant_id: string;
  invoice_number: string | null;
  invoice_month: string;
  rent_amount: number;
  management_fee: number;
  other_charges: number;
  adjustments: number;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  contract?: RentalContract;
  tenant?: Tenant;
}

export interface BankTransaction {
  id: string;
  user_id: string;
  transaction_date: string;
  depositor_name: string;
  depositor_name_kana: string | null;
  amount: number;
  bank_name: string | null;
  branch_name: string | null;
  reference_number: string | null;
  is_matched: boolean;
  matched_invoice_id: string | null;
  matched_at: string | null;
  match_confidence: number | null;
  created_at: string;
}

export interface RentPayment {
  id: string;
  user_id: string;
  invoice_id: string;
  bank_transaction_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface OwnerPayment {
  id: string;
  user_id: string;
  owner_id: string;
  payment_month: string;
  total_rent_collected: number;
  management_fee: number;
  repair_costs: number;
  other_deductions: number;
  net_payment: number;
  is_paid: boolean;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Utility functions
export function getPropertyStatusLabel(status: PropertyStatus): string {
  const labels: Record<PropertyStatus, string> = {
    vacant: '空室',
    occupied: '入居中',
    notice_given: '退去予定',
    under_renovation: '改装中',
  };
  return labels[status];
}

export function getPropertyStatusColor(status: PropertyStatus): string {
  const colors: Record<PropertyStatus, string> = {
    vacant: 'bg-chart-1/20 text-chart-1',
    occupied: 'bg-chart-2/20 text-chart-2',
    notice_given: 'bg-chart-4/20 text-chart-4',
    under_renovation: 'bg-muted text-muted-foreground',
  };
  return colors[status];
}

export function getBuildingTypeLabel(type: string | null): string {
  const types: Record<string, string> = {
    apartment: 'アパート',
    mansion: 'マンション',
    house: '一戸建て',
    office: 'オフィスビル',
    commercial: '商業施設',
    parking: '駐車場',
  };
  return types[type || ''] || type || '未設定';
}

export function getLayoutLabel(layout: string | null): string {
  if (!layout) return '未設定';
  return layout;
}

// Proration calculation types
export interface ProrationResult {
  amount: number;
  days: number;
  totalDaysInPeriod: number;
  formula: string;
  description: string;
}

export interface InitialCostResult {
  total: number;
  breakdown: Array<{ label: string; amount: number }>;
  firstMonthRent: ProrationResult;
}

// CSV parsing types for bank transactions
export interface ParsedBankTransaction {
  transactionDate: string;
  depositorName: string;
  depositorNameKana?: string;
  amount: number;
  bankName?: string;
  branchName?: string;
  referenceNumber?: string;
}

export const PRORATION_RULE_OPTIONS: Array<{ value: ProrationRuleType; label: string; description: string }> = [
  { value: 'actual_days', label: '実日数', description: 'その月の実際の日数で計算' },
  { value: 'fixed_30_days', label: '30日固定', description: '月を30日として計算' },
  { value: 'fixed_31_days', label: '31日固定', description: '月を31日として計算' },
  { value: 'include_start_day', label: '入居日含む', description: '入居日を日数に含める' },
  { value: 'exclude_start_day', label: '入居日含まない', description: '入居日を日数に含めない' },
  { value: 'include_end_day', label: '退去日含む', description: '退去日を日数に含める' },
  { value: 'exclude_end_day', label: '退去日含まない', description: '退去日を日数に含めない' },
];
