-- 1. contract_signatures のRLSポリシー修正 (Critical)
-- 現在のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view signatures by token" ON public.contract_signatures;

-- 契約所有者のみ署名を閲覧可能に変更
CREATE POLICY "Contract owners can view their signatures" ON public.contract_signatures
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE contracts.id = contract_signatures.contract_id 
      AND contracts.user_id = auth.uid()
  )
);

-- 2. employees テーブル用の権限チェック関数
CREATE OR REPLACE FUNCTION public.has_hr_payroll_permission(p_company_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid() 
      AND cm.is_active = true
      AND (p_company_id IS NULL OR cm.company_id = p_company_id)
      AND (cm.role IN ('owner', 'admin') OR mp.permission = 'hr_payroll')
  )
$$;

-- 3. employees_safe ビュー作成（機密フィールドをマスク）
CREATE OR REPLACE VIEW public.employees_safe AS
SELECT 
  id, user_id, company_id, employee_number, name, name_kana, 
  email, phone, hire_date, resignation_date, 
  employment_type, department, position, status,
  birth_date, created_at, updated_at,
  -- 機密フィールドはマスク（HR権限がある場合のみ表示）
  CASE WHEN public.has_hr_payroll_permission(company_id) THEN bank_account_number ELSE '****' END as bank_account_number,
  CASE WHEN public.has_hr_payroll_permission(company_id) THEN bank_branch ELSE '****' END as bank_branch,
  CASE WHEN public.has_hr_payroll_permission(company_id) THEN bank_name ELSE '****' END as bank_name,
  CASE WHEN public.has_hr_payroll_permission(company_id) THEN bank_account_type ELSE '****' END as bank_account_type,
  CASE WHEN public.has_hr_payroll_permission(company_id) THEN social_insurance_number ELSE '****' END as social_insurance_number,
  CASE WHEN public.has_hr_payroll_permission(company_id) THEN base_salary ELSE NULL END as base_salary
FROM public.employees;

-- 4. member_permissions の閲覧制限強化 (Medium)
DROP POLICY IF EXISTS "Members can view permissions in same company" ON public.member_permissions;

CREATE POLICY "Admins can view permissions" ON public.member_permissions
FOR SELECT USING (
  member_id IN (
    SELECT cm.id FROM public.company_members cm
    WHERE cm.company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  )
);

-- 5. API Key 監査ログテーブル作成 (Low)
CREATE TABLE IF NOT EXISTS public.api_key_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLSを有効化
ALTER TABLE public.api_key_audit_log ENABLE ROW LEVEL SECURITY;

-- 監査ログは管理者のみ閲覧可能
CREATE POLICY "Only admins can view audit logs" ON public.api_key_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
  )
);

-- 監査ログ付きのvalidate_api_key関数に更新
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key_hash text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id
  FROM public.api_keys
  WHERE key_hash = p_key_hash;
  
  -- 監査ログ記録（成功/失敗両方）
  INSERT INTO public.api_key_audit_log (key_hash, user_id, action)
  VALUES (
    p_key_hash, 
    v_user_id, 
    CASE WHEN v_user_id IS NOT NULL THEN 'validate_success' ELSE 'validate_failed' END
  );
  
  RETURN v_user_id;
END;
$$;