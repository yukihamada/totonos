-- ============================================
-- 受信メール管理テーブル
-- ============================================

-- 受信メールテーブル
CREATE TABLE IF NOT EXISTS public.inbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- メールヘッダー情報
  message_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  reply_to TEXT,
  subject TEXT,

  -- メール本文
  text_body TEXT,
  html_body TEXT,

  -- 添付ファイル
  attachments JSONB DEFAULT '[]',

  -- メタデータ
  headers JSONB DEFAULT '{}',
  raw_payload JSONB,

  -- 処理状態
  status TEXT NOT NULL DEFAULT 'received', -- received, processed, failed, archived
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- 関連付け
  related_type TEXT, -- lead, deal, client, invoice, contract, etc.
  related_id UUID,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- タグとフラグ
  tags TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,

  -- タイムスタンプ
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- メール自動ルーティングルール
CREATE TABLE IF NOT EXISTS public.email_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,

  -- 条件
  conditions JSONB NOT NULL DEFAULT '{}',
  -- 例: {"from_contains": "@example.com", "subject_contains": "見積"}

  -- アクション
  actions JSONB NOT NULL DEFAULT '{}',
  -- 例: {"assign_to": "user-uuid", "add_tags": ["重要"], "related_type": "lead"}

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- メール返信テンプレート
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,

  -- 変数 (例: {{client_name}}, {{invoice_number}})
  variables TEXT[] DEFAULT '{}',

  category TEXT, -- inquiry, followup, reminder, etc.
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add missing columns if they don't exist
DO $$ BEGIN
  ALTER TABLE public.inbound_emails ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- RLSポリシー
ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Members can view company emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Members can update company emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "System can insert emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Members can view routing rules" ON public.email_routing_rules;
DROP POLICY IF EXISTS "Admins can manage routing rules" ON public.email_routing_rules;
DROP POLICY IF EXISTS "Members can view templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.email_templates;

-- inbound_emails: 会社メンバーは閲覧可能
CREATE POLICY "Members can view company emails"
ON public.inbound_emails FOR SELECT
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
);

CREATE POLICY "Members can update company emails"
ON public.inbound_emails FOR UPDATE
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
);

-- システムからの挿入を許可（Edge Functionから）
CREATE POLICY "System can insert emails"
ON public.inbound_emails FOR INSERT
WITH CHECK (true);

-- email_routing_rules: 管理者のみ管理可能
CREATE POLICY "Members can view routing rules"
ON public.email_routing_rules FOR SELECT
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
);

CREATE POLICY "Admins can manage routing rules"
ON public.email_routing_rules FOR ALL
USING (
  public.is_company_admin(auth.uid(), company_id)
);

-- email_templates: メンバーは閲覧、管理者は編集
CREATE POLICY "Members can view templates"
ON public.email_templates FOR SELECT
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
);

CREATE POLICY "Admins can manage templates"
ON public.email_templates FOR ALL
USING (
  public.is_company_admin(auth.uid(), company_id)
);

-- インデックス
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_company ON public.inbound_emails(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'from_email' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_from ON public.inbound_emails(from_email); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'to_email' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_to ON public.inbound_emails(to_email); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'status' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_status ON public.inbound_emails(status); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'received_at DESC' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_received_at ON public.inbound_emails(received_at DESC); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'related_type, related_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_related ON public.inbound_emails(related_type, related_id); END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_routing_rules' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_email_routing_rules_company ON public.email_routing_rules(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_email_templates_company ON public.email_templates(company_id); END IF; END $$;

-- 更新トリガー
DROP TRIGGER IF EXISTS update_inbound_emails_updated_at ON public.inbound_emails;
CREATE TRIGGER update_inbound_emails_updated_at
BEFORE UPDATE ON public.inbound_emails
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_routing_rules_updated_at ON public.email_routing_rules;
CREATE TRIGGER update_email_routing_rules_updated_at
BEFORE UPDATE ON public.email_routing_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
