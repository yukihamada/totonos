-- Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'invoice',
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own email logs"
ON public.email_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'user_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'invoice_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_email_logs_invoice_id ON public.email_logs(invoice_id); END IF; END $$;