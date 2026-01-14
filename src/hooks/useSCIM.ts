import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

export interface SCIMConfig {
  id: string;
  isEnabled: boolean;
  autoCreateUsers: boolean;
  autoUpdateUsers: boolean;
  autoDeactivateUsers: boolean;
  defaultRole: string;
  attributeMapping: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface SCIMToken {
  id: string;
  name: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SCIMProvisioningLog {
  id: string;
  operation: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  resourceType: 'User' | 'Group';
  resourceId: string | null;
  scimId: string | null;
  responseStatus: number;
  errorMessage: string | null;
  createdAt: string;
}

export interface SCIMStats {
  totalUsers: number;
  totalGroups: number;
  recentOperations: SCIMProvisioningLog[];
  operationsToday: number;
  errorsToday: number;
}

export function useSCIM() {
  const { currentOrganization } = useOrganization();
  const [config, setConfig] = useState<SCIMConfig | null>(null);
  const [tokens, setTokens] = useState<SCIMToken[]>([]);
  const [logs, setLogs] = useState<SCIMProvisioningLog[]>([]);
  const [stats, setStats] = useState<SCIMStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch SCIM configuration
  const fetchConfig = useCallback(async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('scim_configurations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setConfig({
          id: data.id,
          isEnabled: data.is_enabled,
          autoCreateUsers: data.auto_create_users,
          autoUpdateUsers: data.auto_update_users,
          autoDeactivateUsers: data.auto_deactivate_users,
          defaultRole: data.default_role,
          attributeMapping: data.attribute_mapping,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        setConfig(null);
      }
    } catch (err) {
      console.error('Failed to fetch SCIM config:', err);
    }
  }, [currentOrganization?.id]);

  // Fetch SCIM tokens
  const fetchTokens = useCallback(async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('scim_tokens')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTokens((data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        lastUsedAt: t.last_used_at,
        expiresAt: t.expires_at,
        isActive: t.is_active,
        createdAt: t.created_at,
      })));
    } catch (err) {
      console.error('Failed to fetch SCIM tokens:', err);
    }
  }, [currentOrganization?.id]);

  // Fetch SCIM provisioning logs
  const fetchLogs = useCallback(async (limit = 50) => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('scim_provisioning_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setLogs((data || []).map((l: any) => ({
        id: l.id,
        operation: l.operation,
        resourceType: l.resource_type,
        resourceId: l.resource_id,
        scimId: l.scim_id,
        responseStatus: l.response_status,
        errorMessage: l.error_message,
        createdAt: l.created_at,
      })));
    } catch (err) {
      console.error('Failed to fetch SCIM logs:', err);
    }
  }, [currentOrganization?.id]);

  // Fetch SCIM stats
  const fetchStats = useCallback(async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error: fetchError } = await supabase.rpc('get_scim_stats', {
        p_organization_id: currentOrganization.id,
      });

      if (fetchError) throw fetchError;

      if (data) {
        setStats({
          totalUsers: data.total_users || 0,
          totalGroups: data.total_groups || 0,
          recentOperations: (data.recent_operations || []).map((op: any) => ({
            id: op.id,
            operation: op.operation,
            resourceType: op.resource_type,
            createdAt: op.created_at,
            responseStatus: op.status,
          })),
          operationsToday: data.operations_today || 0,
          errorsToday: data.errors_today || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch SCIM stats:', err);
    }
  }, [currentOrganization?.id]);

  // Initialize/refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchConfig(),
        fetchTokens(),
        fetchLogs(),
        fetchStats(),
      ]);
    } catch (err) {
      setError('SCIMデータの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [fetchConfig, fetchTokens, fetchLogs, fetchStats]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Enable/disable SCIM
  const toggleSCIM = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!currentOrganization?.id) return false;

    try {
      const { error: upsertError } = await supabase
        .from('scim_configurations')
        .upsert({
          organization_id: currentOrganization.id,
          is_enabled: enabled,
        }, {
          onConflict: 'organization_id',
        });

      if (upsertError) throw upsertError;

      await fetchConfig();
      return true;
    } catch (err) {
      console.error('Failed to toggle SCIM:', err);
      setError('SCIMの設定変更に失敗しました');
      return false;
    }
  }, [currentOrganization?.id, fetchConfig]);

  // Update SCIM configuration
  const updateConfig = useCallback(async (updates: Partial<SCIMConfig>): Promise<boolean> => {
    if (!currentOrganization?.id) return false;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.isEnabled !== undefined) dbUpdates.is_enabled = updates.isEnabled;
      if (updates.autoCreateUsers !== undefined) dbUpdates.auto_create_users = updates.autoCreateUsers;
      if (updates.autoUpdateUsers !== undefined) dbUpdates.auto_update_users = updates.autoUpdateUsers;
      if (updates.autoDeactivateUsers !== undefined) dbUpdates.auto_deactivate_users = updates.autoDeactivateUsers;
      if (updates.defaultRole !== undefined) dbUpdates.default_role = updates.defaultRole;
      if (updates.attributeMapping !== undefined) dbUpdates.attribute_mapping = updates.attributeMapping;
      dbUpdates.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('scim_configurations')
        .upsert({
          organization_id: currentOrganization.id,
          ...dbUpdates,
        }, {
          onConflict: 'organization_id',
        });

      if (updateError) throw updateError;

      await fetchConfig();
      return true;
    } catch (err) {
      console.error('Failed to update SCIM config:', err);
      setError('SCIM設定の更新に失敗しました');
      return false;
    }
  }, [currentOrganization?.id, fetchConfig]);

  // Generate a new SCIM token
  const generateToken = useCallback(async (name: string, expiresInDays?: number): Promise<{ token: string; id: string } | null> => {
    if (!currentOrganization?.id) return null;

    try {
      // Generate random token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = `scim_${Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;

      // Hash token for storage
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(token));
      const tokenHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error: createError } = await supabase.rpc('create_scim_token', {
        p_organization_id: currentOrganization.id,
        p_name: name,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      });

      if (createError) throw createError;

      await fetchTokens();
      return { token, id: data };
    } catch (err) {
      console.error('Failed to generate SCIM token:', err);
      setError('SCIMトークンの生成に失敗しました');
      return null;
    }
  }, [currentOrganization?.id, fetchTokens]);

  // Revoke a SCIM token
  const revokeToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('scim_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (updateError) throw updateError;

      await fetchTokens();
      return true;
    } catch (err) {
      console.error('Failed to revoke SCIM token:', err);
      setError('SCIMトークンの無効化に失敗しました');
      return false;
    }
  }, [fetchTokens]);

  // Delete a SCIM token
  const deleteToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('scim_tokens')
        .delete()
        .eq('id', tokenId);

      if (deleteError) throw deleteError;

      await fetchTokens();
      return true;
    } catch (err) {
      console.error('Failed to delete SCIM token:', err);
      setError('SCIMトークンの削除に失敗しました');
      return false;
    }
  }, [fetchTokens]);

  // Get SCIM endpoint URL
  const getScimEndpointUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    return `${baseUrl}/functions/v1/scim/v2`;
  }, []);

  return {
    config,
    tokens,
    logs,
    stats,
    isLoading,
    error,
    toggleSCIM,
    updateConfig,
    generateToken,
    revokeToken,
    deleteToken,
    getScimEndpointUrl,
    refresh,
  };
}
