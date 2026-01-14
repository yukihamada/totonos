-- Two-Factor Authentication Support
-- Stores TOTP secrets and recovery codes for users

-- Table for 2FA configuration per user
CREATE TABLE IF NOT EXISTS user_two_factor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- TOTP secret (encrypted)
  totp_secret_encrypted TEXT,
  -- Whether 2FA is fully enabled (after verification)
  enabled BOOLEAN DEFAULT FALSE,
  -- Recovery codes (hashed with bcrypt)
  recovery_codes JSONB DEFAULT '[]',
  -- When 2FA was enabled
  enabled_at TIMESTAMPTZ,
  -- Backup phone number for SMS fallback (optional)
  backup_phone TEXT,
  -- Last successful 2FA verification
  last_verified_at TIMESTAMPTZ,
  -- Failed verification attempts (for rate limiting)
  failed_attempts INT DEFAULT 0,
  -- Locked until (after too many failed attempts)
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_user_two_factor_user_id ON user_two_factor(user_id);

-- RLS Policies
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;

-- Users can only view their own 2FA config
CREATE POLICY "Users can view own 2FA config" ON user_two_factor
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own 2FA config
CREATE POLICY "Users can update own 2FA config" ON user_two_factor
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own 2FA config
CREATE POLICY "Users can insert own 2FA config" ON user_two_factor
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own 2FA config
CREATE POLICY "Users can delete own 2FA config" ON user_two_factor
  FOR DELETE USING (user_id = auth.uid());

-- Function: Initialize 2FA setup (creates pending entry)
CREATE OR REPLACE FUNCTION init_two_factor_setup(
  p_user_id UUID,
  p_totp_secret_encrypted TEXT
)
RETURNS JSONB AS $$
BEGIN
  INSERT INTO user_two_factor (user_id, totp_secret_encrypted, enabled)
  VALUES (p_user_id, p_totp_secret_encrypted, FALSE)
  ON CONFLICT (user_id)
  DO UPDATE SET
    totp_secret_encrypted = p_totp_secret_encrypted,
    enabled = FALSE,
    recovery_codes = '[]',
    updated_at = NOW();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete 2FA setup (after verification)
CREATE OR REPLACE FUNCTION complete_two_factor_setup(
  p_user_id UUID,
  p_recovery_codes JSONB
)
RETURNS JSONB AS $$
BEGIN
  UPDATE user_two_factor
  SET
    enabled = TRUE,
    enabled_at = NOW(),
    recovery_codes = p_recovery_codes,
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', '2FA setup not initialized');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get 2FA status for a user
CREATE OR REPLACE FUNCTION get_two_factor_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  tfa RECORD;
BEGIN
  SELECT enabled, enabled_at, last_verified_at, failed_attempts, locked_until
  INTO tfa
  FROM user_two_factor
  WHERE user_id = p_user_id;

  IF tfa IS NULL THEN
    RETURN jsonb_build_object(
      'enabled', false,
      'setup_pending', false
    );
  END IF;

  RETURN jsonb_build_object(
    'enabled', tfa.enabled,
    'setup_pending', NOT tfa.enabled,
    'enabled_at', tfa.enabled_at,
    'last_verified_at', tfa.last_verified_at,
    'is_locked', tfa.locked_until IS NOT NULL AND tfa.locked_until > NOW(),
    'locked_until', tfa.locked_until
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record 2FA verification attempt
CREATE OR REPLACE FUNCTION record_two_factor_attempt(
  p_user_id UUID,
  p_success BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  max_attempts INT := 5;
  lockout_duration INTERVAL := '15 minutes';
  current_attempts INT;
BEGIN
  IF p_success THEN
    UPDATE user_two_factor
    SET
      last_verified_at = NOW(),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('success', true, 'locked', false);
  ELSE
    UPDATE user_two_factor
    SET
      failed_attempts = failed_attempts + 1,
      locked_until = CASE
        WHEN failed_attempts + 1 >= max_attempts
        THEN NOW() + lockout_duration
        ELSE locked_until
      END,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING failed_attempts INTO current_attempts;

    RETURN jsonb_build_object(
      'success', false,
      'locked', current_attempts >= max_attempts,
      'attempts_remaining', GREATEST(0, max_attempts - current_attempts)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Use recovery code
CREATE OR REPLACE FUNCTION use_recovery_code(
  p_user_id UUID,
  p_code_hash TEXT
)
RETURNS JSONB AS $$
DECLARE
  tfa RECORD;
  codes JSONB;
  new_codes JSONB := '[]';
  code JSONB;
  found BOOLEAN := FALSE;
BEGIN
  SELECT recovery_codes, locked_until INTO tfa
  FROM user_two_factor
  WHERE user_id = p_user_id AND enabled = TRUE;

  IF tfa IS NULL THEN
    RETURN jsonb_build_object('error', '2FA not enabled');
  END IF;

  IF tfa.locked_until IS NOT NULL AND tfa.locked_until > NOW() THEN
    RETURN jsonb_build_object('error', 'Account temporarily locked', 'locked_until', tfa.locked_until);
  END IF;

  -- Check each recovery code
  FOR code IN SELECT * FROM jsonb_array_elements(tfa.recovery_codes)
  LOOP
    IF code->>'hash' = p_code_hash AND (code->>'used')::BOOLEAN = FALSE THEN
      -- Mark code as used
      new_codes := new_codes || jsonb_build_object(
        'hash', code->>'hash',
        'used', true,
        'used_at', NOW()
      );
      found := TRUE;
    ELSE
      new_codes := new_codes || code;
    END IF;
  END LOOP;

  IF NOT found THEN
    -- Record failed attempt
    PERFORM record_two_factor_attempt(p_user_id, FALSE);
    RETURN jsonb_build_object('error', 'Invalid recovery code');
  END IF;

  -- Update recovery codes
  UPDATE user_two_factor
  SET
    recovery_codes = new_codes,
    last_verified_at = NOW(),
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Count remaining codes
  SELECT COUNT(*) INTO found FROM jsonb_array_elements(new_codes)
  WHERE (value->>'used')::BOOLEAN = FALSE;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_codes', found
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Disable 2FA
CREATE OR REPLACE FUNCTION disable_two_factor(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM user_two_factor WHERE user_id = p_user_id;
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_two_factor_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_two_factor_updated
  BEFORE UPDATE ON user_two_factor
  FOR EACH ROW
  EXECUTE FUNCTION update_user_two_factor_timestamp();
