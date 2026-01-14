-- Fix overly permissive RLS policies

-- Drop the overly permissive policies on company_email_addresses
DROP POLICY IF EXISTS "Service role can insert email addresses" ON public.company_email_addresses;

-- Drop the overly permissive policies on inbound_emails
DROP POLICY IF EXISTS "Service role can update inbound emails AI fields" ON public.inbound_emails;

-- The company_email_addresses table already has proper admin management policy
-- For inbound_emails, we need to ensure only company members can update their emails
-- The existing policies should handle this correctly