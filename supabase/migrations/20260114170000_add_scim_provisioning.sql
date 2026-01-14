-- SCIM 2.0 Provisioning Support
-- Migration: 20260114170000_add_scim_provisioning

-- SCIM tokens table for API authentication
CREATE TABLE IF NOT EXISTS scim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCIM configuration per organization
CREATE TABLE IF NOT EXISTS scim_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  auto_create_users BOOLEAN DEFAULT true,
  auto_update_users BOOLEAN DEFAULT true,
  auto_deactivate_users BOOLEAN DEFAULT true,
  default_role TEXT DEFAULT 'member',
  attribute_mapping JSONB DEFAULT '{
    "userName": "email",
    "name.givenName": "first_name",
    "name.familyName": "last_name",
    "displayName": "display_name",
    "emails[0].value": "email",
    "active": "is_active"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCIM provisioning log for audit trail
CREATE TABLE IF NOT EXISTS scim_provisioning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'activate', 'deactivate')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('User', 'Group')),
  resource_id TEXT,
  scim_id TEXT,
  request_body JSONB,
  response_status INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCIM external IDs mapping (maps external IdP IDs to internal user IDs)
CREATE TABLE IF NOT EXISTS scim_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('User', 'Group')),
  internal_id UUID NOT NULL,
  idp_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, external_id, resource_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scim_tokens_org ON scim_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_scim_tokens_hash ON scim_tokens(token_hash) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scim_logs_org ON scim_provisioning_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_scim_logs_created ON scim_provisioning_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scim_external_ids_org ON scim_external_ids(organization_id);
CREATE INDEX IF NOT EXISTS idx_scim_external_ids_external ON scim_external_ids(external_id);

-- Enable RLS
ALTER TABLE scim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_provisioning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_external_ids ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view SCIM tokens in their organization"
  ON scim_tokens FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can manage SCIM tokens"
  ON scim_tokens FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view SCIM config in their organization"
  ON scim_configurations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can manage SCIM config"
  ON scim_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view SCIM logs in their organization"
  ON scim_provisioning_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert SCIM logs"
  ON scim_provisioning_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view SCIM external IDs in their organization"
  ON scim_external_ids FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Function to validate SCIM token
CREATE OR REPLACE FUNCTION validate_scim_token(p_token_hash TEXT)
RETURNS TABLE (organization_id UUID, is_valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.organization_id,
    CASE
      WHEN st.is_active AND (st.expires_at IS NULL OR st.expires_at > NOW()) THEN true
      ELSE false
    END as is_valid
  FROM scim_tokens st
  WHERE st.token_hash = p_token_hash;

  -- Update last used timestamp
  UPDATE scim_tokens
  SET last_used_at = NOW()
  WHERE token_hash = p_token_hash AND is_active = true;
END;
$$;

-- Function to create SCIM token
CREATE OR REPLACE FUNCTION create_scim_token(
  p_organization_id UUID,
  p_name TEXT,
  p_token_hash TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_id UUID;
BEGIN
  INSERT INTO scim_tokens (organization_id, name, token_hash, expires_at, created_by)
  VALUES (p_organization_id, p_name, p_token_hash, p_expires_at, auth.uid())
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;

-- Function to log SCIM operations
CREATE OR REPLACE FUNCTION log_scim_operation(
  p_organization_id UUID,
  p_operation TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_scim_id TEXT,
  p_request_body JSONB,
  p_response_status INTEGER,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO scim_provisioning_logs (
    organization_id, operation, resource_type, resource_id,
    scim_id, request_body, response_status, error_message
  )
  VALUES (
    p_organization_id, p_operation, p_resource_type, p_resource_id,
    p_scim_id, p_request_body, p_response_status, p_error_message
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Function to get or create external ID mapping
CREATE OR REPLACE FUNCTION get_or_create_scim_mapping(
  p_organization_id UUID,
  p_external_id TEXT,
  p_resource_type TEXT,
  p_internal_id UUID,
  p_idp_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mapping_id UUID;
BEGIN
  -- Try to find existing mapping
  SELECT id INTO v_mapping_id
  FROM scim_external_ids
  WHERE organization_id = p_organization_id
    AND external_id = p_external_id
    AND resource_type = p_resource_type;

  IF v_mapping_id IS NOT NULL THEN
    -- Update internal_id if changed
    UPDATE scim_external_ids
    SET internal_id = p_internal_id, updated_at = NOW()
    WHERE id = v_mapping_id;
    RETURN v_mapping_id;
  END IF;

  -- Create new mapping
  INSERT INTO scim_external_ids (organization_id, external_id, resource_type, internal_id, idp_name)
  VALUES (p_organization_id, p_external_id, p_resource_type, p_internal_id, p_idp_name)
  RETURNING id INTO v_mapping_id;

  RETURN v_mapping_id;
END;
$$;

-- Function to find internal ID by external ID
CREATE OR REPLACE FUNCTION find_internal_by_scim_id(
  p_organization_id UUID,
  p_external_id TEXT,
  p_resource_type TEXT
)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT internal_id
  FROM scim_external_ids
  WHERE organization_id = p_organization_id
    AND external_id = p_external_id
    AND resource_type = p_resource_type;
$$;

-- Function to get SCIM provisioning stats
CREATE OR REPLACE FUNCTION get_scim_stats(p_organization_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_users', (
      SELECT COUNT(*) FROM scim_external_ids
      WHERE organization_id = p_organization_id AND resource_type = 'User'
    ),
    'total_groups', (
      SELECT COUNT(*) FROM scim_external_ids
      WHERE organization_id = p_organization_id AND resource_type = 'Group'
    ),
    'recent_operations', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', id,
          'operation', operation,
          'resource_type', resource_type,
          'created_at', created_at,
          'status', response_status
        ) ORDER BY created_at DESC
      ), '[]'::jsonb)
      FROM (
        SELECT * FROM scim_provisioning_logs
        WHERE organization_id = p_organization_id
        ORDER BY created_at DESC
        LIMIT 10
      ) recent
    ),
    'operations_today', (
      SELECT COUNT(*) FROM scim_provisioning_logs
      WHERE organization_id = p_organization_id
        AND created_at >= CURRENT_DATE
    ),
    'errors_today', (
      SELECT COUNT(*) FROM scim_provisioning_logs
      WHERE organization_id = p_organization_id
        AND created_at >= CURRENT_DATE
        AND response_status >= 400
    )
  );
$$;
