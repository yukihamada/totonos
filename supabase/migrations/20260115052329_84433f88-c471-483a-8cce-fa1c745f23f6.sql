-- Add columns to track message type and attachments in LINE chat history
ALTER TABLE public.line_chat_history 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS has_attachment BOOLEAN DEFAULT false;

-- Add index for filtering by message type
CREATE INDEX IF NOT EXISTS idx_line_chat_history_message_type 
ON public.line_chat_history(message_type);

-- Add comment explaining the columns
COMMENT ON COLUMN public.line_chat_history.message_type IS 'Type of LINE message: text, image, file';
COMMENT ON COLUMN public.line_chat_history.has_attachment IS 'Whether the message includes an image or PDF attachment';