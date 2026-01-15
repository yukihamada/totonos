-- Drop the existing SECURITY DEFINER view and recreate as SECURITY INVOKER
DROP VIEW IF EXISTS public.employees_safe;

-- Recreate the view with SECURITY INVOKER (default) to use the caller's permissions
CREATE VIEW public.employees_safe WITH (security_invoker = true) AS
SELECT 
    id,
    user_id,
    company_id,
    employee_number,
    name,
    name_kana,
    email,
    phone,
    hire_date,
    resignation_date,
    employment_type,
    department,
    position,
    status,
    birth_date,
    created_at,
    updated_at,
    CASE
        WHEN public.has_hr_payroll_permission(company_id) THEN bank_account_number
        ELSE '****'::text
    END AS bank_account_number,
    CASE
        WHEN public.has_hr_payroll_permission(company_id) THEN bank_branch
        ELSE '****'::text
    END AS bank_branch,
    CASE
        WHEN public.has_hr_payroll_permission(company_id) THEN bank_name
        ELSE '****'::text
    END AS bank_name,
    CASE
        WHEN public.has_hr_payroll_permission(company_id) THEN bank_account_type
        ELSE '****'::text
    END AS bank_account_type,
    CASE
        WHEN public.has_hr_payroll_permission(company_id) THEN social_insurance_number
        ELSE '****'::text
    END AS social_insurance_number,
    CASE
        WHEN public.has_hr_payroll_permission(company_id) THEN base_salary
        ELSE NULL::numeric
    END AS base_salary
FROM public.employees;

-- Grant select access to authenticated users (RLS on employees table will be enforced)
GRANT SELECT ON public.employees_safe TO authenticated;