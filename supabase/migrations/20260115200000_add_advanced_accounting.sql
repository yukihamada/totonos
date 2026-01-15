-- 高度な会計機能のマイグレーション

-- 銀行口座タイプ
CREATE TYPE bank_account_type AS ENUM ('ordinary', 'checking', 'savings');

-- 銀行取引ステータス
CREATE TYPE bank_transaction_status AS ENUM ('unmatched', 'matched', 'reconciled', 'ignored');

-- 通貨コード
CREATE TYPE currency_code AS ENUM ('JPY', 'USD', 'EUR', 'GBP', 'CNY', 'KRW');

-- 決算処理ステップ
CREATE TYPE period_close_step AS ENUM ('draft', 'adjustments', 'tax_calculation', 'closing_entries', 'completed');

-- 買掛金ステータス
CREATE TYPE accounts_payable_status AS ENUM ('open', 'partial', 'paid', 'overdue');

-- journal_source_type に新しい値を追加
ALTER TYPE journal_source_type ADD VALUE IF NOT EXISTS 'bank_import';
ALTER TYPE journal_source_type ADD VALUE IF NOT EXISTS 'payroll';
ALTER TYPE journal_source_type ADD VALUE IF NOT EXISTS 'tax';

-- 銀行口座マスタ
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  branch_name TEXT,
  account_number TEXT NOT NULL,
  account_type bank_account_type NOT NULL DEFAULT 'ordinary',
  linked_account_id UUID REFERENCES public.accounts(id),
  current_balance NUMERIC NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank accounts" ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank accounts" ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- 銀行取引明細
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  reference_number TEXT,
  status bank_transaction_status NOT NULL DEFAULT 'unmatched',
  matched_journal_entry_id UUID REFERENCES public.journal_entries(id),
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank transactions" ON public.bank_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank transactions" ON public.bank_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank transactions" ON public.bank_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank transactions" ON public.bank_transactions FOR DELETE USING (auth.uid() = user_id);

-- 消費税計算
CREATE TABLE public.tax_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fiscal_period_id UUID NOT NULL REFERENCES public.fiscal_periods(id),
  calculation_date DATE NOT NULL,
  sales_taxable NUMERIC NOT NULL DEFAULT 0,
  sales_tax_collected NUMERIC NOT NULL DEFAULT 0,
  purchases_taxable NUMERIC NOT NULL DEFAULT 0,
  purchases_tax_paid NUMERIC NOT NULL DEFAULT 0,
  tax_payable NUMERIC NOT NULL DEFAULT 0,
  tax_refundable NUMERIC NOT NULL DEFAULT 0,
  net_tax_liability NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax calculations" ON public.tax_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tax calculations" ON public.tax_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax calculations" ON public.tax_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax calculations" ON public.tax_calculations FOR DELETE USING (auth.uid() = user_id);

-- 仕訳テンプレート
CREATE TABLE public.journal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  next_run_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal templates" ON public.journal_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal templates" ON public.journal_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal templates" ON public.journal_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal templates" ON public.journal_templates FOR DELETE USING (auth.uid() = user_id);

-- 仕訳テンプレート明細
CREATE TABLE public.journal_template_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.journal_templates(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  debit_amount NUMERIC NOT NULL DEFAULT 0,
  credit_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_template_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal template lines" ON public.journal_template_lines FOR SELECT
USING (EXISTS (SELECT 1 FROM journal_templates WHERE journal_templates.id = journal_template_lines.template_id AND journal_templates.user_id = auth.uid()));
CREATE POLICY "Users can insert their own journal template lines" ON public.journal_template_lines FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM journal_templates WHERE journal_templates.id = journal_template_lines.template_id AND journal_templates.user_id = auth.uid()));
CREATE POLICY "Users can update their own journal template lines" ON public.journal_template_lines FOR UPDATE
USING (EXISTS (SELECT 1 FROM journal_templates WHERE journal_templates.id = journal_template_lines.template_id AND journal_templates.user_id = auth.uid()));
CREATE POLICY "Users can delete their own journal template lines" ON public.journal_template_lines FOR DELETE
USING (EXISTS (SELECT 1 FROM journal_templates WHERE journal_templates.id = journal_template_lines.template_id AND journal_templates.user_id = auth.uid()));

-- コストセンター（部門）
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.cost_centers(id),
  manager_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cost centers" ON public.cost_centers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cost centers" ON public.cost_centers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cost centers" ON public.cost_centers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cost centers" ON public.cost_centers FOR DELETE USING (auth.uid() = user_id);

-- 買掛金
CREATE TABLE public.accounts_payable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_id UUID,
  vendor_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL,
  status accounts_payable_status NOT NULL DEFAULT 'open',
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts payable" ON public.accounts_payable FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts payable" ON public.accounts_payable FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts payable" ON public.accounts_payable FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts payable" ON public.accounts_payable FOR DELETE USING (auth.uid() = user_id);

-- 予算
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fiscal_period_id UUID NOT NULL REFERENCES public.fiscal_periods(id),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  cost_center_id UUID REFERENCES public.cost_centers(id),
  budget_amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, fiscal_period_id, account_id, cost_center_id)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- 為替レート
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_currency currency_code NOT NULL,
  to_currency currency_code NOT NULL,
  rate NUMERIC NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, from_currency, to_currency, effective_date)
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exchange rates" ON public.exchange_rates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exchange rates" ON public.exchange_rates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exchange rates" ON public.exchange_rates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exchange rates" ON public.exchange_rates FOR DELETE USING (auth.uid() = user_id);

-- 決算処理
CREATE TABLE public.period_close_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fiscal_period_id UUID NOT NULL REFERENCES public.fiscal_periods(id),
  step period_close_step NOT NULL DEFAULT 'draft',
  adjusting_entries_count INTEGER DEFAULT 0,
  closing_entries_count INTEGER DEFAULT 0,
  net_income NUMERIC DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, fiscal_period_id)
);

ALTER TABLE public.period_close_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own period close processes" ON public.period_close_processes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own period close processes" ON public.period_close_processes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own period close processes" ON public.period_close_processes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own period close processes" ON public.period_close_processes FOR DELETE USING (auth.uid() = user_id);

-- 仕訳明細にコストセンターIDを追加
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);

-- 仕訳明細に通貨情報を追加
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS currency currency_code DEFAULT 'JPY';
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 1;
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS base_debit_amount NUMERIC;
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS base_credit_amount NUMERIC;

-- updated_at トリガー
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_templates_updated_at BEFORE UPDATE ON public.journal_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON public.cost_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_period_close_processes_updated_at BEFORE UPDATE ON public.period_close_processes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- インデックス
CREATE INDEX idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions(status);
CREATE INDEX idx_accounts_payable_due_date ON public.accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_status ON public.accounts_payable(status);
CREATE INDEX idx_exchange_rates_date ON public.exchange_rates(effective_date);
