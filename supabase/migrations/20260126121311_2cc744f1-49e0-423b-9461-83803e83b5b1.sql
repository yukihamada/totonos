-- Add AI-related columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_ai_message BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_metadata JSONB;

-- Add AI participation flag to conversations table
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS includes_ai BOOLEAN DEFAULT false;

-- Update RLS policy to allow service role to insert AI messages
-- The messenger-ai edge function will use service role to insert messages
CREATE POLICY "Service role can insert AI messages"
ON public.messages
FOR INSERT
TO service_role
WITH CHECK (true);

-- Index for AI messages for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_is_ai ON public.messages(is_ai_message) WHERE is_ai_message = true;
CREATE INDEX IF NOT EXISTS idx_conversations_includes_ai ON public.conversations(includes_ai) WHERE includes_ai = true;