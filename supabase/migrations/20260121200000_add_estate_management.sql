-- =====================================================
-- ESTATE MANAGEMENT - Real Estate Management Features
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Property status
DO $$ BEGIN
  CREATE TYPE public.property_status AS ENUM ('vacant', 'occupied', 'notice_given', 'under_renovation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Contract status for rental contracts
DO $$ BEGIN
  CREATE TYPE public.rental_contract_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proration rule types
DO $$ BEGIN
  CREATE TYPE public.proration_rule_type AS ENUM (
    'actual_days',           -- 実日数割り（その月の日数で割る）
    'fixed_30_days',         -- 30日固定割り
    'fixed_31_days',         -- 31日固定割り
    'include_start_day',     -- 当日含む
    'exclude_start_day',     -- 当日含まない
    'include_end_day',       -- 退去日含む
    'exclude_end_day'        -- 退去日含まない
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- PROPERTY OWNERS (物件オーナー)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.property_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  name_kana TEXT,
  owner_type TEXT DEFAULT 'individual' CHECK (owner_type IN ('individual', 'corporation')),

  -- Contact info
  phone TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  postal_code TEXT,

  -- Bank account for payments
  bank_name TEXT,
  bank_branch TEXT,
  account_type TEXT CHECK (account_type IN ('普通', '当座')),
  account_number TEXT,
  account_holder TEXT,

  -- Settings
  management_fee_rate NUMERIC(5,2) DEFAULT 5.00,

  notes TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- BUILDINGS (物件/建物)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.property_owners(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  property_code TEXT,  -- Internal property code

  -- Address
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line1 TEXT,
  address_line2 TEXT,

  -- Building details
  building_type TEXT,  -- マンション, アパート, ビル, etc.
  structure TEXT,      -- RC造, S造, 木造, etc.
  floors_above INTEGER,
  floors_below INTEGER,
  total_units INTEGER,
  year_built INTEGER,

  -- Management
  is_managed BOOLEAN DEFAULT true,
  management_start_date DATE,

  -- Image
  image_url TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- UNITS (部屋)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,

  unit_number TEXT NOT NULL,  -- Room number (101, 201, etc.)
  floor INTEGER,

  -- Unit details
  layout TEXT,           -- 1K, 1LDK, 2DK, etc.
  area_sqm NUMERIC(8,2), -- 専有面積
  balcony_sqm NUMERIC(8,2),

  -- Rent details (default/advertised values)
  base_rent NUMERIC(12,0),     -- 賃料
  management_fee NUMERIC(12,0), -- 共益費/管理費

  status public.property_status DEFAULT 'vacant',

  -- Image
  image_url TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(building_id, unit_number)
);

-- =====================================================
-- TENANTS (入居者/契約者)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  name_kana TEXT,

  -- Contact info
  phone TEXT,
  mobile TEXT,
  email TEXT,

  -- Current address (may be different from rental unit)
  current_address TEXT,
  current_postal_code TEXT,

  -- Employment info
  employer_name TEXT,
  employer_phone TEXT,
  annual_income NUMERIC(12,0),

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,

  notes TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RENTAL CONTRACTS (賃貸契約)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rental_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  contract_number TEXT,

  -- Contract period
  start_date DATE NOT NULL,
  end_date DATE,

  -- Rent details
  rent_amount NUMERIC(12,0) NOT NULL,
  management_fee NUMERIC(12,0) DEFAULT 0,
  deposit NUMERIC(12,0) DEFAULT 0,      -- 敷金
  key_money NUMERIC(12,0) DEFAULT 0,    -- 礼金

  -- Payment details
  payment_day INTEGER DEFAULT 27 CHECK (payment_day >= 1 AND payment_day <= 31),
  payment_method TEXT DEFAULT 'bank_transfer',

  -- Proration rules
  proration_rules JSONB DEFAULT '{"move_in": ["actual_days", "include_start_day"], "move_out": ["actual_days", "exclude_end_day"]}',

  -- Status
  status public.rental_contract_status DEFAULT 'active',

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RENT INVOICES (家賃請求書)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rent_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES public.rental_contracts(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  invoice_number TEXT,
  invoice_month DATE NOT NULL,  -- 請求対象月（その月の1日）

  -- Amounts
  rent_amount NUMERIC(12,0) NOT NULL,
  management_fee NUMERIC(12,0) DEFAULT 0,
  other_charges NUMERIC(12,0) DEFAULT 0,
  adjustments NUMERIC(12,0) DEFAULT 0,  -- 日割り調整など
  total_amount NUMERIC(12,0) NOT NULL,

  -- Payment tracking
  paid_amount NUMERIC(12,0) DEFAULT 0,
  due_date DATE NOT NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- BANK TRANSACTIONS (銀行取引)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  transaction_date DATE NOT NULL,
  depositor_name TEXT NOT NULL,
  depositor_name_kana TEXT,
  amount NUMERIC(12,0) NOT NULL,

  bank_name TEXT,
  branch_name TEXT,
  reference_number TEXT,

  -- Matching
  is_matched BOOLEAN DEFAULT false,
  matched_invoice_id UUID REFERENCES public.rent_invoices(id) ON DELETE SET NULL,
  matched_at TIMESTAMPTZ,
  match_confidence INTEGER,  -- 0-100

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RENT PAYMENTS (家賃入金)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rent_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.rent_invoices(id) ON DELETE CASCADE,
  bank_transaction_id UUID REFERENCES public.bank_transactions(id) ON DELETE SET NULL,

  amount NUMERIC(12,0) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- OWNER PAYMENTS (オーナー送金)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.owner_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.property_owners(id) ON DELETE CASCADE,

  payment_month DATE NOT NULL,  -- 対象月

  -- Amounts
  total_rent_collected NUMERIC(12,0) DEFAULT 0,
  management_fee NUMERIC(12,0) DEFAULT 0,
  repair_costs NUMERIC(12,0) DEFAULT 0,
  other_deductions NUMERIC(12,0) DEFAULT 0,
  net_payment NUMERIC(12,0) DEFAULT 0,

  -- Payment status
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_owners
CREATE POLICY "Users can view their own property owners"
  ON public.property_owners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own property owners"
  ON public.property_owners FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for buildings
CREATE POLICY "Users can view their own buildings"
  ON public.buildings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own buildings"
  ON public.buildings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for units
CREATE POLICY "Users can view their own units"
  ON public.units FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own units"
  ON public.units FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for tenants
CREATE POLICY "Users can view their own tenants"
  ON public.tenants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tenants"
  ON public.tenants FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for rental_contracts
CREATE POLICY "Users can view their own rental contracts"
  ON public.rental_contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rental contracts"
  ON public.rental_contracts FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for rent_invoices
CREATE POLICY "Users can view their own rent invoices"
  ON public.rent_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rent invoices"
  ON public.rent_invoices FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for bank_transactions (only if user_id column exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_transactions' AND column_name = 'user_id' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can view their own bank transactions" ON public.bank_transactions;
    DROP POLICY IF EXISTS "Users can manage their own bank transactions" ON public.bank_transactions;

    CREATE POLICY "Users can view their own bank transactions"
      ON public.bank_transactions FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own bank transactions"
      ON public.bank_transactions FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for rent_payments
CREATE POLICY "Users can view their own rent payments"
  ON public.rent_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rent payments"
  ON public.rent_payments FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for owner_payments
CREATE POLICY "Users can view their own owner payments"
  ON public.owner_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own owner payments"
  ON public.owner_payments FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'user_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_buildings_user_id ON public.buildings(user_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'building_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_units_building_id ON public.units(building_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'user_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_units_user_id ON public.units(user_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'user_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_contracts' AND column_name = 'unit_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_rental_contracts_unit_id ON public.rental_contracts(unit_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_contracts' AND column_name = 'tenant_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_rental_contracts_tenant_id ON public.rental_contracts(tenant_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rent_invoices' AND column_name = 'contract_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_rent_invoices_contract_id ON public.rent_invoices(contract_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_transactions' AND column_name = 'user_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_id ON public.bank_transactions(user_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_transactions' AND column_name = 'is_matched' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_bank_transactions_is_matched ON public.bank_transactions(is_matched); END IF; END $$;
