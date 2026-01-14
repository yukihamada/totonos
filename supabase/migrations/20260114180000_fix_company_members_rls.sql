-- ============================================
-- Fix infinite recursion in company_members RLS policies
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view other members in same company" ON public.company_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.company_members;

-- Create a helper function that bypasses RLS to check membership
-- This prevents infinite recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_company_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_members
  WHERE user_id = p_user_id AND is_active = true;
$$;

-- Create a helper function to check if user is admin/owner of a company
CREATE OR REPLACE FUNCTION public.is_company_admin(p_user_id UUID, p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = p_user_id
      AND company_id = p_company_id
      AND role IN ('owner', 'admin')
      AND is_active = true
  );
$$;

-- Recreate policies using helper functions (no recursion)

-- SELECT: Members can view other members in same company
CREATE POLICY "Members can view other members in same company"
ON public.company_members FOR SELECT
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  OR user_id = auth.uid()  -- Users can always see their own memberships
);

-- INSERT: Users can insert their own membership (for accepting invitations)
CREATE POLICY "Users can insert their own membership"
ON public.company_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: Admins can update members, or users can update their own record (for leaving)
CREATE POLICY "Admins can update members"
ON public.company_members FOR UPDATE
USING (
  public.is_company_admin(auth.uid(), company_id)
  OR user_id = auth.uid()
);

-- DELETE: Only admins can delete members (but not themselves if owner)
CREATE POLICY "Admins can delete members"
ON public.company_members FOR DELETE
USING (
  public.is_company_admin(auth.uid(), company_id)
  AND NOT (user_id = auth.uid() AND role = 'owner')  -- Owners can't delete themselves
);

-- ============================================
-- Also fix other policies that reference company_members
-- ============================================

-- Fix companies policies
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Company owners and admins can update" ON public.companies;

CREATE POLICY "Users can view companies they belong to"
ON public.companies FOR SELECT
USING (
  id IN (SELECT public.get_user_company_ids(auth.uid()))
  OR created_by = auth.uid()
);

CREATE POLICY "Company owners and admins can update"
ON public.companies FOR UPDATE
USING (
  public.is_company_admin(auth.uid(), id)
);

-- Fix company_credits policies
DROP POLICY IF EXISTS "Members can view company credits" ON public.company_credits;
DROP POLICY IF EXISTS "Admins can manage company credits" ON public.company_credits;

CREATE POLICY "Members can view company credits"
ON public.company_credits FOR SELECT
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
);

CREATE POLICY "Admins can manage company credits"
ON public.company_credits FOR ALL
USING (
  public.is_company_admin(auth.uid(), company_id)
);

-- Fix credit_transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;

CREATE POLICY "Users can view own transactions"
ON public.credit_transactions FOR SELECT
USING (
  user_id = auth.uid()
  OR company_id IN (SELECT public.get_user_company_ids(auth.uid()))
);

-- Fix company_invitations policies
DROP POLICY IF EXISTS "Members can view invitations in same company" ON public.company_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.company_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.company_invitations;

CREATE POLICY "Members can view invitations in same company"
ON public.company_invitations FOR SELECT
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can create invitations"
ON public.company_invitations FOR INSERT
WITH CHECK (
  public.is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Admins can update invitations"
ON public.company_invitations FOR UPDATE
USING (
  public.is_company_admin(auth.uid(), company_id)
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Fix member_permissions policies
DROP POLICY IF EXISTS "Members can view permissions in same company" ON public.member_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.member_permissions;

CREATE POLICY "Members can view permissions in same company"
ON public.member_permissions FOR SELECT
USING (
  member_id IN (
    SELECT cm.id FROM public.company_members cm
    WHERE cm.company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  )
);

CREATE POLICY "Admins can manage permissions"
ON public.member_permissions FOR ALL
USING (
  member_id IN (
    SELECT cm.id FROM public.company_members cm
    WHERE public.is_company_admin(auth.uid(), cm.company_id)
  )
);

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_company_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_admin(UUID, UUID) TO authenticated;
