-- 会話テーブル
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 会話参加者テーブル
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

-- メッセージテーブル
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- RLS有効化
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 会話参加者かどうかを確認する関数
CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_user_id UUID, p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE user_id = p_user_id AND conversation_id = p_conversation_id
  )
$$;

-- 会話のRLSポリシー
CREATE POLICY "Users can view conversations they participate in"
ON conversations FOR SELECT TO authenticated
USING (
  public.is_conversation_participant(auth.uid(), id)
  OR public.is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Company members can create conversations"
ON conversations FOR INSERT TO authenticated
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Conversation creator can update"
ON conversations FOR UPDATE TO authenticated
USING (created_by = auth.uid());

-- 参加者のRLSポリシー
CREATE POLICY "Users can view participants of their conversations"
ON conversation_participants FOR SELECT TO authenticated
USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Conversation participants can add members"
ON conversation_participants FOR INSERT TO authenticated
WITH CHECK (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can leave conversations"
ON conversation_participants FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- メッセージのRLSポリシー
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT TO authenticated
USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Participants can send messages"
ON messages FOR INSERT TO authenticated
WITH CHECK (
  public.is_conversation_participant(auth.uid(), conversation_id)
  AND sender_id = auth.uid()
);

CREATE POLICY "Senders can update their messages"
ON messages FOR UPDATE TO authenticated
USING (sender_id = auth.uid());

CREATE POLICY "Senders can delete their messages"
ON messages FOR DELETE TO authenticated
USING (sender_id = auth.uid());

-- リアルタイム有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- updated_atトリガー
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();