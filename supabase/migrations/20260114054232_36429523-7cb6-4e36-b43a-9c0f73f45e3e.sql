-- Create user AI settings table
CREATE TABLE IF NOT EXISTS public.user_ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'lovable',
  model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  custom_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for users to manage their own settings
CREATE POLICY "Users can view their own AI settings"
  ON public.user_ai_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings"
  ON public.user_ai_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings"
  ON public.user_ai_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI settings"
  ON public.user_ai_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_ai_settings_updated_at
  BEFORE UPDATE ON public.user_ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();