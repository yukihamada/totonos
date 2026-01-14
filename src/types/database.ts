// Database types for Totonos
export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type BoostStatus = 'pending' | 'approved' | 'completed' | 'rejected';
export type TrustRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Profile {
  id: string;
  user_id: string;
  company_name: string | null;
  company_address: string | null;
  company_logo_url: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  title: string;
  description: string | null;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  virtual_account_number: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  invoice_id: string | null;
  amount: number;
  payment_date: string;
  virtual_account_number: string | null;
  payer_name: string | null;
  is_reconciled: boolean;
  reconciled_at: string | null;
  created_at: string;
  invoice?: Invoice;
}

export interface BoostRequest {
  id: string;
  user_id: string;
  invoice_id: string;
  requested_amount: number;
  fee_percentage: number;
  fee_amount: number;
  net_amount: number;
  status: BoostStatus;
  requested_at: string;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
  invoice?: Invoice;
}

export interface TrustPassport {
  id: string;
  user_id: string;
  score: number;
  rank: TrustRank;
  payment_accuracy_score: number;
  on_time_payment_rate: number;
  average_payment_days: number;
  delay_free_months: number;
  transaction_volume_score: number;
  monthly_invoice_amount: number;
  client_diversity_score: number;
  account_age_months: number;
  boost_usage_score: number;
  boost_count: number;
  boost_completion_rate: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface TrustScoreHistory {
  id: string;
  user_id: string;
  score: number;
  rank: TrustRank;
  event_type: string;
  score_change: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// Utility functions
export function getRankFromScore(score: number): TrustRank {
  if (score >= 900) return 'S';
  if (score >= 700) return 'A';
  if (score >= 500) return 'B';
  if (score >= 300) return 'C';
  return 'D';
}

export function getRankColor(rank: TrustRank): string {
  switch (rank) {
    case 'S': return 'text-chart-2';
    case 'A': return 'text-chart-1';
    case 'B': return 'text-chart-4';
    case 'C': return 'text-muted-foreground';
    case 'D': return 'text-destructive';
  }
}

export function getStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'draft': return 'bg-muted text-muted-foreground';
    case 'sent': return 'bg-chart-4/20 text-chart-4';
    case 'pending': return 'bg-chart-1/20 text-chart-1';
    case 'paid': return 'bg-chart-2/20 text-chart-2';
    case 'overdue': return 'bg-destructive/20 text-destructive';
    case 'cancelled': return 'bg-muted text-muted-foreground';
  }
}

export function getStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'draft': return '下書き';
    case 'sent': return '送付済み';
    case 'pending': return '入金待ち';
    case 'paid': return '入金済み';
    case 'overdue': return '遅延';
    case 'cancelled': return 'キャンセル';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}
