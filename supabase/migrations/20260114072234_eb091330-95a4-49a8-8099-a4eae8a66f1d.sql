-- Fix avatar storage policy to validate file extensions
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

-- Fix signature_verification_logs to only allow contract owners to insert
DROP POLICY IF EXISTS "Anyone can insert verification logs" ON signature_verification_logs;
CREATE POLICY "Contract owners can insert verification logs"
ON signature_verification_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = signature_verification_logs.contract_id
    AND contracts.user_id = auth.uid()
  )
);