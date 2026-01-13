-- =============================================
-- HR Tech: Employees, Attendance, Payroll
-- =============================================

-- Employment types enum
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern');

-- Employee status enum
CREATE TYPE employee_status AS ENUM ('active', 'on_leave', 'resigned');

-- Attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'paid_leave', 'sick_leave', 'remote', 'half_day');

-- Payroll status enum
CREATE TYPE payroll_status AS ENUM ('draft', 'calculated', 'approved', 'paid');

-- Year-end adjustment status enum
CREATE TYPE year_end_status AS ENUM ('pending', 'submitted', 'completed');

-- Employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_number TEXT NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  hire_date DATE NOT NULL,
  resignation_date DATE,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  department TEXT,
  position TEXT,
  base_salary NUMERIC DEFAULT 0,
  bank_name TEXT,
  bank_branch TEXT,
  bank_account_type TEXT,
  bank_account_number TEXT,
  social_insurance_number TEXT,
  status employee_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, employee_number)
);

-- Attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  break_start TIME,
  break_end TIME,
  work_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  status attendance_status NOT NULL DEFAULT 'present',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);

-- Paid leave balances table
CREATE TABLE public.paid_leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  granted_days NUMERIC NOT NULL DEFAULT 0,
  used_days NUMERIC NOT NULL DEFAULT 0,
  remaining_days NUMERIC NOT NULL DEFAULT 0,
  expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, fiscal_year)
);

-- Payroll records table
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  overtime_pay NUMERIC DEFAULT 0,
  allowances JSONB DEFAULT '{}',
  deductions JSONB DEFAULT '{}',
  gross_pay NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  status payroll_status NOT NULL DEFAULT 'draft',
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Year-end adjustments table
CREATE TABLE public.year_end_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  spouse_deduction NUMERIC DEFAULT 0,
  dependent_count INTEGER DEFAULT 0,
  life_insurance_deduction NUMERIC DEFAULT 0,
  earthquake_insurance_deduction NUMERIC DEFAULT 0,
  housing_loan_deduction NUMERIC DEFAULT 0,
  calculated_tax NUMERIC DEFAULT 0,
  adjustment_amount NUMERIC DEFAULT 0,
  status year_end_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, tax_year)
);

-- =============================================
-- CRM/SFA: Leads, Deals, Activities
-- =============================================

-- Lead source enum
CREATE TYPE lead_source AS ENUM ('website', 'referral', 'exhibition', 'cold_call', 'advertising', 'other');

-- Lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- Deal stage enum
CREATE TYPE deal_stage AS ENUM ('initial', 'proposal', 'negotiation', 'contract', 'won', 'lost');

-- Activity type enum
CREATE TYPE activity_type AS ENUM ('call', 'meeting', 'email', 'visit', 'demo', 'other');

-- Sales target period enum
CREATE TYPE target_period_type AS ENUM ('monthly', 'quarterly', 'yearly');

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  source lead_source DEFAULT 'other',
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,
  converted_to_client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  client_id UUID REFERENCES public.clients(id),
  deal_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  stage deal_stage NOT NULL DEFAULT 'initial',
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to TEXT,
  notes TEXT,
  estimate_id UUID REFERENCES public.estimates(id),
  contract_id UUID REFERENCES public.contracts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type activity_type NOT NULL DEFAULT 'other',
  subject TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_id UUID REFERENCES public.leads(id),
  deal_id UUID REFERENCES public.deals(id),
  client_id UUID REFERENCES public.clients(id),
  duration_minutes INTEGER,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales targets table
CREATE TABLE public.sales_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_type target_period_type NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  achieved_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Information Management: Wiki, Assets, Tasks
-- =============================================

-- Wiki category enum
CREATE TYPE wiki_category AS ENUM ('manual', 'policy', 'minutes', 'announcement', 'template', 'other');

-- Asset type enum
CREATE TYPE asset_type AS ENUM ('pc', 'mobile', 'monitor', 'furniture', 'software_license', 'other');

-- Asset status enum
CREATE TYPE asset_status AS ENUM ('in_use', 'in_stock', 'maintenance', 'disposed');

-- Task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Task status enum
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

