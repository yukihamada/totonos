-- ============================================
-- マルチ会社・チーム・権限・クレジット管理システム
-- ============================================

-- 1. 権限タイプ (カスタム権限用)
CREATE TYPE public.permission_type AS ENUM (
  'invoices_view', 'invoices_create', 'invoices_edit', 'invoices_delete',
  'contracts_view', 'contracts_create', 'contracts_edit', 'contracts_delete', 'contracts_sign',
  'crm_view', 'crm_create', 'crm_edit', 'crm_delete',
  'hr_view', 'hr_create', 'hr_edit', 'hr_delete', 'hr_payroll',
  'accounting_view', 'accounting_create', 'accounting_edit', 'accounting_delete',
  'wiki_view', 'wiki_create', 'wiki_edit', 'wiki_delete',
  'it_assets_view', 'it_assets_create', 'it_assets_edit', 'it_assets_delete',
  'settings_view', 'settings_edit',
  'team_view', 'team_invite', 'team_edit', 'team_remove',
  'credits_view', 'credits_purchase', 'credits_manage',
  'admin'
);

-- 2. メンバーシップロール
CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- 3. 招待ステータス
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- ============================================
-- 会社テーブル
-- ============================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  industry TEXT,
  employee_count TEXT,
  fiscal_year_start_month INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================
-- 会社クレジット (会社単位のクレジットプール)
-- ============================================
CREATE TABLE public.company_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_credits INTEGER NOT NULL DEFAULT 100,
  charged_credits INTEGER NOT NULL DEFAULT 0,
  used_this_month INTEGER NOT NULL DEFAULT 0,
  current_period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  current_period_end DATE NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- ============================================
-- ユーザークレジット (個人クレジット)
-- ============================================
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_credits INTEGER NOT NULL DEFAULT 100,
  charged_credits INTEGER NOT NULL DEFAULT 0,
  used_this_month INTEGER NOT NULL DEFAULT 0,
  current_period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  current_period_end DATE NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- クレジットトランザクションログ
-- ============================================
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'grant', 'consume', 'charge', 'refund', 'referral', 'transfer'
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  action TEXT, -- e.g., 'ai_chat', 'pdf', etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 会社メンバーシップ
-- ============================================
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- ============================================
-- カスタム権限テーブル
-- ============================================
CREATE TABLE public.member_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.company_members(id) ON DELETE CASCADE,
  permission permission_type NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(member_id, permission)
);

-- ============================================
-- 会社招待
-- ============================================
CREATE TABLE public.company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role member_role NOT NULL DEFAULT 'member',
  permissions permission_type[] DEFAULT '{}',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ユーザー現在の会社選択
-- ============================================
CREATE TABLE public.user_current_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- RLSポリシー
-- ============================================

-- Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies they belong to"
ON public.companies FOR SELECT
USING (
  id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND is_active = true)
  OR created_by = auth.uid()
);

CREATE POLICY "Users can create companies"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Company owners and admins can update"
ON public.companies FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

-- Company Credits
ALTER TABLE public.company_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view company credits"
ON public.company_credits FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can manage company credits"
ON public.company_credits FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

-- User Credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
ON public.user_credits FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own credits"
ON public.user_credits FOR ALL
USING (user_id = auth.uid());

-- Credit Transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.credit_transactions FOR SELECT
USING (
  user_id = auth.uid() 
  OR company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "System can insert transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Company Members
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view other members in same company"
ON public.company_members FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can manage members"
ON public.company_members FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

CREATE POLICY "Users can insert their own membership"
ON public.company_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Member Permissions
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view permissions in same company"
ON public.member_permissions FOR SELECT
USING (
  member_id IN (
    SELECT cm.id FROM public.company_members cm 
    WHERE cm.company_id IN (
      SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

CREATE POLICY "Admins can manage permissions"
ON public.member_permissions FOR ALL
USING (
  member_id IN (
    SELECT cm.id FROM public.company_members cm 
    WHERE cm.company_id IN (
      SELECT company_id FROM public.company_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  )
);

-- Company Invitations
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invitations in same company"
ON public.company_invitations FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND is_active = true)
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can create invitations"
ON public.company_invitations FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

CREATE POLICY "Admins can update invitations"
ON public.company_invitations FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- User Current Company
ALTER TABLE public.user_current_company ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own current company"
ON public.user_current_company FOR ALL
USING (user_id = auth.uid());

-- ============================================
-- 自動更新トリガー
-- ============================================
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_credits_updated_at
BEFORE UPDATE ON public.company_credits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at
BEFORE UPDATE ON public.company_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 会社作成時に自動的にオーナーを追加する関数
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 作成者をオーナーとして追加
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  -- 会社クレジットを初期化
  INSERT INTO public.company_credits (company_id)
  VALUES (NEW.id);
  
  -- 現在の会社として設定
  INSERT INTO public.user_current_company (user_id, company_id)
  VALUES (NEW.created_by, NEW.id)
  ON CONFLICT (user_id) DO UPDATE SET company_id = NEW.id, updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created
AFTER INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();

-- ============================================
-- ユーザー登録時に個人クレジットを初期化
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- ============================================
-- 権限チェック関数
-- ============================================
CREATE OR REPLACE FUNCTION public.has_permission(
  p_user_id UUID, 
  p_company_id UUID, 
  p_permission permission_type
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = p_user_id 
      AND cm.company_id = p_company_id 
      AND cm.is_active = true
      AND (
        cm.role = 'owner' -- オーナーは全権限
        OR cm.role = 'admin' -- 管理者も全権限
        OR mp.permission = p_permission
        OR mp.permission = 'admin'
      )
  )
$$;

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_company_members_user ON public.company_members(user_id);
CREATE INDEX idx_company_members_company ON public.company_members(company_id);
CREATE INDEX idx_member_permissions_member ON public.member_permissions(member_id);
CREATE INDEX idx_company_invitations_token ON public.company_invitations(token);
CREATE INDEX idx_company_invitations_email ON public.company_invitations(email);
CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_company ON public.credit_transactions(company_id);
CREATE INDEX idx_user_current_company_user ON public.user_current_company(user_id);