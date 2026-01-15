
-- 1. API Keys: Create secure view that hides key_hash (already exists api_keys_safe view, but need to restrict base table access)
-- Drop existing policies on api_keys and create stricter ones
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;

-- Create policy that denies direct SELECT access - force use of api_keys_safe view
CREATE POLICY "No direct select on api_keys"
ON public.api_keys FOR SELECT
TO authenticated
USING (false);

-- Keep INSERT/UPDATE/DELETE policies as they are needed for management
-- but key_hash should never be returned in SELECT results

-- 2. Employees: Create secure view for sensitive data
-- First, check if employees_safe view exists and recreate it
DROP VIEW IF EXISTS public.employees_public;

-- Create a public-facing view that excludes sensitive fields
CREATE VIEW public.employees_public
WITH (security_invoker=on) AS
SELECT 
  id,
  employee_number,
  name,
  name_kana,
  email,
  phone,
  department,
  position,
  employment_type,
  hire_date,
  resignation_date,
  status,
  company_id,
  user_id,
  created_at,
  updated_at
  -- Excludes: birth_date, bank_account_number, bank_account_type, bank_branch, 
  -- bank_name, base_salary, social_insurance_number
FROM public.employees;

-- Create a separate table for highly sensitive employee data with stricter access
CREATE TABLE IF NOT EXISTS public.employee_sensitive_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL UNIQUE,
  birth_date date,
  bank_name text,
  bank_branch text,
  bank_account_type text,
  bank_account_number text,
  base_salary numeric,
  social_insurance_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on sensitive data table
ALTER TABLE public.employee_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Only HR/Admin with payroll permission can access sensitive data
CREATE POLICY "HR payroll can view sensitive employee data"
ON public.employee_sensitive_data FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN company_members cm ON cm.company_id = e.company_id
    LEFT JOIN member_permissions mp ON mp.member_id = cm.id
    WHERE e.id = employee_sensitive_data.employee_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND (
      cm.role IN ('owner', 'admin')
      OR mp.permission IN ('admin', 'hr_payroll')
    )
  )
);

CREATE POLICY "HR payroll can insert sensitive employee data"
ON public.employee_sensitive_data FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN company_members cm ON cm.company_id = e.company_id
    LEFT JOIN member_permissions mp ON mp.member_id = cm.id
    WHERE e.id = employee_sensitive_data.employee_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND (
      cm.role IN ('owner', 'admin')
      OR mp.permission IN ('admin', 'hr_payroll')
    )
  )
);

CREATE POLICY "HR payroll can update sensitive employee data"
ON public.employee_sensitive_data FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN company_members cm ON cm.company_id = e.company_id
    LEFT JOIN member_permissions mp ON mp.member_id = cm.id
    WHERE e.id = employee_sensitive_data.employee_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND (
      cm.role IN ('owner', 'admin')
      OR mp.permission IN ('admin', 'hr_payroll')
    )
  )
);

CREATE POLICY "HR payroll can delete sensitive employee data"
ON public.employee_sensitive_data FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN company_members cm ON cm.company_id = e.company_id
    LEFT JOIN member_permissions mp ON mp.member_id = cm.id
    WHERE e.id = employee_sensitive_data.employee_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND (
      cm.role IN ('owner', 'admin')
      OR mp.permission IN ('admin', 'hr_payroll')
    )
  )
);

-- Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_employee_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sensitive_data_audit_log (
    user_id,
    company_id,
    table_name,
    record_id,
    action,
    accessed_at
  )
  SELECT 
    auth.uid(),
    e.company_id,
    'employee_sensitive_data',
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    now()
  FROM employees e
  WHERE e.id = CASE WHEN TG_OP = 'DELETE' THEN OLD.employee_id ELSE NEW.employee_id END;
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_sensitive_employee_access ON public.employee_sensitive_data;
CREATE TRIGGER audit_sensitive_employee_access
AFTER INSERT OR UPDATE OR DELETE ON public.employee_sensitive_data
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_employee_access();
