-- receipts テーブルに法的要件カラムを追加（電子帳簿保存法対応）
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS legal_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS legal_hash TEXT,
ADD COLUMN IF NOT EXISTS legal_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS retention_until DATE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

-- 通知テーブルに領収書関連カテゴリを対応
-- (既存のnotificationsテーブルが無い場合は作成)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  category TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 通知のRLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications'
  ) THEN
    CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete own notifications'
  ) THEN
    CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Service role can insert notifications'
  ) THEN
    CREATE POLICY "Service role can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- receiptsのインデックス追加
CREATE INDEX IF NOT EXISTS idx_receipts_source_email ON public.receipts(source_email_id);
CREATE INDEX IF NOT EXISTS idx_receipts_legal_verified ON public.receipts(legal_verified);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;