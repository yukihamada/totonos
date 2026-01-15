-- LINE連携用テーブル: LINEユーザーとシステムユーザーを紐づけ
CREATE TABLE public.line_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  picture_url TEXT,
  status_message TEXT,
  linked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LINEチャット履歴テーブル
CREATE TABLE public.line_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  reply_token TEXT,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_line_users_line_user_id ON public.line_users(line_user_id);
CREATE INDEX idx_line_users_user_id ON public.line_users(user_id);
CREATE INDEX idx_line_chat_history_line_user_id ON public.line_chat_history(line_user_id);
CREATE INDEX idx_line_chat_history_user_id ON public.line_chat_history(user_id);
CREATE INDEX idx_line_chat_history_created_at ON public.line_chat_history(created_at);

-- RLS有効化
ALTER TABLE public.line_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_chat_history ENABLE ROW LEVEL SECURITY;

-- line_usersポリシー: ユーザーは自分のLINE連携のみ参照・更新可能
CREATE POLICY "Users can view their own LINE connection" 
  ON public.line_users 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own LINE connection" 
  ON public.line_users 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LINE connection" 
  ON public.line_users 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- line_chat_historyポリシー: ユーザーは自分のチャット履歴のみ参照可能
CREATE POLICY "Users can view their own LINE chat history" 
  ON public.line_chat_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- updated_atトリガー
CREATE TRIGGER update_line_users_updated_at
  BEFORE UPDATE ON public.line_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();