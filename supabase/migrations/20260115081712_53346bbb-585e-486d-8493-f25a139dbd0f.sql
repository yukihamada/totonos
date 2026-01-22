-- セキュリティ監査ログテーブルの作成
CREATE TABLE IF NOT EXISTS public.data_access_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  record_count INTEGER DEFAULT 1,
  query_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックスを作成
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_access_audit_log' AND column_name = 'user_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_data_access_audit_log_user_id ON public.data_access_audit_log(user_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_access_audit_log' AND column_name = 'table_name' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_data_access_audit_log_table_name ON public.data_access_audit_log(table_name); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_access_audit_log' AND column_name = 'created_at DESC' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_data_access_audit_log_created_at ON public.data_access_audit_log(created_at DESC); END IF; END $$;

-- RLSを有効化
ALTER TABLE public.data_access_audit_log ENABLE ROW LEVEL SECURITY;

-- 管理者のみ監査ログを閲覧可能
CREATE POLICY "Admins can view audit logs" ON public.data_access_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND cm.role IN ('owner', 'admin')
  )
);

-- システムが監査ログを書き込み可能（サービスロール用）
-- Edge Functionからの書き込み用に挿入ポリシーを作成
CREATE POLICY "System can insert audit logs" ON public.data_access_audit_log
FOR INSERT WITH CHECK (true);

-- レート制限用テーブルの作成
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- インデックス
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_rate_limits' AND column_name = 'user_id, endpoint' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_endpoint ON public.api_rate_limits(user_id, endpoint); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_rate_limits' AND column_name = 'window_start' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start); END IF; END $$;

-- RLSを有効化
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- 自分のレート制限を確認可能
CREATE POLICY "Users can view own rate limits" ON public.api_rate_limits
FOR SELECT USING (user_id = auth.uid());

-- システムが書き込み可能
CREATE POLICY "System can manage rate limits" ON public.api_rate_limits
FOR ALL USING (true) WITH CHECK (true);

-- レート制限チェック用関数（1分あたり60リクエスト、1時間あたり500リクエスト）
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_limit_per_minute INTEGER DEFAULT 60,
  p_limit_per_hour INTEGER DEFAULT 500
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_minute_count INTEGER;
  v_hour_count INTEGER;
  v_minute_start TIMESTAMP WITH TIME ZONE;
  v_hour_start TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  v_minute_start := date_trunc('minute', now());
  v_hour_start := date_trunc('hour', now());
  
  -- 1分間のカウント
  SELECT COALESCE(SUM(request_count), 0) INTO v_minute_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start >= v_minute_start;
  
  -- 1時間のカウント
  SELECT COALESCE(SUM(request_count), 0) INTO v_hour_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start >= v_hour_start;
  
  -- 制限チェック
  IF v_minute_count >= p_limit_per_minute THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_per_minute',
      'limit', p_limit_per_minute,
      'current', v_minute_count,
      'reset_at', (v_minute_start + interval '1 minute')::text
    );
  ELSIF v_hour_count >= p_limit_per_hour THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_per_hour',
      'limit', p_limit_per_hour,
      'current', v_hour_count,
      'reset_at', (v_hour_start + interval '1 hour')::text
    );
  ELSE
    -- レート制限OK、カウントを増加
    INSERT INTO public.api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, v_minute_start)
    ON CONFLICT (user_id, endpoint, window_start)
    DO UPDATE SET 
      request_count = api_rate_limits.request_count + 1,
      updated_at = now();
    
    v_result := jsonb_build_object(
      'allowed', true,
      'minute_remaining', p_limit_per_minute - v_minute_count - 1,
      'hour_remaining', p_limit_per_hour - v_hour_count - 1
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- 監査ログ記録用関数
CREATE OR REPLACE FUNCTION public.log_data_access(
  p_user_id UUID,
  p_table_name TEXT,
  p_operation TEXT,
  p_record_id UUID DEFAULT NULL,
  p_record_count INTEGER DEFAULT 1,
  p_query_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.data_access_audit_log (
    user_id, table_name, operation, record_id, record_count,
    query_details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_table_name, p_operation, p_record_id, p_record_count,
    p_query_details, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 古いレート制限データをクリーンアップする関数
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE window_start < now() - interval '2 hours';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;