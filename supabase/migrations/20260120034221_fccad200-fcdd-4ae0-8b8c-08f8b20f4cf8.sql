-- Issue #13 Fix: RLS無限再帰の修正
-- user_roles テーブルの "Admins can manage roles" ポリシーが自己参照による無限再帰を起こしている

-- 1. セキュリティ定義関数を作成（無限再帰を防ぐ）
CREATE OR REPLACE FUNCTION public.is_company_admin_via_roles(p_user_id uuid, p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
      AND company_id = p_company_id
      AND role = 'admin'
  )
$$;

-- 2. 問題のポリシーを削除
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 3. 新しいポリシーを作成（関数を使用して無限再帰を防ぐ）
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_company_admin_via_roles(auth.uid(), company_id))
WITH CHECK (public.is_company_admin_via_roles(auth.uid(), company_id));