-- Drop existing functions first due to parameter name conflict
DROP FUNCTION IF EXISTS public.has_hr_payroll_permission(uuid);
DROP FUNCTION IF EXISTS public.has_member_admin_permission(uuid);

-- Create a safe view for employees that hides sensitive data
DROP VIEW IF EXISTS public.employees_safe;
CREATE VIEW public.employees_safe
WITH (security_invoker=on) AS
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

-- Create a function to check if user has HR payroll permission
CREATE FUNCTION public.has_hr_payroll_permission(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_permission boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM member_permissions mp
    JOIN company_members cm ON cm.id = mp.member_id
    WHERE cm.user_id = user_uuid
    AND mp.permission = 'hr_payroll'
  ) INTO has_permission;
  
  RETURN COALESCE(has_permission, false);
END;
$$;

-- Drop existing policies on employees
DROP POLICY IF EXISTS "employees_select" ON public.employees;
DROP POLICY IF EXISTS "employees_insert" ON public.employees;
DROP POLICY IF EXISTS "employees_update" ON public.employees;
DROP POLICY IF EXISTS "employees_delete" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees in their company" ON public.employees;
DROP POLICY IF EXISTS "Users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete employees" ON public.employees;

-- Create new RLS policies for employees
CREATE POLICY "employees_select_hr_payroll" ON public.employees
FOR SELECT USING (user_id = auth.uid() OR has_hr_payroll_permission(auth.uid()));

CREATE POLICY "employees_insert_hr_payroll" ON public.employees
FOR INSERT WITH CHECK (user_id = auth.uid() OR has_hr_payroll_permission(auth.uid()));

CREATE POLICY "employees_update_hr_payroll" ON public.employees
FOR UPDATE USING (user_id = auth.uid() OR has_hr_payroll_permission(auth.uid()));

CREATE POLICY "employees_delete_hr_payroll" ON public.employees
FOR DELETE USING (user_id = auth.uid() OR has_hr_payroll_permission(auth.uid()));

-- Create a safe view for members that hides sensitive data
DROP VIEW IF EXISTS public.members_safe;
CREATE VIEW public.members_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  company_id,
  member_number,
  name,
  name_kana,
  membership_type,
  status,
  join_date,
  expire_date,
  photo_url,
  notes,
  created_at,
  updated_at
FROM public.members;

-- Create a function to check if user has member management permission
CREATE FUNCTION public.has_member_admin_permission(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_permission boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.user_id = user_uuid
    AND cm.role IN ('owner', 'admin')
  ) INTO has_permission;
  
  RETURN COALESCE(has_permission, false);
END;
$$;

-- Drop existing policies on members
DROP POLICY IF EXISTS "members_select" ON public.members;
DROP POLICY IF EXISTS "members_insert" ON public.members;
DROP POLICY IF EXISTS "members_update" ON public.members;
DROP POLICY IF EXISTS "members_delete" ON public.members;
DROP POLICY IF EXISTS "Users can view members in their company" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members" ON public.members;
DROP POLICY IF EXISTS "Users can delete members" ON public.members;
DROP POLICY IF EXISTS "Company admins can view members" ON public.members;
DROP POLICY IF EXISTS "Company admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Company admins can update members" ON public.members;
DROP POLICY IF EXISTS "Company admins can delete members" ON public.members;

-- Create new RLS policies for members
CREATE POLICY "members_select_admin" ON public.members
FOR SELECT USING (has_member_admin_permission(auth.uid()));

CREATE POLICY "members_insert_admin" ON public.members
FOR INSERT WITH CHECK (has_member_admin_permission(auth.uid()));

CREATE POLICY "members_update_admin" ON public.members
FOR UPDATE USING (has_member_admin_permission(auth.uid()));

CREATE POLICY "members_delete_admin" ON public.members
FOR DELETE USING (has_member_admin_permission(auth.uid()));