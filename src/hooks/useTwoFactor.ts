import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TwoFactorStatus {
  enabled: boolean;
  setupPending: boolean;
  enabledAt?: string;
  lastVerifiedAt?: string;
  isLocked: boolean;
  lockedUntil?: string;
}

interface SetupData {
  qrCode: string;
  secret: string;
  otpauthUri: string;
}

interface VerifyResult {
  success: boolean;
  recoveryCodes?: string[];
}

export function useTwoFactor() {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current 2FA status
  const fetchStatus = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus({
          enabled: data.enabled || false,
          setupPending: data.setup_pending || false,
          enabledAt: data.enabled_at,
          lastVerifiedAt: data.last_verified_at,
          isLocked: data.is_locked || false,
          lockedUntil: data.locked_until,
        });
      }
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Initialize 2FA setup
  const initSetup = useCallback(async (): Promise<SetupData> => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup/init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize 2FA setup');
      }

      const data = await response.json();
      await fetchStatus();

      return {
        qrCode: data.qrCode,
        secret: data.secret,
        otpauthUri: data.otpauthUri,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize 2FA';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, fetchStatus]);

  // Verify TOTP code during setup
  const verifySetup = useCallback(async (code: string): Promise<VerifyResult> => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();
      await fetchStatus();

      return {
        success: true,
        recoveryCodes: data.recoveryCodes,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, fetchStatus]);

  // Disable 2FA
  const disable = useCallback(async (code: string): Promise<boolean> => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-setup/disable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disable 2FA');
      }

      await fetchStatus();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, fetchStatus]);

  // Verify TOTP during login (called from login flow)
  const verifyLogin = useCallback(async (
    userId: string,
    code: string,
    useRecoveryCode = false
  ): Promise<{ success: boolean; verificationToken?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/totp-verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ userId, code, useRecoveryCode }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();
      return {
        success: true,
        verificationToken: data.verificationToken,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if 2FA is required for a user (for login flow)
  const checkRequired = useCallback(async (_email: string): Promise<boolean> => {
    // Stub - table doesn't exist
    return false;
  }, []);

  return {
    status,
    isLoading,
    error,
    isEnabled: status?.enabled || false,
    initSetup,
    verifySetup,
    disable,
    verifyLogin,
    checkRequired,
    refreshStatus: fetchStatus,
  };
}

// Export types for use in components
export type { TwoFactorStatus, SetupData, VerifyResult };
