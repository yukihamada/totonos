-- Create receipts table for OCR processed receipts
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('upload', 'email', 'camera')),
  source_email_id UUID REFERENCES public.inbound_emails(id) ON DELETE SET NULL,
  image_url TEXT,
  vendor TEXT,
  receipt_date DATE,
  total_amount NUMERIC(12,2),
  tax_amount NUMERIC(12,2),
  items JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  raw_text TEXT,
  confidence NUMERIC(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'approved', 'rejected', 'linked')),
  expense_claim_id UUID REFERENCES public.expense_claims(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own receipts"
ON public.receipts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
ON public.receipts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
ON public.receipts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
ON public.receipts FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts bucket
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);