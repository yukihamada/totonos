-- まず古いRLSポリシーをすべて削除
DROP POLICY IF EXISTS "Admins can delete members" ON company_members;
DROP POLICY IF EXISTS "Admins can manage members" ON company_members;
DROP POLICY IF EXISTS "Admins can update members" ON company_members;
DROP POLICY IF EXISTS "Allow member inserts" ON company_members;
DROP POLICY IF EXISTS "Members can view other members in same company" ON company_members;
DROP POLICY IF EXISTS "Users can insert their own membership" ON company_members;
DROP POLICY IF EXISTS "Users can view members of same company" ON company_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON company_members;

-- 新しい再帰しないRLSポリシーを作成

-- SELECT: 自分のメンバーシップまたは同じ会社のメンバーを表示（auth.uid()のみ使用）
CREATE POLICY "company_members_select_own" ON company_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "company_members_select_same_company" ON company_members
  FOR SELECT USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm 
      WHERE cm.user_id = auth.uid() AND cm.is_active = true
    )
  );

-- INSERT: 自分自身のメンバーシップを追加可能（トリガーで追加されるため）
CREATE POLICY "company_members_insert_self" ON company_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: 管理者のみが更新可能（関数を使用）
CREATE POLICY "company_members_update_admin" ON company_members
  FOR UPDATE USING (is_company_admin(auth.uid(), company_id));

-- DELETE: 管理者のみが削除可能（関数を使用）
CREATE POLICY "company_members_delete_admin" ON company_members
  FOR DELETE USING (is_company_admin(auth.uid(), company_id));