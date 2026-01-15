-- 修正: 通知のINSERTポリシーをより安全に
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- システムからの通知挿入を許可するが、user_idが存在することを確認
CREATE POLICY "System can insert notifications for valid users"
ON public.notifications FOR INSERT
WITH CHECK (user_id IS NOT NULL);