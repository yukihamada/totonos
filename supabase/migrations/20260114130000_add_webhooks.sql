-- Webhook Management System
-- Allows organizations to register webhooks for various events

-- Available webhook events
CREATE TYPE webhook_event AS ENUM (
  'invoice.created',
  'invoice.paid',
  'invoice.overdue',
  'contract.created',
  'contract.signed',
  'contract.expired',
  'lead.created',
  'lead.converted',
  'deal.won',
  'deal.lost',
  'employee.onboarded',
  'employee.offboarded',
  'payment.received',
  'payment.failed',
  'document.uploaded',
  'task.completed'
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  -- Secret key for signing payloads (HMAC-SHA256)
  secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Events to trigger this webhook
  events webhook_event[] NOT NULL DEFAULT '{}',
  -- Whether the webhook is active
  enabled BOOLEAN DEFAULT TRUE,
  -- Headers to include in requests
  headers JSONB DEFAULT '{}',
  -- Number of retry attempts
  max_retries INT DEFAULT 3,
  -- Timeout in seconds
  timeout_seconds INT DEFAULT 30,
  -- Statistics
  total_deliveries INT DEFAULT 0,
  successful_deliveries INT DEFAULT 0,
  failed_deliveries INT DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook delivery log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event webhook_event NOT NULL,
  -- Payload sent
  payload JSONB NOT NULL,
  -- Response received
  status_code INT,
  response_body TEXT,
  response_headers JSONB,
  -- Timing
  duration_ms INT,
  -- Whether delivery was successful
  success BOOLEAN DEFAULT FALSE,
  -- Error message if failed
  error_message TEXT,
  -- Retry information
  attempt_number INT DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_triggered_at ON webhook_deliveries(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success);

-- RLS Policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Webhooks: Organization admins can manage
CREATE POLICY "Admins can view webhooks" ON webhooks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can create webhooks" ON webhooks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update webhooks" ON webhooks
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete webhooks" ON webhooks
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Webhook Deliveries: View for admins
CREATE POLICY "Admins can view webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (
    webhook_id IN (
      SELECT w.id FROM webhooks w
      JOIN organization_members om ON w.organization_id = om.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

-- Function: Dispatch webhook to all matching webhooks for an event
CREATE OR REPLACE FUNCTION dispatch_webhook(
  p_organization_id UUID,
  p_event webhook_event,
  p_payload JSONB
)
RETURNS SETOF UUID AS $$
DECLARE
  webhook_record RECORD;
  delivery_id UUID;
BEGIN
  -- Find all enabled webhooks for this org that listen to this event
  FOR webhook_record IN
    SELECT id, url, secret, headers, max_retries, timeout_seconds
    FROM webhooks
    WHERE organization_id = p_organization_id
      AND enabled = TRUE
      AND p_event = ANY(events)
  LOOP
    -- Create delivery record
    INSERT INTO webhook_deliveries (
      webhook_id,
      event,
      payload,
      attempt_number
    )
    VALUES (
      webhook_record.id,
      p_event,
      p_payload,
      1
    )
    RETURNING id INTO delivery_id;

    -- Update webhook statistics
    UPDATE webhooks
    SET
      total_deliveries = total_deliveries + 1,
      last_triggered_at = NOW()
    WHERE id = webhook_record.id;

    -- Return delivery ID for async processing
    RETURN NEXT delivery_id;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark delivery as completed
CREATE OR REPLACE FUNCTION complete_webhook_delivery(
  p_delivery_id UUID,
  p_success BOOLEAN,
  p_status_code INT DEFAULT NULL,
  p_response_body TEXT DEFAULT NULL,
  p_response_headers JSONB DEFAULT NULL,
  p_duration_ms INT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  webhook_id_var UUID;
BEGIN
  -- Update delivery record
  UPDATE webhook_deliveries
  SET
    success = p_success,
    status_code = p_status_code,
    response_body = p_response_body,
    response_headers = p_response_headers,
    duration_ms = p_duration_ms,
    error_message = p_error_message,
    completed_at = NOW()
  WHERE id = p_delivery_id
  RETURNING webhook_id INTO webhook_id_var;

  -- Update webhook statistics
  IF p_success THEN
    UPDATE webhooks
    SET successful_deliveries = successful_deliveries + 1
    WHERE id = webhook_id_var;
  ELSE
    UPDATE webhooks
    SET failed_deliveries = failed_deliveries + 1
    WHERE id = webhook_id_var;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get webhooks with delivery stats
CREATE OR REPLACE FUNCTION get_webhooks_with_stats(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  url TEXT,
  events webhook_event[],
  enabled BOOLEAN,
  total_deliveries INT,
  successful_deliveries INT,
  failed_deliveries INT,
  last_triggered_at TIMESTAMPTZ,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    w.url,
    w.events,
    w.enabled,
    w.total_deliveries,
    w.successful_deliveries,
    w.failed_deliveries,
    w.last_triggered_at,
    CASE
      WHEN w.total_deliveries > 0
      THEN ROUND((w.successful_deliveries::NUMERIC / w.total_deliveries) * 100, 2)
      ELSE 100.00
    END as success_rate
  FROM webhooks w
  WHERE w.organization_id = p_organization_id
  ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_webhooks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhooks_updated
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_timestamp();
