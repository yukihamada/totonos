-- Create user dashboard configuration table
CREATE TABLE public.user_dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  widgets JSONB NOT NULL DEFAULT '[]',
  layout_type TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.user_dashboard_config ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own dashboard config"
  ON public.user_dashboard_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard config"
  ON public.user_dashboard_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard config"
  ON public.user_dashboard_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard config"
  ON public.user_dashboard_config FOR DELETE
  USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_user_dashboard_config_updated_at
  BEFORE UPDATE ON public.user_dashboard_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();