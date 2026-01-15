-- 会社メンバー全員を取得する関数
CREATE OR REPLACE FUNCTION public.get_company_members_by_company(p_company_id uuid)
RETURNS TABLE(user_id uuid) AS $$
  SELECT cm.user_id FROM public.company_members cm
  WHERE cm.company_id = p_company_id AND cm.is_active = true
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;