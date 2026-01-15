-- Update foreign key constraints to CASCADE on delete for company-related tables
-- This ensures that when a company is deleted, all related data is also deleted

-- Fix inbound_emails foreign key
ALTER TABLE public.inbound_emails 
  DROP CONSTRAINT IF EXISTS inbound_emails_company_id_fkey;
ALTER TABLE public.inbound_emails 
  ADD CONSTRAINT inbound_emails_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Fix employees foreign key
ALTER TABLE public.employees 
  DROP CONSTRAINT IF EXISTS employees_company_id_fkey;
ALTER TABLE public.employees 
  ADD CONSTRAINT employees_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;