
-- Fix the overly permissive audit log insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.sensitive_data_audit_log;

-- Create a more restrictive insert policy - only authenticated users can insert their own audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON public.sensitive_data_audit_log FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
