-- Create inbound_emails table
CREATE TABLE IF NOT EXISTS public.inbound_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  message_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  cc_emails TEXT[],
  reply_to TEXT,
  subject TEXT,
  text_body TEXT,
  html_body TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  headers JSONB DEFAULT '{}'::jsonb,
  raw_payload JSONB,
  status TEXT NOT NULL DEFAULT 'received',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_spam BOOLEAN NOT NULL DEFAULT false,
  related_type TEXT,
  related_id UUID,
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Company members can view their inbound emails"
ON public.inbound_emails
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company members can update their inbound emails"
ON public.inbound_emails
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Allow edge function to insert (service role bypasses RLS, but adding for clarity)
CREATE POLICY "Service can insert inbound emails"
ON public.inbound_emails
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_company_id ON public.inbound_emails(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'from_email' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_from_email ON public.inbound_emails(from_email); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'status' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_status ON public.inbound_emails(status); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inbound_emails' AND column_name = 'created_at DESC' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_inbound_emails_created_at ON public.inbound_emails(created_at DESC); END IF; END $$;

-- Add trigger for updated_at
CREATE TRIGGER update_inbound_emails_updated_at
BEFORE UPDATE ON public.inbound_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();