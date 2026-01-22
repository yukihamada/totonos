-- Recreate safe views with security_invoker=on to inherit base table RLS

-- employees_public view - recreate with security_invoker (drop only if exists to avoid issues)
DROP VIEW IF EXISTS public.employees_public;
CREATE VIEW public.employees_public
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  company_id,
  employee_number,
  name,
  name_kana,
  department,
  position,
  employment_type,
  status,
  hire_date,
  resignation_date,
  created_at,
  updated_at
FROM public.employees;

-- api_keys_safe view - recreate with security_invoker
DROP VIEW IF EXISTS public.api_keys_safe;
CREATE VIEW public.api_keys_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  name,
  key_prefix,
  scopes,
  last_used_at,
  request_count,
  created_at,
  updated_at
FROM public.api_keys;

-- contract_signatures_safe view - recreate with correct column names
DROP VIEW IF EXISTS public.contract_signatures_safe;
CREATE VIEW public.contract_signatures_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  contract_id,
  signatory_type,
  signatory_name,
  signatory_email,
  signed_at,
  created_at
FROM public.contract_signatures;