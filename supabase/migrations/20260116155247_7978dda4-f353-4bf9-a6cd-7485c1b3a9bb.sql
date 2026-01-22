-- 1. ランダムなメールプレフィックスを生成する関数
CREATE OR REPLACE FUNCTION public.generate_random_email_prefix()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- 8文字のランダム文字列を生成
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. 会社作成時に自動でデフォルトメールアドレスを作成するトリガー
CREATE OR REPLACE FUNCTION public.create_default_company_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  random_prefix TEXT;
BEGIN
  -- ランダムなプレフィックスを生成
  random_prefix := public.generate_random_email_prefix();
  
  -- デフォルトのメールアドレス設定を作成
  INSERT INTO public.company_email_addresses (
    company_id,
    address_prefix,
    purpose,
    display_name,
    is_active,
    ai_processing_enabled,
    notify_mode
  ) VALUES (
    NEW.id,
    random_prefix,
    'general',
    'Minato (ミナト)',
    true,
    true,
    'all_members'
  );
  
  RETURN NEW;
END;
$$;

-- トリガーを作成
DROP TRIGGER IF EXISTS create_default_company_email_trigger ON public.companies;
CREATE TRIGGER create_default_company_email_trigger
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_company_email();

-- 3. メールアドレス承認リクエスト用のテーブル
CREATE TABLE IF NOT EXISTS public.email_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  inbound_email_id UUID REFERENCES public.inbound_emails(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  from_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view verification requests"
ON public.email_verification_requests FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

CREATE POLICY "Admins can update verification requests"
ON public.email_verification_requests FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.is_active = true
    AND cm.role IN ('owner', 'admin')
  )
);

CREATE INDEX IF NOT EXISTS idx_email_verification_requests_company 
ON public.email_verification_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_email_verification_requests_email 
ON public.email_verification_requests(from_email);

-- 4. 会社統合リクエスト用のテーブル
CREATE TABLE IF NOT EXISTS public.company_merge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  target_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  confirmation_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_companies CHECK (source_company_id != target_company_id)
);

ALTER TABLE public.company_merge_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view merge requests"
ON public.company_merge_requests FOR SELECT
TO authenticated
USING (
  source_company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = true
  )
  OR target_company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = true
  )
);

CREATE POLICY "Owners can create merge requests"
ON public.company_merge_requests FOR INSERT
TO authenticated
WITH CHECK (
  source_company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = true
  )
);

CREATE POLICY "Owners can update merge requests"
ON public.company_merge_requests FOR UPDATE
TO authenticated
USING (
  target_company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = true
  )
);

-- 5. LINE連携にcompany_idを追加
ALTER TABLE public.line_users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_users' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_line_users_company ON public.line_users(company_id); END IF; END $$;

-- 6. 既存の会社にデフォルトメールアドレスがない場合に作成 (only if notify_mode column exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_email_addresses' AND column_name = 'notify_mode' AND table_schema = 'public') THEN
    INSERT INTO public.company_email_addresses (company_id, address_prefix, purpose, display_name, is_active, ai_processing_enabled, notify_mode)
    SELECT
      c.id,
      public.generate_random_email_prefix(),
      'general',
      'Minato (ミナト)',
      true,
      true,
      'all_members'
    FROM public.companies c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.company_email_addresses cea
      WHERE cea.company_id = c.id
    );
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_email_addresses' AND table_schema = 'public') THEN
    INSERT INTO public.company_email_addresses (company_id, address_prefix, purpose, display_name, is_active, ai_processing_enabled)
    SELECT
      c.id,
      public.generate_random_email_prefix(),
      'general',
      'Minato (ミナト)',
      true,
      true
    FROM public.companies c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.company_email_addresses cea
      WHERE cea.company_id = c.id
    );
  END IF;
END $$;

-- 7. companiesテーブルに認証済みメールアドレスを保存
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified_email_addresses TEXT[] DEFAULT '{}';

-- 8. updated_atトリガー
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_email_verification_requests_updated_at ON public.email_verification_requests;
CREATE TRIGGER update_email_verification_requests_updated_at
  BEFORE UPDATE ON public.email_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();