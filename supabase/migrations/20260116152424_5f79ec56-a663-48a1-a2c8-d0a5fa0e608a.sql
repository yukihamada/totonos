-- Fix existing companies with empty or invalid slugs
UPDATE public.companies 
SET slug = 'company-' || REPLACE(id::text, '-', '')
WHERE slug IS NULL OR slug = '';

-- Drop and recreate the function with improved logic
CREATE OR REPLACE FUNCTION public.generate_company_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name (remove non-alphanumeric characters)
  base_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]', '', 'g'));
  
  -- If slug is empty (e.g., Japanese-only names), use company- prefix with UUID
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'company-' || REPLACE(NEW.id::text, '-', '');
  END IF;
  
  -- Start with base slug
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$function$;

-- Create external_service_types table (master data for supported services)
CREATE TABLE IF NOT EXISTS public.external_service_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT,
  auth_type TEXT NOT NULL DEFAULT 'api_key',
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create external_connections table
CREATE TABLE IF NOT EXISTS public.external_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL REFERENCES public.external_service_types(id),
  display_name TEXT,
  credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'expired')),
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_service_types (read-only for all authenticated users)
CREATE POLICY "Anyone can view service types"
  ON public.external_service_types
  FOR SELECT
  USING (is_active = true);

-- RLS policies for external_connections
CREATE POLICY "Users can view their own connections"
  ON public.external_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connections"
  ON public.external_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON public.external_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON public.external_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_external_connections_user_id ON public.external_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_external_connections_company_id ON public.external_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_external_connections_service_type ON public.external_connections(service_type);

-- Create trigger for updated_at
CREATE TRIGGER update_external_connections_updated_at
  BEFORE UPDATE ON public.external_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial service types
INSERT INTO public.external_service_types (id, name, category, icon_name, auth_type, config) VALUES
  ('freee', 'freee会計', 'accounting', 'Calculator', 'oauth2', '{"scopes": ["read", "write"], "api_base": "https://api.freee.co.jp"}'),
  ('moneyforward', 'マネーフォワード', 'accounting', 'Wallet', 'api_key', '{"api_base": "https://api.biz.moneyforward.com"}'),
  ('yayoi', '弥生会計', 'accounting', 'FileSpreadsheet', 'api_key', '{"api_base": "https://api.yayoi-kk.co.jp"}'),
  ('salesforce', 'Salesforce', 'crm', 'Cloud', 'oauth2', '{"api_base": "https://login.salesforce.com"}'),
  ('hubspot', 'HubSpot', 'crm', 'Target', 'api_key', '{"api_base": "https://api.hubapi.com"}'),
  ('zoho', 'Zoho CRM', 'crm', 'Users', 'oauth2', '{"api_base": "https://www.zohoapis.com"}'),
  ('smarthr', 'SmartHR', 'hr', 'UserCheck', 'api_key', '{"api_base": "https://api.smarthr.jp"}'),
  ('freee_hr', 'freee人事労務', 'hr', 'Users', 'oauth2', '{"api_base": "https://api.freee.co.jp"}'),
  ('kintone', 'kintone', 'business', 'Database', 'api_token', '{"requires_subdomain": true}'),
  ('notion', 'Notion', 'business', 'BookOpen', 'api_key', '{"api_base": "https://api.notion.com"}'),
  ('slack', 'Slack', 'communication', 'MessageSquare', 'oauth2', '{"api_base": "https://slack.com/api"}'),
  ('google_calendar', 'Googleカレンダー', 'calendar', 'Calendar', 'oauth2', '{"api_base": "https://www.googleapis.com/calendar"}'),
  ('outlook', 'Outlook', 'calendar', 'Mail', 'oauth2', '{"api_base": "https://graph.microsoft.com"}'),
  ('google_drive', 'Google Drive', 'storage', 'HardDrive', 'oauth2', '{"api_base": "https://www.googleapis.com/drive"}'),
  ('dropbox', 'Dropbox', 'storage', 'Cloud', 'oauth2', '{"api_base": "https://api.dropboxapi.com"}')
ON CONFLICT (id) DO NOTHING;