-- Allow the trigger function to insert into company_members
-- The trigger runs as SECURITY DEFINER, so we need to allow inserts for new company creation
DROP POLICY IF EXISTS "Admins can insert members" ON public.company_members;

-- Allow admins to insert OR allow trigger-based inserts (when company is being created)
CREATE POLICY "Allow member inserts"
ON public.company_members
FOR INSERT
WITH CHECK (
  -- Allow if user is admin of the company (for invitations)
  public.is_company_admin(auth.uid(), company_id)
  -- OR allow if this is the first member being added (company creation via trigger)
  OR NOT EXISTS (
    SELECT 1 FROM public.company_members cm2 
    WHERE cm2.company_id = company_id
  )
);