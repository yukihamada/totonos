-- Create email purpose enum
CREATE TYPE public.email_purpose AS ENUM (
  'lead_capture',
  'support',
  'invoice',
  'contract',
  'recruit',
  'general'
);

-- Create company email addresses table
CREATE TABLE IF NOT EXISTS public.company_email_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  address_prefix TEXT NOT NULL,
  purpose public.email_purpose NOT NULL DEFAULT 'general',
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_create_entity BOOLEAN NOT NULL DEFAULT false,
  ai_processing_enabled BOOLEAN NOT NULL DEFAULT true,
  assigned_to UUID,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique prefix per company
  UNIQUE(company_id, address_prefix)
);

-- Enable RLS
ALTER TABLE public.company_email_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_email_addresses
CREATE POLICY "Company members can view their email addresses"
ON public.company_email_addresses
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.company_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company admins can manage email addresses"
ON public.company_email_addresses
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.company_members
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND role IN ('owner', 'admin')
  )
);

-- Add AI analysis columns to inbound_emails
ALTER TABLE public.inbound_emails 
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_category TEXT,
ADD COLUMN IF NOT EXISTS ai_urgency TEXT CHECK (ai_urgency IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'negative', 'neutral')),
ADD COLUMN IF NOT EXISTS ai_extracted_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_address_id UUID REFERENCES public.company_email_addresses(id),
ADD COLUMN IF NOT EXISTS auto_created_entity_type TEXT,
ADD COLUMN IF NOT EXISTS auto_created_entity_id UUID;

-- Create index for email address lookup
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_email_addresses' AND column_name = 'address_prefix' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_company_email_addresses_prefix ON public.company_email_addresses(address_prefix); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_email_addresses' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_company_email_addresses_company ON public.company_email_addresses(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'email_address_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_email_address ON public.inbound_emails(email_address_id); END IF; END $$;

-- Trigger for updated_at
CREATE TRIGGER update_company_email_addresses_updated_at
BEFORE UPDATE ON public.company_email_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert policy for service role (Edge Function)
CREATE POLICY "Service role can insert email addresses"
ON public.company_email_addresses
FOR INSERT
WITH CHECK (true);

-- Allow Edge Function to update inbound_emails with AI analysis
CREATE POLICY "Service role can update inbound emails AI fields"
ON public.inbound_emails
FOR UPDATE
USING (true)
WITH CHECK (true);