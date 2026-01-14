-- Fix the overly permissive INSERT policy on inbound_emails
DROP POLICY IF EXISTS "Service can insert inbound emails" ON public.inbound_emails;

-- Recreate with service_role check pattern
-- Note: Service role bypasses RLS automatically, so we don't need a special policy for it
-- Instead, regular RLS should apply to normal users

-- Make sure company members can't insert directly (only through Edge Function)
-- The service role will bypass RLS automatically