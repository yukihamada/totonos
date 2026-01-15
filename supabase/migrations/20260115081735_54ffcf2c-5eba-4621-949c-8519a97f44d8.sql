-- RLSポリシーの修正: 監査ログとレート制限のINSERTポリシーをサービスロール用に変更
-- これらのテーブルはEdge Functionからのみ書き込まれるため、サービスロールによる書き込みのみを許可

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "System can insert audit logs" ON public.data_access_audit_log;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.api_rate_limits;

-- 監査ログ: 通常ユーザーはINSERTできない（サービスロールのみ）
-- サービスロールはRLSをバイパスするため、ポリシーは不要
-- ただし、フロントエンドからの不正アクセスを防ぐため、user_idがauth.uid()と一致する場合のみ許可

-- レート制限: サービスロール用（通常ユーザーは閲覧のみ）
-- 古いポリシーを安全なものに置き換え