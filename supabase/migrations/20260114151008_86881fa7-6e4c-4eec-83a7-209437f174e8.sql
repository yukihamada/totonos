-- Fix companies table RLS policies to use security definer functions instead of subqueries
DROP POLICY IF EXISTS "Company owners and admins can update" ON companies;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON companies;

-- SELECT: Use security definer function or creator check
CREATE POLICY "companies_select" ON companies
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_company_member(auth.uid(), id)
  );

-- UPDATE: Use security definer function for admin check
CREATE POLICY "companies_update_admin" ON companies
  FOR UPDATE
  USING (is_company_admin(auth.uid(), id));

-- Also fix company_invitations to avoid auth.users access
DROP POLICY IF EXISTS "Admins can update invitations" ON company_invitations;
DROP POLICY IF EXISTS "Members can view invitations in same company" ON company_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON company_invitations;

-- Recreate company_invitations policies using security definer functions
CREATE POLICY "company_invitations_select" ON company_invitations
  FOR SELECT
  USING (is_company_member(auth.uid(), company_id));

CREATE POLICY "company_invitations_insert" ON company_invitations
  FOR INSERT
  WITH CHECK (is_company_admin(auth.uid(), company_id));

CREATE POLICY "company_invitations_update" ON company_invitations
  FOR UPDATE
  USING (is_company_admin(auth.uid(), company_id));

CREATE POLICY "company_invitations_delete" ON company_invitations
  FOR DELETE
  USING (is_company_admin(auth.uid(), company_id));

-- Fix company_credits policies too
DROP POLICY IF EXISTS "Admins can manage company credits" ON company_credits;
DROP POLICY IF EXISTS "Members can view company credits" ON company_credits;

CREATE POLICY "company_credits_select" ON company_credits
  FOR SELECT
  USING (is_company_member(auth.uid(), company_id));

CREATE POLICY "company_credits_update" ON company_credits
  FOR UPDATE
  USING (is_company_admin(auth.uid(), company_id));