-- Wiki pages table
CREATE TABLE public.wiki_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  parent_page_id UUID REFERENCES public.wiki_pages(id),
  category wiki_category DEFAULT 'other',
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  last_edited_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IT Assets table
CREATE TABLE public.it_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type asset_type NOT NULL DEFAULT 'other',
  asset_name TEXT NOT NULL,
  asset_code TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  assigned_to_employee_id UUID REFERENCES public.employees(id),
  location TEXT,
  status asset_status NOT NULL DEFAULT 'in_stock',
  license_expires_at DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_code)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.employees(id),
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'todo',
  project_name TEXT,
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Enable RLS on all tables
-- =============================================

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_end_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for HR tables
-- =============================================

-- Employees policies
CREATE POLICY "Users can view their own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- Attendance records policies
CREATE POLICY "Users can view their own attendance records" ON public.attendance_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = attendance_records.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can insert their own attendance records" ON public.attendance_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = attendance_records.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update their own attendance records" ON public.attendance_records FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = attendance_records.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete their own attendance records" ON public.attendance_records FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = attendance_records.employee_id AND employees.user_id = auth.uid()));

-- Paid leave balances policies
CREATE POLICY "Users can view their own paid leave balances" ON public.paid_leave_balances FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = paid_leave_balances.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can insert their own paid leave balances" ON public.paid_leave_balances FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = paid_leave_balances.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update their own paid leave balances" ON public.paid_leave_balances FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = paid_leave_balances.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete their own paid leave balances" ON public.paid_leave_balances FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = paid_leave_balances.employee_id AND employees.user_id = auth.uid()));

-- Payroll records policies
CREATE POLICY "Users can view their own payroll records" ON public.payroll_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = payroll_records.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can insert their own payroll records" ON public.payroll_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = payroll_records.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update their own payroll records" ON public.payroll_records FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = payroll_records.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete their own payroll records" ON public.payroll_records FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = payroll_records.employee_id AND employees.user_id = auth.uid()));

-- Year-end adjustments policies
CREATE POLICY "Users can view their own year-end adjustments" ON public.year_end_adjustments FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = year_end_adjustments.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can insert their own year-end adjustments" ON public.year_end_adjustments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = year_end_adjustments.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update their own year-end adjustments" ON public.year_end_adjustments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = year_end_adjustments.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete their own year-end adjustments" ON public.year_end_adjustments FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = year_end_adjustments.employee_id AND employees.user_id = auth.uid()));

-- =============================================
-- RLS Policies for CRM tables
-- =============================================

-- Leads policies
CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view their own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);

-- Sales targets policies
CREATE POLICY "Users can view their own sales targets" ON public.sales_targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales targets" ON public.sales_targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales targets" ON public.sales_targets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales targets" ON public.sales_targets FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Information Management tables
-- =============================================

-- Wiki pages policies
CREATE POLICY "Users can view their own wiki pages" ON public.wiki_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wiki pages" ON public.wiki_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wiki pages" ON public.wiki_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wiki pages" ON public.wiki_pages FOR DELETE USING (auth.uid() = user_id);

-- IT Assets policies
CREATE POLICY "Users can view their own IT assets" ON public.it_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own IT assets" ON public.it_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own IT assets" ON public.it_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own IT assets" ON public.it_assets FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Helper functions
-- =============================================

-- Generate employee number
CREATE OR REPLACE FUNCTION public.generate_employee_number(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.employees
  WHERE user_id = p_user_id;
  
  v_number := 'EMP-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_number;
END;
$$;

-- Generate asset code
CREATE OR REPLACE FUNCTION public.generate_asset_code(p_user_id UUID, p_asset_type asset_type)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_count INTEGER;
  v_code TEXT;
BEGIN
  CASE p_asset_type
    WHEN 'pc' THEN v_prefix := 'PC';
    WHEN 'mobile' THEN v_prefix := 'MOB';
    WHEN 'monitor' THEN v_prefix := 'MON';
    WHEN 'furniture' THEN v_prefix := 'FUR';
    WHEN 'software_license' THEN v_prefix := 'SW';
    ELSE v_prefix := 'OTH';
  END CASE;
  
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.it_assets
  WHERE user_id = p_user_id AND asset_type = p_asset_type;
  
  v_code := v_prefix || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_code;
END;
$$;