-- Create contract status enum
CREATE TYPE public.contract_status AS ENUM (
  'draft',
  'sent',
  'pending_signature',
  'partially_signed',
  'signed',
  'expired',
  'cancelled'
);

-- Create signatory type enum
CREATE TYPE public.signatory_type AS ENUM (
  'issuer',
  'recipient'
);

-- Create signature method enum
CREATE TYPE public.signature_method AS ENUM (
  'email_otp',
  'wallet'
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status public.contract_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  content_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_items table
CREATE TABLE public.contract_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_signatures table
CREATE TABLE public.contract_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  signatory_type public.signatory_type NOT NULL,
  signatory_name TEXT,
  signatory_email TEXT NOT NULL,
  signature_method public.signature_method NOT NULL DEFAULT 'email_otp',
  signature_token TEXT UNIQUE,
  otp_code TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_ip TEXT,
  signed_user_agent TEXT,
  content_hash TEXT,
  blockchain_tx_hash TEXT,
  blockchain_network TEXT DEFAULT 'polygon',
  blockchain_block_number BIGINT,
  blockchain_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signature_verification_logs table
CREATE TABLE public.signature_verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_by_ip TEXT,
  verification_result BOOLEAN NOT NULL,
  blockchain_confirmed BOOLEAN DEFAULT false,
  details JSONB
);

-- Enable RLS on all tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_verification_logs ENABLE ROW LEVEL SECURITY;

-- Contracts RLS policies
CREATE POLICY "Users can view their own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
  ON public.contracts FOR DELETE
  USING (auth.uid() = user_id);

-- Contract items RLS policies
CREATE POLICY "Users can view their own contract items"
  ON public.contract_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own contract items"
  ON public.contract_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own contract items"
  ON public.contract_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own contract items"
  ON public.contract_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_items.contract_id
    AND contracts.user_id = auth.uid()
  ));

-- Contract signatures RLS policies (need public access for signing)
CREATE POLICY "Users can view their own contract signatures"
  ON public.contract_signatures FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_signatures.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own contract signatures"
  ON public.contract_signatures FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_signatures.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own contract signatures"
  ON public.contract_signatures FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_signatures.contract_id
    AND contracts.user_id = auth.uid()
  ));

-- Public access for signature verification via token
CREATE POLICY "Anyone can view signatures by token"
  ON public.contract_signatures FOR SELECT
  USING (signature_token IS NOT NULL);

-- Verification logs RLS policies
CREATE POLICY "Users can view their own verification logs"
  ON public.signature_verification_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = signature_verification_logs.contract_id
    AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can insert verification logs"
  ON public.signature_verification_logs FOR INSERT
  WITH CHECK (true);

-- Create function to generate contract number
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := to_char(CURRENT_DATE, 'YYYYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 8) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.contracts
    WHERE contract_number LIKE 'CON' || year_month || '%';
    
    NEW.contract_number := 'CON' || year_month || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for contract number generation
CREATE TRIGGER generate_contract_number_trigger
BEFORE INSERT ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.generate_contract_number();

-- Create trigger for updated_at
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_signatures_updated_at
BEFORE UPDATE ON public.contract_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();