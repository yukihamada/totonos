
-- 会計期間テーブル
CREATE TABLE IF NOT EXISTS public.fiscal_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fiscal_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fiscal periods" ON public.fiscal_periods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fiscal periods" ON public.fiscal_periods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fiscal periods" ON public.fiscal_periods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fiscal periods" ON public.fiscal_periods FOR DELETE USING (auth.uid() = user_id);

-- 勘定科目マスタ
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  parent_account_id UUID REFERENCES public.accounts(id),
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_code)
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- 仕訳帳
CREATE TYPE journal_source_type AS ENUM ('manual', 'invoice', 'payment', 'expense', 'depreciation', 'purchase_order');

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  source_type journal_source_type NOT NULL DEFAULT 'manual',
  source_id UUID,
  is_posted BOOLEAN DEFAULT false,
  fiscal_period_id UUID REFERENCES public.fiscal_periods(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- 仕訳番号自動生成
CREATE OR REPLACE FUNCTION public.generate_journal_entry_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := to_char(CURRENT_DATE, 'YYYYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 8) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.journal_entries
    WHERE entry_number LIKE 'JE-' || year_month || '%';
    
    NEW.entry_number := 'JE-' || year_month || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$function$;

CREATE TRIGGER set_journal_entry_number
BEFORE INSERT ON public.journal_entries
FOR EACH ROW
WHEN (NEW.entry_number IS NULL OR NEW.entry_number = '')
EXECUTE FUNCTION public.generate_journal_entry_number();

-- 仕訳明細
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  debit_amount NUMERIC NOT NULL DEFAULT 0,
  credit_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entry lines" ON public.journal_entry_lines FOR SELECT 
USING (EXISTS (SELECT 1 FROM journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can insert their own journal entry lines" ON public.journal_entry_lines FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can update their own journal entry lines" ON public.journal_entry_lines FOR UPDATE 
USING (EXISTS (SELECT 1 FROM journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can delete their own journal entry lines" ON public.journal_entry_lines FOR DELETE 
USING (EXISTS (SELECT 1 FROM journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));

-- 固定資産台帳
CREATE TYPE asset_category AS ENUM ('building', 'vehicle', 'equipment', 'software', 'furniture', 'other');
CREATE TYPE depreciation_method AS ENUM ('straight_line', 'declining_balance');

CREATE TABLE IF NOT EXISTS public.fixed_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  asset_code TEXT NOT NULL,
  asset_category asset_category NOT NULL,
  acquisition_date DATE NOT NULL,
  acquisition_cost NUMERIC NOT NULL,
  depreciation_method depreciation_method NOT NULL DEFAULT 'straight_line',
  useful_life_years INTEGER NOT NULL,
  salvage_value NUMERIC DEFAULT 0,
  current_book_value NUMERIC NOT NULL,
  disposal_date DATE,
  disposal_amount NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_code)
);

ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fixed assets" ON public.fixed_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fixed assets" ON public.fixed_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fixed assets" ON public.fixed_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fixed assets" ON public.fixed_assets FOR DELETE USING (auth.uid() = user_id);

-- 減価償却スケジュール
CREATE TABLE IF NOT EXISTS public.depreciation_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fixed_asset_id UUID NOT NULL REFERENCES public.fixed_assets(id) ON DELETE CASCADE,
  fiscal_period_id UUID REFERENCES public.fiscal_periods(id),
  depreciation_date DATE NOT NULL,
  depreciation_amount NUMERIC NOT NULL,
  accumulated_depreciation NUMERIC NOT NULL,
  book_value_after NUMERIC NOT NULL,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.depreciation_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own depreciation schedules" ON public.depreciation_schedules FOR SELECT 
USING (EXISTS (SELECT 1 FROM fixed_assets WHERE fixed_assets.id = depreciation_schedules.fixed_asset_id AND fixed_assets.user_id = auth.uid()));
CREATE POLICY "Users can insert their own depreciation schedules" ON public.depreciation_schedules FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM fixed_assets WHERE fixed_assets.id = depreciation_schedules.fixed_asset_id AND fixed_assets.user_id = auth.uid()));
CREATE POLICY "Users can update their own depreciation schedules" ON public.depreciation_schedules FOR UPDATE 
USING (EXISTS (SELECT 1 FROM fixed_assets WHERE fixed_assets.id = depreciation_schedules.fixed_asset_id AND fixed_assets.user_id = auth.uid()));
CREATE POLICY "Users can delete their own depreciation schedules" ON public.depreciation_schedules FOR DELETE 
USING (EXISTS (SELECT 1 FROM fixed_assets WHERE fixed_assets.id = depreciation_schedules.fixed_asset_id AND fixed_assets.user_id = auth.uid()));

-- 経費申請
CREATE TYPE expense_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paid');

CREATE TABLE IF NOT EXISTS public.expense_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  claim_number TEXT NOT NULL,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claimant_name TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status expense_status NOT NULL DEFAULT 'draft',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expense claims" ON public.expense_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expense claims" ON public.expense_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expense claims" ON public.expense_claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expense claims" ON public.expense_claims FOR DELETE USING (auth.uid() = user_id);

-- 経費申請番号自動生成
CREATE OR REPLACE FUNCTION public.generate_expense_claim_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := to_char(CURRENT_DATE, 'YYYYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 8) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.expense_claims
    WHERE claim_number LIKE 'EXP' || year_month || '%';
    
    NEW.claim_number := 'EXP' || year_month || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$function$;

CREATE TRIGGER set_expense_claim_number
BEFORE INSERT ON public.expense_claims
FOR EACH ROW
WHEN (NEW.claim_number IS NULL OR NEW.claim_number = '')
EXECUTE FUNCTION public.generate_expense_claim_number();

-- 経費明細
CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_claim_id UUID NOT NULL REFERENCES public.expense_claims(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_url TEXT,
  vendor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expense items" ON public.expense_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM expense_claims WHERE expense_claims.id = expense_items.expense_claim_id AND expense_claims.user_id = auth.uid()));
CREATE POLICY "Users can insert their own expense items" ON public.expense_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM expense_claims WHERE expense_claims.id = expense_items.expense_claim_id AND expense_claims.user_id = auth.uid()));
CREATE POLICY "Users can update their own expense items" ON public.expense_items FOR UPDATE 
USING (EXISTS (SELECT 1 FROM expense_claims WHERE expense_claims.id = expense_items.expense_claim_id AND expense_claims.user_id = auth.uid()));
CREATE POLICY "Users can delete their own expense items" ON public.expense_items FOR DELETE 
USING (EXISTS (SELECT 1 FROM expense_claims WHERE expense_claims.id = expense_items.expense_claim_id AND expense_claims.user_id = auth.uid()));

-- 税務設定
CREATE TABLE IF NOT EXISTS public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  fiscal_year_start_month INTEGER NOT NULL DEFAULT 4,
  consumption_tax_rate NUMERIC NOT NULL DEFAULT 10,
  corporate_tax_rate NUMERIC DEFAULT 23.2,
  is_simplified_taxation BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax settings" ON public.tax_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tax settings" ON public.tax_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax settings" ON public.tax_settings FOR UPDATE USING (auth.uid() = user_id);

-- updated_at トリガー
CREATE TRIGGER update_fiscal_periods_updated_at BEFORE UPDATE ON public.fiscal_periods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fixed_assets_updated_at BEFORE UPDATE ON public.fixed_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expense_claims_updated_at BEFORE UPDATE ON public.expense_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tax_settings_updated_at BEFORE UPDATE ON public.tax_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
