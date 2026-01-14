-- Enhance Contracts for Organization-based RLS and Alerts
-- Migration: 20260114160000_enhance_contracts_alerts

-- Add organization_id to contracts
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index for organization lookups
CREATE INDEX IF NOT EXISTS idx_contracts_organization ON contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_valid_until ON contracts(valid_until);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Contract alerts table to track dismissed/acknowledged alerts
CREATE TABLE IF NOT EXISTS contract_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'acknowledged')),
  dismissed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dismissed_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, contract_id)
);

-- Enable RLS
ALTER TABLE contract_alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_alert_settings
CREATE POLICY "Users can view contract alerts in their organization"
  ON contract_alert_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage contract alerts in their organization"
  ON contract_alert_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Drop old user-based RLS policies for contracts if they exist
DROP POLICY IF EXISTS "Users can view their own contracts" ON contracts;
DROP POLICY IF EXISTS "Users can insert their own contracts" ON contracts;
DROP POLICY IF EXISTS "Users can update their own contracts" ON contracts;
DROP POLICY IF EXISTS "Users can delete their own contracts" ON contracts;

-- Create organization-based RLS policies for contracts
CREATE POLICY "Users can view contracts in their organization"
  ON contracts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage contracts in their organization"
  ON contracts FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Function to get contract alerts with remaining days and status
CREATE OR REPLACE FUNCTION get_contract_alerts(
  p_organization_id UUID,
  p_days_ahead INTEGER DEFAULT 90
)
RETURNS TABLE (
  id UUID,
  contract_id UUID,
  contract_title TEXT,
  contract_number TEXT,
  client_id UUID,
  client_name TEXT,
  valid_until DATE,
  days_remaining INTEGER,
  alert_type TEXT,
  alert_status TEXT,
  contract_status TEXT,
  amount NUMERIC,
  total_amount NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  WITH contract_data AS (
    SELECT
      c.id,
      c.title,
      c.contract_number,
      c.client_id,
      cl.name as client_name,
      c.valid_until,
      CASE
        WHEN c.valid_until IS NULL THEN NULL
        ELSE (c.valid_until - CURRENT_DATE)::INTEGER
      END as days_remaining,
      c.status as contract_status,
      c.amount,
      c.total_amount,
      c.created_at,
      COALESCE(cas.status, 'active') as alert_status
    FROM contracts c
    LEFT JOIN clients cl ON c.client_id = cl.id
    LEFT JOIN contract_alert_settings cas ON c.id = cas.contract_id AND cas.organization_id = c.organization_id
    WHERE c.organization_id = p_organization_id
      AND c.status NOT IN ('cancelled')
      AND c.valid_until IS NOT NULL
      AND (c.valid_until - CURRENT_DATE) <= p_days_ahead
  )
  SELECT
    gen_random_uuid() as id,
    cd.id as contract_id,
    cd.title as contract_title,
    cd.contract_number,
    cd.client_id,
    cd.client_name,
    cd.valid_until,
    cd.days_remaining,
    CASE
      WHEN cd.days_remaining < 0 THEN 'expired'
      WHEN cd.days_remaining <= 7 THEN 'critical'
      WHEN cd.days_remaining <= 30 THEN 'warning'
      ELSE 'upcoming'
    END as alert_type,
    cd.alert_status,
    cd.contract_status::TEXT,
    cd.amount,
    cd.total_amount,
    cd.created_at
  FROM contract_data cd
  ORDER BY cd.days_remaining ASC NULLS LAST;
$$;

-- Function to dismiss an alert
CREATE OR REPLACE FUNCTION dismiss_contract_alert(
  p_organization_id UUID,
  p_contract_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO contract_alert_settings (organization_id, contract_id, status, dismissed_by, dismissed_at)
  VALUES (p_organization_id, p_contract_id, 'dismissed', auth.uid(), NOW())
  ON CONFLICT (organization_id, contract_id)
  DO UPDATE SET
    status = 'dismissed',
    dismissed_by = auth.uid(),
    dismissed_at = NOW(),
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Function to acknowledge an alert
CREATE OR REPLACE FUNCTION acknowledge_contract_alert(
  p_organization_id UUID,
  p_contract_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO contract_alert_settings (organization_id, contract_id, status, acknowledged_by, acknowledged_at)
  VALUES (p_organization_id, p_contract_id, 'acknowledged', auth.uid(), NOW())
  ON CONFLICT (organization_id, contract_id)
  DO UPDATE SET
    status = 'acknowledged',
    acknowledged_by = auth.uid(),
    acknowledged_at = NOW(),
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Function to reset alert status (mark as active again)
CREATE OR REPLACE FUNCTION reset_contract_alert(
  p_organization_id UUID,
  p_contract_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM contract_alert_settings
  WHERE organization_id = p_organization_id
    AND contract_id = p_contract_id;

  RETURN TRUE;
END;
$$;

-- Function to get contract alert stats
CREATE OR REPLACE FUNCTION get_contract_alert_stats(p_organization_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  WITH alerts AS (
    SELECT * FROM get_contract_alerts(p_organization_id, 90)
    WHERE alert_status = 'active'
  )
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM alerts),
    'expired', (SELECT COUNT(*) FROM alerts WHERE alert_type = 'expired'),
    'critical', (SELECT COUNT(*) FROM alerts WHERE alert_type = 'critical'),
    'warning', (SELECT COUNT(*) FROM alerts WHERE alert_type = 'warning'),
    'upcoming', (SELECT COUNT(*) FROM alerts WHERE alert_type = 'upcoming')
  );
$$;
