-- Fix security issues: Add RLS policies to publicly accessible views

-- 1. employees_public view - restrict to authenticated company members
DROP POLICY IF EXISTS "employees_public_select" ON public.employees;
CREATE POLICY "employees_public_authenticated_only"
ON public.employees FOR SELECT
TO authenticated
USING (
  public.is_company_member(auth.uid(), company_id)
);

-- 2. For the views, we need to ensure the base tables have proper RLS
-- The views use security_invoker, so RLS on base tables will apply

-- 3. members table - ensure proper RLS for members_safe view
DROP POLICY IF EXISTS "members_public_select" ON public.members;
DROP POLICY IF EXISTS "Members are viewable by company members" ON public.members;
CREATE POLICY "members_authenticated_company_only"
ON public.members FOR SELECT
TO authenticated
USING (
  public.is_company_member(auth.uid(), company_id)
);

-- 4. api_keys table - users can only see their own API keys
DROP POLICY IF EXISTS "api_keys_public_select" ON public.api_keys;
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;
CREATE POLICY "api_keys_own_only"
ON public.api_keys FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. contract_signatures table - only contract owners can view
DROP POLICY IF EXISTS "contract_signatures_public_select" ON public.contract_signatures;
DROP POLICY IF EXISTS "Contract signatures viewable by contract owner" ON public.contract_signatures;
CREATE POLICY "contract_signatures_owner_only"
ON public.contract_signatures FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = contract_id
    AND c.user_id = auth.uid()
  )
);

-- Ensure RLS is enabled on all these tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;