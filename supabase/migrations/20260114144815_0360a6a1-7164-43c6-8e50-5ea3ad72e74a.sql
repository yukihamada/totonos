-- Create a security definer function to check if user is a member of a company
CREATE OR REPLACE FUNCTION public.is_company_member(p_user_id uuid, p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = p_user_id
      AND company_id = p_company_id
      AND is_active = true
  )
$$;

-- Create a security definer function to check if user is owner/admin of a company
CREATE OR REPLACE FUNCTION public.is_company_admin(p_user_id uuid, p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = p_user_id
      AND company_id = p_company_id
      AND is_active = true
      AND role IN ('owner', 'admin')
  )
$$;

-- Drop existing problematic policies on company_members
DROP POLICY IF EXISTS "Users can view members of their companies" ON public.company_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.company_members;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.company_members;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view their own membership"
ON public.company_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view members of same company"
ON public.company_members
FOR SELECT
USING (
  public.is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Admins can insert members"
ON public.company_members
FOR INSERT
WITH CHECK (
  public.is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Admins can update members"
ON public.company_members
FOR UPDATE
USING (
  public.is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Admins can delete members"
ON public.company_members
FOR DELETE
USING (
  public.is_company_admin(auth.uid(), company_id)
);