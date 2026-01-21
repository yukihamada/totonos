-- Add branding_settings column to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS branding_settings JSONB DEFAULT '{}';

-- Create company-logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company logos
CREATE POLICY "Company members can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Company members can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Company members can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');