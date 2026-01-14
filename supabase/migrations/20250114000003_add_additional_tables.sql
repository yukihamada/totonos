-- Receipts (OCR処理結果)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vendor TEXT,
  date DATE,
  total DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2),
  items JSONB DEFAULT '[]',
  raw_text TEXT,
  confidence DECIMAL(3, 2),
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'approved', 'rejected')),
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Integrations
CREATE TABLE IF NOT EXISTS email_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id, provider)
);

-- Synced Emails
CREATE TABLE IF NOT EXISTS synced_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  subject TEXT,
  from_address TEXT,
  to_address TEXT,
  date TIMESTAMPTZ,
  snippet TEXT,
  thread_id TEXT,
  labels JSONB DEFAULT '[]',
  lead_id UUID,
  deal_id UUID,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, external_id)
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  plaid_account_id TEXT,
  name TEXT NOT NULL,
  institution TEXT,
  account_type TEXT,
  subtype TEXT,
  mask TEXT,
  access_token TEXT,
  balance DECIMAL(12, 2),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  external_id TEXT,
  date DATE NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  balance DECIMAL(12, 2),
  type TEXT CHECK (type IN ('credit', 'debit')),
  category TEXT,
  reconciled BOOLEAN DEFAULT FALSE,
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bank_account_id, external_id)
);

-- SSO Configurations
CREATE TABLE IF NOT EXISTS sso_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('okta', 'azure', 'google', 'custom')),
  entity_id TEXT NOT NULL,
  sso_url TEXT NOT NULL,
  certificate TEXT NOT NULL,
  attribute_mapping JSONB DEFAULT '{"email": "email", "name": "name"}',
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Payslips (給与明細)
CREATE TABLE IF NOT EXISTS payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
  overtime_pay DECIMAL(12, 2) DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  gross_pay DECIMAL(12, 2) NOT NULL DEFAULT 0,
  income_tax DECIMAL(12, 2) DEFAULT 0,
  resident_tax DECIMAL(12, 2) DEFAULT 0,
  social_insurance DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_pay DECIMAL(12, 2) NOT NULL DEFAULT 0,
  details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued')),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, employee_id, year, month)
);

-- Portal Tokens (従業員ポータル用)
CREATE TABLE IF NOT EXISTS portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receipts_org ON receipts(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_integrations_org ON email_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_org ON synced_emails(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_payslips_org ON payslips(organization_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_token ON portal_tokens(token);

-- RLS Policies
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE synced_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tokens ENABLE ROW LEVEL SECURITY;

-- Receipts Policy
CREATE POLICY "Users can manage their organization's receipts" ON receipts
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Email Integrations Policy
CREATE POLICY "Users can manage their email integrations" ON email_integrations
  FOR ALL USING (user_id = auth.uid());

-- Synced Emails Policy
CREATE POLICY "Users can view their synced emails" ON synced_emails
  FOR ALL USING (user_id = auth.uid());

-- Bank Accounts Policy
CREATE POLICY "Users can manage their organization's bank accounts" ON bank_accounts
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Bank Transactions Policy
CREATE POLICY "Users can view their organization's bank transactions" ON bank_transactions
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- SSO Config Policy (admin only)
CREATE POLICY "Admins can manage SSO config" ON sso_configs
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Payslips Policy (HR managers and above)
CREATE POLICY "HR can manage payslips" ON payslips
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Portal Tokens Policy
CREATE POLICY "Admins can manage portal tokens" ON portal_tokens
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );
