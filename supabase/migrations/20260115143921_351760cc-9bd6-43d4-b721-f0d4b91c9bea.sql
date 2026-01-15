-- 1. Create audit log function for contract signature modifications
CREATE OR REPLACE FUNCTION public.log_signature_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.data_access_audit_log (
    user_id,
    table_name,
    operation,
    record_id,
    query_details
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'contract_signatures',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    jsonb_build_object(
      'contract_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.contract_id ELSE NEW.contract_id END,
      'signatory_email_masked', CASE WHEN TG_OP = 'DELETE' THEN LEFT(OLD.signatory_email, 3) || '***' ELSE LEFT(NEW.signatory_email, 3) || '***' END
    )
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- 2. Create trigger for contract_signatures access audit (INSERT/UPDATE/DELETE only)
DROP TRIGGER IF EXISTS audit_signature_access ON public.contract_signatures;
CREATE TRIGGER audit_signature_access
  AFTER INSERT OR UPDATE OR DELETE ON public.contract_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.log_signature_access();

-- 3. Create a secure view for contract_signatures that masks sensitive data
DROP VIEW IF EXISTS public.contract_signatures_safe;
CREATE VIEW public.contract_signatures_safe
WITH (security_invoker = on)
AS
SELECT
  id,
  contract_id,
  signatory_type,
  signature_method,
  LEFT(signatory_email, 3) || '***@***' as signatory_email_masked,
  signatory_name,
  signed_at,
  blockchain_tx_hash,
  blockchain_verified_at,
  created_at,
  updated_at
FROM public.contract_signatures;

-- 4. Add index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_data_access_audit_contract_signatures 
ON public.data_access_audit_log(table_name, created_at) 
WHERE table_name = 'contract_signatures';

-- 5. Clean up expired OTP codes automatically
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contract_signatures
  SET otp_code = NULL, otp_expires_at = NULL
  WHERE otp_expires_at < NOW() AND otp_code IS NOT NULL;
END;
$$;

-- 6. Update RLS policies for contract_signatures
DROP POLICY IF EXISTS "Users can view their own contract signatures" ON public.contract_signatures;
CREATE POLICY "Users can view their own contract signatures"
ON public.contract_signatures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = contract_signatures.contract_id 
    AND c.user_id = auth.uid()
  )
  OR signature_token IS NOT NULL
);

DROP POLICY IF EXISTS "Users can insert signatures for their contracts" ON public.contract_signatures;
CREATE POLICY "Users can insert signatures for their contracts"
ON public.contract_signatures
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = contract_signatures.contract_id 
    AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own contract signatures" ON public.contract_signatures;
CREATE POLICY "Users can update their own contract signatures"
ON public.contract_signatures
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = contract_signatures.contract_id 
    AND c.user_id = auth.uid()
  )
);

-- 7. Secure function for signature verification
CREATE OR REPLACE FUNCTION public.verify_signature_securely(
  p_signature_id uuid
)
RETURNS TABLE (
  is_valid boolean,
  signed_at timestamptz,
  signatory_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (cs.signed_at IS NOT NULL) as is_valid,
    cs.signed_at,
    cs.signatory_name
  FROM public.contract_signatures cs
  JOIN public.contracts c ON c.id = cs.contract_id
  WHERE cs.id = p_signature_id
  AND c.user_id = auth.uid();
END;
$$;

-- 8. Add RLS policy for contract_signatures_safe view
GRANT SELECT ON public.contract_signatures_safe TO authenticated;

-- 9. Create function to anonymize old signature IP addresses (for GDPR compliance)
CREATE OR REPLACE FUNCTION public.anonymize_old_signature_ips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contract_signatures
  SET 
    signed_ip = 'anonymized',
    signed_user_agent = 'anonymized'
  WHERE signed_at < NOW() - INTERVAL '90 days'
  AND signed_ip IS NOT NULL
  AND signed_ip != 'anonymized';
END;
$$;