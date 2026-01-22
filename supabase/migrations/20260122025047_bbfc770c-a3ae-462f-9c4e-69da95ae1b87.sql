-- Estate Management Module Tables

-- Property Owners
CREATE TABLE public.property_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  owner_type TEXT NOT NULL DEFAULT 'individual' CHECK (owner_type IN ('individual', 'corporation')),
  phone TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  postal_code TEXT,
  bank_name TEXT,
  bank_branch TEXT,
  account_type TEXT CHECK (account_type IN ('普通', '当座')),
  account_number TEXT,
  account_holder TEXT,
  management_fee_rate NUMERIC,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Buildings
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  owner_id UUID REFERENCES public.property_owners(id),
  name TEXT NOT NULL,
  property_code TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  building_type TEXT,
  structure TEXT,
  floors_above INTEGER,
  floors_below INTEGER,
  total_units INTEGER,
  year_built INTEGER,
  is_managed BOOLEAN NOT NULL DEFAULT true,
  management_start_date DATE,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Units
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  layout TEXT,
  area_sqm NUMERIC,
  balcony_sqm NUMERIC,
  base_rent NUMERIC,
  management_fee NUMERIC,
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'notice_given', 'under_renovation')),
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tenants
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  phone TEXT,
  mobile TEXT,
  email TEXT,
  current_address TEXT,
  current_postal_code TEXT,
  employer_name TEXT,
  employer_phone TEXT,
  annual_income NUMERIC,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rental Contracts
CREATE TABLE public.rental_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id UUID NOT NULL REFERENCES public.units(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  contract_number TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount NUMERIC NOT NULL,
  management_fee NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC NOT NULL DEFAULT 0,
  key_money NUMERIC NOT NULL DEFAULT 0,
  payment_day INTEGER NOT NULL DEFAULT 27,
  payment_method TEXT NOT NULL DEFAULT '振込',
  proration_rules JSONB NOT NULL DEFAULT '{"move_in": ["actual_days", "include_start_day"], "move_out": ["actual_days", "include_end_day"]}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rent Invoices
CREATE TABLE public.rent_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES public.rental_contracts(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  invoice_number TEXT,
  invoice_month TEXT NOT NULL,
  rent_amount NUMERIC NOT NULL,
  management_fee NUMERIC NOT NULL DEFAULT 0,
  other_charges NUMERIC NOT NULL DEFAULT 0,
  adjustments NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bank Transactions
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  depositor_name TEXT NOT NULL,
  depositor_name_kana TEXT,
  amount NUMERIC NOT NULL,
  bank_name TEXT,
  branch_name TEXT,
  reference_number TEXT,
  is_matched BOOLEAN NOT NULL DEFAULT false,
  matched_invoice_id UUID REFERENCES public.rent_invoices(id),
  matched_at TIMESTAMP WITH TIME ZONE,
  match_confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rent Payments
CREATE TABLE public.rent_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES public.rent_invoices(id),
  bank_transaction_id UUID REFERENCES public.bank_transactions(id),
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT '振込',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Owner Payments
CREATE TABLE public.owner_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.property_owners(id),
  payment_month TEXT NOT NULL,
  total_rent_collected NUMERIC NOT NULL DEFAULT 0,
  management_fee NUMERIC NOT NULL DEFAULT 0,
  repair_costs NUMERIC NOT NULL DEFAULT 0,
  other_deductions NUMERIC NOT NULL DEFAULT 0,
  net_payment NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for all tables (user can only access their own data)
CREATE POLICY "Users can view own property_owners" ON public.property_owners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own property_owners" ON public.property_owners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own property_owners" ON public.property_owners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own property_owners" ON public.property_owners FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own buildings" ON public.buildings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own buildings" ON public.buildings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own buildings" ON public.buildings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own buildings" ON public.buildings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own units" ON public.units FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own units" ON public.units FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own units" ON public.units FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own units" ON public.units FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tenants" ON public.tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tenants" ON public.tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON public.tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tenants" ON public.tenants FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rental_contracts" ON public.rental_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rental_contracts" ON public.rental_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rental_contracts" ON public.rental_contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rental_contracts" ON public.rental_contracts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rent_invoices" ON public.rent_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rent_invoices" ON public.rent_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rent_invoices" ON public.rent_invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rent_invoices" ON public.rent_invoices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bank_transactions" ON public.bank_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank_transactions" ON public.bank_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank_transactions" ON public.bank_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank_transactions" ON public.bank_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rent_payments" ON public.rent_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rent_payments" ON public.rent_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rent_payments" ON public.rent_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rent_payments" ON public.rent_payments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own owner_payments" ON public.owner_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own owner_payments" ON public.owner_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own owner_payments" ON public.owner_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own owner_payments" ON public.owner_payments FOR DELETE USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_property_owners_updated_at BEFORE UPDATE ON public.property_owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rental_contracts_updated_at BEFORE UPDATE ON public.rental_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rent_invoices_updated_at BEFORE UPDATE ON public.rent_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_owner_payments_updated_at BEFORE UPDATE ON public.owner_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();