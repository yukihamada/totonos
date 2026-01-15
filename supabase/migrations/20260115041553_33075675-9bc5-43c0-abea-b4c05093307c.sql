-- Create a safe view for API keys that excludes key_hash
CREATE VIEW public.api_keys_safe WITH (security_invoker = true) AS
SELECT 
    id,
    user_id,
    name,
    key_prefix,
    scopes,
    last_used_at,
    request_count,
    created_at,
    updated_at
FROM public.api_keys;

-- Grant select access to authenticated users
GRANT SELECT ON public.api_keys_safe TO authenticated;

-- Add comment explaining security measures
COMMENT ON VIEW public.api_keys_safe IS 'Safe view of api_keys that excludes key_hash to prevent credential exposure. Use this view for all client-side queries.';