
-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'manager', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view roles in their company
CREATE POLICY "Users can view roles in their company"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = user_roles.company_id
    AND ur.role = 'admin'
  )
);

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _company_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role = _role
  )
$$;

-- Create function to check if user has HR or Admin role
CREATE OR REPLACE FUNCTION public.has_hr_access(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role IN ('admin', 'hr')
  )
$$;

-- Drop existing payroll_records policies
DROP POLICY IF EXISTS "Users can view their own payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Users can insert their own payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Users can update their own payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Users can delete their own payroll records" ON public.payroll_records;

-- Create stricter payroll_records policies
-- Users can only view their own payroll records
CREATE POLICY "Users can view their own payroll records"
ON public.payroll_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = payroll_records.employee_id 
    AND e.user_id = auth.uid()
  )
);

-- HR/Admin can view all payroll records in their company (with audit trail)
CREATE POLICY "HR can view company payroll records"
ON public.payroll_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = payroll_records.employee_id
    AND e.company_id IN (
      SELECT ur.company_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Only HR/Admin can insert payroll records
CREATE POLICY "HR can insert payroll records"
ON public.payroll_records FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = payroll_records.employee_id
    AND e.company_id IN (
      SELECT ur.company_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Only HR/Admin can update payroll records
CREATE POLICY "HR can update payroll records"
ON public.payroll_records FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = payroll_records.employee_id
    AND e.company_id IN (
      SELECT ur.company_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Only HR/Admin can delete payroll records
CREATE POLICY "HR can delete payroll records"
ON public.payroll_records FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = payroll_records.employee_id
    AND e.company_id IN (
      SELECT ur.company_id FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Drop existing inbound_emails policies
DROP POLICY IF EXISTS "Company members can view their inbound emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Company members can update their inbound emails" ON public.inbound_emails;

-- Create stricter inbound_emails policies
-- Users can only view emails assigned to them
CREATE POLICY "Users can view assigned emails"
ON public.inbound_emails FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
);

-- Admin/Managers can view all emails in their company
CREATE POLICY "Managers can view company emails"
ON public.inbound_emails FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT ur.company_id FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'manager', 'hr')
  )
);

-- Users can update emails assigned to them
CREATE POLICY "Users can update assigned emails"
ON public.inbound_emails FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid()
);

-- Managers can update company emails
CREATE POLICY "Managers can update company emails"
ON public.inbound_emails FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT ur.company_id FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'manager')
  )
);

-- Create audit log for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.sensitive_data_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.sensitive_data_audit_log FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT ur.company_id FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.sensitive_data_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);
