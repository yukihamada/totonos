import { useState, useCallback, useEffect } from 'react';
import type {
  HpkiBridgeStatus,
  HpkiSignatureRequest,
  HpkiSignatureResponse,
  HpkiReaderInfo,
} from '@/types/emr';

const BRIDGE_URL = 'http://localhost:8000';

export function useHpkiBridge() {
  const [status, setStatus] = useState<HpkiBridgeStatus>({
    connected: false,
    cardInserted: false,
  });
  const [readers, setReaders] = useState<HpkiReaderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check server health
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BRIDGE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Fetch reader list
  const fetchReaders = useCallback(async (): Promise<HpkiReaderInfo[]> => {
    try {
      const response = await fetch(`${BRIDGE_URL}/readers`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        return data.readers || [];
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  // Refresh status
  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const connected = await checkHealth();

      if (!connected) {
        setStatus({
          connected: false,
          cardInserted: false,
          error: 'HPKIブリッジサーバーに接続できません',
          lastChecked: new Date().toISOString(),
        });
        setReaders([]);
        return;
      }

      const readerList = await fetchReaders();
      setReaders(readerList);

      const cardReader = readerList.find((r) => r.hasCard);

      setStatus({
        connected: true,
        cardInserted: !!cardReader,
        readerName: readerList[0]?.name,
        cardHolderName: undefined, // Will be populated after successful sign
        lastChecked: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラー';
      setError(message);
      setStatus((prev) => ({
        ...prev,
        error: message,
        lastChecked: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
    }
  }, [checkHealth, fetchReaders]);

  // Sign data
  const sign = useCallback(
    async (request: HpkiSignatureRequest): Promise<HpkiSignatureResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BRIDGE_URL}/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(30000), // 30s timeout for PIN entry
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.detail ||
            (response.status === 400
              ? 'PINが正しくありません'
              : response.status === 404
              ? 'ICカードが挿入されていません'
              : 'ドライバーエラーが発生しました');

          setError(errorMessage);
          return { error: errorMessage };
        }

        const data = await response.json();
        return { signature_hex: data.signature_hex };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.name === 'TimeoutError'
              ? 'タイムアウトしました'
              : err.message
            : '署名中にエラーが発生しました';
        setError(message);
        return { error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial status check
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    readers,
    loading,
    error,
    refreshStatus,
    sign,
  };
}
