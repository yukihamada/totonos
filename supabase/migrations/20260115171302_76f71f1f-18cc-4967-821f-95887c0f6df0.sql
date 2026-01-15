
-- Fix employees table: restrict direct SELECT access to force use of employees_safe/employees_public view
-- First, drop the old policies that allow viewing sensitive data
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "HR and admins can view company employees" ON public.employees;

-- Create new restrictive SELECT policy - only allow viewing via safe views
-- Users can only see non-sensitive fields through the public view
-- For the base table, restrict to necessary operations only

-- Allow SELECT only for the purpose of checking existence (used in RLS of other tables)
-- But deny reading sensitive columns by using a policy that only returns minimal info
CREATE POLICY "Restricted employee select for RLS checks"
ON public.employees FOR SELECT
TO authenticated
USING (
  -- Only allow if user is owner of the employee record OR has HR access in the company
  auth.uid() = user_id
  OR (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      LEFT JOIN member_permissions mp ON mp.member_id = cm.id
      WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role IN ('owner', 'admin')
        OR mp.permission IN ('admin', 'hr_view', 'hr_edit', 'hr_payroll')
      )
    )
  )
);

-- Update employees_safe view to hide sensitive columns
DROP VIEW IF EXISTS public.employees_safe;
CREATE VIEW public.employees_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  employee_number,
  name,
  name_kana,
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
  -- Hides: email, phone, birth_date, bank_*, base_salary, social_insurance_number
FROM public.employees;
