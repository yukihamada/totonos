import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  request_count: number;
}

// Hash API key using SHA-256
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'ttn_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function useApiKeys() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = useCallback(async () => {
    if (!user) {
      setApiKeys([]);
      setLoading(false);
      return;
    }

    try {
      // Use the safe view that excludes key_hash for security
      // Note: api_keys_safe is a view not in generated types, so we use type assertion
      const { data, error } = await supabase
        .from('api_keys_safe' as any)
        .select('id, name, key_prefix, created_at, last_used_at, request_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys((data as unknown as ApiKey[]) || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('API Keyの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createApiKey = async (name: string): Promise<string | null> => {
    if (!user) {
      toast.error('ログインが必要です');
      return null;
    }

    if (!name.trim()) {
      toast.error('API Key名を入力してください');
      return null;
    }

    try {
      const key = generateApiKey();
      const keyHash = await hashApiKey(key);
      const keyPrefix = key.slice(0, 8) + '...';

      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: name.trim(),
          key_hash: keyHash,
          key_prefix: keyPrefix,
        });

      if (error) throw error;

      await fetchApiKeys();
      toast.success('API Keyを作成しました');
      
      // Return the plain text key (only shown once)
      return key;
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('API Keyの作成に失敗しました');
      return null;
    }
  };

  const deleteApiKey = async (keyId: string): Promise<boolean> => {
    if (!user) {
      toast.error('ログインが必要です');
      return false;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      toast.success('API Keyを削除しました');
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('API Keyの削除に失敗しました');
      return false;
    }
  };

  return {
    apiKeys,
    loading,
    createApiKey,
    deleteApiKey,
    refreshApiKeys: fetchApiKeys,
  };
}
