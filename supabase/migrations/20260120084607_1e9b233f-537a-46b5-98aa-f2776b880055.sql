-- AIエージェント自動化タスクテーブル
CREATE TABLE IF NOT EXISTS public.ai_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- 自動化の基本情報
  name TEXT NOT NULL,
  description TEXT,
  
  -- トリガー設定
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('schedule', 'event')),
  schedule_cron TEXT, -- cronパターン (例: '0 9 1 * *' = 毎月1日9時)
  schedule_description TEXT, -- 人間が読める形式 (例: '毎月1日')
  event_type TEXT, -- イベントトリガーの場合
  
  -- 実行するアクション
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create_invoice',
    'create_contract', 
    'send_email',
    'create_lead',
    'create_expense',
    'custom'
  )),
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- アクションの設定 (金額、宛先など)
  
  -- 対象クライアント（任意）
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  -- 状態
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックス
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_automations' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_ai_automations_company ON public.ai_automations(company_id); END IF; END $$;
CREATE INDEX IF NOT EXISTS idx_ai_automations_next_run ON public.ai_automations(next_run_at) WHERE is_active = true;

-- RLS有効化
ALTER TABLE public.ai_automations ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（会社メンバーのみアクセス可能）
CREATE POLICY "Company members can view automations"
ON public.ai_automations FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company members can create automations"
ON public.ai_automations FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company members can update automations"
ON public.ai_automations FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company members can delete automations"
ON public.ai_automations FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- 更新時のタイムスタンプ自動更新
CREATE TRIGGER update_ai_automations_updated_at
BEFORE UPDATE ON public.ai_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- AIが不足情報を収集するための一時保存テーブル
CREATE TABLE IF NOT EXISTS public.ai_automation_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- 収集中の情報
  original_instruction TEXT NOT NULL, -- ユーザーの元の指示
  action_type TEXT,
  collected_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- 収集済みデータ
  missing_fields TEXT[] NOT NULL DEFAULT '{}', -- 不足しているフィールド
  
  -- 状態
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'ready', 'completed', 'cancelled')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- RLS有効化
ALTER TABLE public.ai_automation_drafts ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can manage own drafts"
ON public.ai_automation_drafts FOR ALL
USING (user_id = auth.uid());

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_automations;