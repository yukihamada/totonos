-- Fix infinite recursion: remove self-referencing policy on company_members
DROP POLICY IF EXISTS "company_members_select_same_company" ON company_members;
DROP POLICY IF EXISTS "company_members_select_own" ON company_members;

-- Recreate SELECT policy using SECURITY DEFINER function (no self-join in policy)
CREATE POLICY "company_members_select" ON company_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_company_member(auth.uid(), company_id)
  );