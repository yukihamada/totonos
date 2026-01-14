import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AISettings, DEFAULT_AI_SETTINGS, AIProvider } from '@/types/ai-settings';
import { toast } from 'sonner';

export function useAISettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_ai_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data as unknown as AISettings);
      } else {
        // Return default settings if none exist
        setSettings({
          ...DEFAULT_AI_SETTINGS,
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      toast.error('AI設定の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AISettings>) => {
    if (!user) return;

    setSaving(true);
    try {
      const newSettings = {
        ...settings,
        ...updates,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_ai_settings')
        .upsert(
          {
            user_id: user.id,
            provider: newSettings.provider,
            model: newSettings.model,
            custom_api_key: newSettings.custom_api_key || null,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      setSettings(data as unknown as AISettings);
      toast.success('AI設定を保存しました');
    } catch (error) {
      console.error('Error updating AI settings:', error);
      toast.error('AI設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const setProvider = (provider: AIProvider) => {
    // Set default model for the provider
    let defaultModel = 'google/gemini-3-flash-preview';
    if (provider === 'openai') {
      defaultModel = 'gpt-4o';
    } else if (provider === 'anthropic') {
      defaultModel = 'claude-sonnet-4-20250514';
    }
    updateSettings({ provider, model: defaultModel });
  };

  const setModel = (model: string) => {
    updateSettings({ model });
  };

  const setApiKey = (custom_api_key: string) => {
    updateSettings({ custom_api_key });
  };

  const testConnection = async (): Promise<boolean> => {
    if (!settings) return false;

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{ role: 'user', content: 'テスト' }],
          test: true,
        },
      });

      if (error) throw error;
      toast.success('接続テスト成功');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('接続テスト失敗: 設定を確認してください');
      return false;
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    setProvider,
    setModel,
    setApiKey,
    testConnection,
    refetch: fetchSettings,
  };
}
