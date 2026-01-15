-- Fix 1: Drop and recreate employees_safe view without sensitive fields
DROP VIEW IF EXISTS public.employees_safe;

CREATE VIEW public.employees_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  company_id,
  employee_number,
  name,
  name_kana,
  email,
  phone,
  department,
  position,
  employment_type,
  status,
  hire_date,
  resignation_date,
  created_at,
  updated_at
FROM public.employees;
-- Note: Excluded sensitive fields: birth_date, base_salary, bank_name, bank_branch, bank_account_type, bank_account_number, social_insurance_number

-- Fix 2: Add rate limiting function for client data access
CREATE OR REPLACE FUNCTION public.log_client_access(p_user_id uuid, p_client_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.data_access_audit_log (
    user_id,
    table_name,
    operation,
    record_id,
    record_count,
    created_at
  ) VALUES (
    p_user_id,
    'clients',
    'SELECT',
    p_client_id,
    1,
    now()
  );
END;
$$;

-- Fix 3: Add company-level isolation to attendance_records RLS
-- First drop existing policies
DROP POLICY IF EXISTS "Users can view attendance of their employees" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can insert attendance for their employees" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can update attendance of their employees" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can delete attendance of their employees" ON public.attendance_records;

-- Recreate with company-level isolation
CREATE POLICY "Users can view attendance of their employees"
ON public.attendance_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance_records.employee_id
    AND (
      e.user_id = auth.uid() 
      OR (
        e.company_id IS NOT NULL 
        AND public.is_company_member(auth.uid(), e.company_id)
      )
    )
  )
);

CREATE POLICY "Users can insert attendance for their employees"
ON public.attendance_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance_records.employee_id
    AND (
      e.user_id = auth.uid() 
      OR (
        e.company_id IS NOT NULL 
        AND public.is_company_member(auth.uid(), e.company_id)
      )
    )
  )
);

CREATE POLICY "Users can update attendance of their employees"
ON public.attendance_records FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance_records.employee_id
    AND (
      e.user_id = auth.uid() 
      OR (
        e.company_id IS NOT NULL 
        AND public.is_company_member(auth.uid(), e.company_id)
      )
    )
  )
);

CREATE POLICY "Users can delete attendance of their employees"
ON public.attendance_records FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance_records.employee_id
    AND (
      e.user_id = auth.uid() 
      OR (
        e.company_id IS NOT NULL 
        AND public.is_company_member(auth.uid(), e.company_id)
      )
    )
  )
);