-- Add ai_command to email_purpose enum
ALTER TYPE email_purpose ADD VALUE IF NOT EXISTS 'ai_command';

-- Add AI command columns to inbound_emails
ALTER TABLE inbound_emails 
ADD COLUMN IF NOT EXISTS ai_command_response TEXT,
ADD COLUMN IF NOT EXISTS ai_command_executed_at TIMESTAMP WITH TIME ZONE;

-- Create company_email_settings table for VIP/keyword alerts
CREATE TABLE IF NOT EXISTS public.company_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vip_email_domains TEXT[] DEFAULT '{}',
  vip_email_addresses TEXT[] DEFAULT '{}',
  alert_keywords TEXT[] DEFAULT '{}',
  notification_slack_webhook TEXT,
  auto_reply_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.company_email_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_email_settings
CREATE POLICY "Company members can view email settings"
ON public.company_email_settings FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company admins can manage email settings"
ON public.company_email_settings FOR ALL
USING (public.is_company_admin(auth.uid(), company_id));

-- Create index
CREATE INDEX IF NOT EXISTS idx_company_email_settings_company ON company_email_settings(company_id);

-- Add trigger for updated_at
CREATE TRIGGER update_company_email_settings_updated_at
BEFORE UPDATE ON company_email_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();