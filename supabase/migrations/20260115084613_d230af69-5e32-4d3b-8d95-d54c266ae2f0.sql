-- clients テーブルのRLSポリシーを強化
-- 既存ポリシーを削除して再作成

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

-- セキュリティ強化: 認証済みユーザーのみアクセス可能なポリシーを作成
-- SELECT: 自分のクライアントのみ閲覧可能
CREATE POLICY "Authenticated users can view their own clients" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: 自分のクライアントのみ作成可能
CREATE POLICY "Authenticated users can insert their own clients" 
ON public.clients 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分のクライアントのみ更新可能
CREATE POLICY "Authenticated users can update their own clients" 
ON public.clients 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: 自分のクライアントのみ削除可能
CREATE POLICY "Authenticated users can delete their own clients" 
ON public.clients 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- RLSが有効であることを確認
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーからのアクセスを明示的に拒否
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;