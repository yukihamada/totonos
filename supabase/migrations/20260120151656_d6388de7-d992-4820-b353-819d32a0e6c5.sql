-- =============================================
-- セキュリティ強化マイグレーション (修正版)
-- =============================================

-- 1. EMR患者データへのアクセス制限
DROP POLICY IF EXISTS "Company members can view patients" ON public.emr_patients;
DROP POLICY IF EXISTS "Company members can insert patients" ON public.emr_patients;
DROP POLICY IF EXISTS "Company members can update patients" ON public.emr_patients;
DROP POLICY IF EXISTS "Company admins can delete patients" ON public.emr_patients;

CREATE OR REPLACE FUNCTION public.has_medical_permission(p_user_id uuid, p_company_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = p_user_id AND cm.company_id = p_company_id AND cm.is_active = true
      AND (cm.role IN ('owner', 'admin') OR mp.permission IN ('admin', 'hr_edit', 'hr_payroll'))
  )
$$;

CREATE POLICY "Medical staff can view patients" ON public.emr_patients FOR SELECT USING (public.has_medical_permission(auth.uid(), company_id));
CREATE POLICY "Medical staff can insert patients" ON public.emr_patients FOR INSERT WITH CHECK (public.has_medical_permission(auth.uid(), company_id));
CREATE POLICY "Medical staff can update patients" ON public.emr_patients FOR UPDATE USING (public.has_medical_permission(auth.uid(), company_id));
CREATE POLICY "Admins can delete patients" ON public.emr_patients FOR DELETE USING (public.is_company_admin(auth.uid(), company_id));

-- 2. members テーブル (owner/admin のみ) - only if table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can view members of their company" ON public.members;
    DROP POLICY IF EXISTS "Users can create members in their company" ON public.members;
    DROP POLICY IF EXISTS "Users can update members in their company" ON public.members;
    DROP POLICY IF EXISTS "Users can delete members in their company" ON public.members;

    CREATE POLICY "Admins can view members" ON public.members FOR SELECT USING (public.is_company_admin(auth.uid(), company_id));
    CREATE POLICY "Admins can create members" ON public.members FOR INSERT WITH CHECK (public.is_company_admin(auth.uid(), company_id));
    CREATE POLICY "Admins can update members" ON public.members FOR UPDATE USING (public.is_company_admin(auth.uid(), company_id));
    CREATE POLICY "Admins can delete members" ON public.members FOR DELETE USING (public.is_company_admin(auth.uid(), company_id));
  END IF;
END $$;

-- 3. inbound_emails 強化
DROP POLICY IF EXISTS "Managers can view company emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Managers can update company emails" ON public.inbound_emails;

CREATE POLICY "Admins can view all company emails" ON public.inbound_emails FOR SELECT
USING (company_id IN (SELECT ur.company_id FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "Admins can update all company emails" ON public.inbound_emails FOR UPDATE
USING (company_id IN (SELECT ur.company_id FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- 4. 重複ポリシー削除
DROP POLICY IF EXISTS "Users can view their own contract signatures" ON public.contract_signatures;
DROP POLICY IF EXISTS "Users can insert their own contract signatures" ON public.contract_signatures;

-- 5. anon アクセス取り消し
REVOKE ALL ON public.api_keys_safe FROM anon;
REVOKE ALL ON public.employees_public FROM anon;