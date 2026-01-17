-- Create email_integrations table for OAuth connections
CREATE TABLE IF NOT EXISTS public.email_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT true,
  auto_log BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id, provider)
);

-- Create synced_emails table
CREATE TABLE IF NOT EXISTS public.synced_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.email_integrations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  from_address TEXT,
  to_addresses TEXT[],
  cc_addresses TEXT[],
  date TIMESTAMPTZ,
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(integration_id, external_id)
);

-- Create synced_calendar_events table
CREATE TABLE IF NOT EXISTS public.synced_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.email_integrations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location TEXT,
  attendees JSONB,
  is_all_day BOOLEAN DEFAULT false,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(integration_id, external_id)
);

-- Enable RLS
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_integrations
CREATE POLICY "Users can view their own email integrations"
ON public.email_integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email integrations"
ON public.email_integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email integrations"
ON public.email_integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email integrations"
ON public.email_integrations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for synced_emails
CREATE POLICY "Users can view their own synced emails"
ON public.synced_emails FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own synced emails"
ON public.synced_emails FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own synced emails"
ON public.synced_emails FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own synced emails"
ON public.synced_emails FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for synced_calendar_events
CREATE POLICY "Users can view their own calendar events"
ON public.synced_calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events"
ON public.synced_calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.synced_calendar_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON public.synced_calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_email_integrations_user ON public.email_integrations(user_id);
CREATE INDEX idx_email_integrations_company ON public.email_integrations(company_id);
CREATE INDEX idx_synced_emails_integration ON public.synced_emails(integration_id);
CREATE INDEX idx_synced_emails_date ON public.synced_emails(date DESC);
CREATE INDEX idx_synced_calendar_events_integration ON public.synced_calendar_events(integration_id);
CREATE INDEX idx_synced_calendar_events_start ON public.synced_calendar_events(start_time);

-- Triggers for updated_at
CREATE TRIGGER update_email_integrations_updated_at
BEFORE UPDATE ON public.email_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();