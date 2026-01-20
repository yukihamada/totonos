-- Drop existing overly permissive policies on inbound_emails
DROP POLICY IF EXISTS "Admin can view company inbound emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Admin can update company inbound emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Admins can view company inbound emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Admins can update company inbound emails" ON public.inbound_emails;

-- Create stricter RLS policies for inbound_emails
-- Users can only see emails assigned to them, OR unassigned emails if they are admin
CREATE POLICY "Users can view their assigned emails"
ON public.inbound_emails
FOR SELECT
TO authenticated
USING (
  -- Email is assigned to current user
  assigned_to = auth.uid()
  OR 
  -- Email is unassigned AND user is admin of the company
  (assigned_to IS NULL AND public.is_company_admin(auth.uid(), company_id))
  OR
  -- User is owner of the company (can see all for oversight)
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = inbound_emails.company_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND cm.role = 'owner'
  )
);

-- Only assigned user or owner can update emails
CREATE POLICY "Users can update their assigned emails"
ON public.inbound_emails
FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid()
  OR 
  (assigned_to IS NULL AND public.is_company_admin(auth.uid(), company_id))
  OR
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = inbound_emails.company_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND cm.role = 'owner'
  )
)
WITH CHECK (
  assigned_to = auth.uid()
  OR 
  (assigned_to IS NULL AND public.is_company_admin(auth.uid(), company_id))
  OR
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = inbound_emails.company_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND cm.role = 'owner'
  )
);

-- Insert policy for edge functions (service role handles this)
DROP POLICY IF EXISTS "Service role can insert inbound emails" ON public.inbound_emails;
CREATE POLICY "Service role can insert inbound emails"
ON public.inbound_emails
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_company_admin(auth.uid(), company_id)
);

-- Delete policy - only owner can delete
CREATE POLICY "Owner can delete inbound emails"
ON public.inbound_emails
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = inbound_emails.company_id
    AND cm.user_id = auth.uid()
    AND cm.is_active = true
    AND cm.role = 'owner'
  )
);