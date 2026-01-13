-- Fix the overly permissive RLS policy on signature_verification_logs
-- Drop the permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert verification logs" ON public.signature_verification_logs;

-- Create a more restrictive policy - only allow inserts for contracts that exist
CREATE POLICY "Allow insert verification logs for existing contracts"
  ON public.signature_verification_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = signature_verification_logs.contract_id
  ));