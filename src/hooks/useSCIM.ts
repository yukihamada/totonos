import { useState, useCallback } from 'react';

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

// Stub hook - tables don't exist in DB yet
export function useSCIM() {
  const [config] = useState<SCIMConfig | null>(null);
  const [tokens] = useState<SCIMToken[]>([]);
  const [logs] = useState<SCIMProvisioningLog[]>([]);
  const [stats] = useState<SCIMStats | null>(null);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Stub
  }, []);

  const toggleSCIM = useCallback(async (_enabled: boolean): Promise<boolean> => {
    return false;
  }, []);

  const updateConfig = useCallback(async (_updates: Partial<SCIMConfig>): Promise<boolean> => {
    return false;
  }, []);

  const generateToken = useCallback(async (_name: string, _expiresInDays?: number): Promise<{ token: string; id: string } | null> => {
    return null;
  }, []);

  const revokeToken = useCallback(async (_tokenId: string): Promise<boolean> => {
    return false;
  }, []);

  const deleteToken = useCallback(async (_tokenId: string): Promise<boolean> => {
    return false;
  }, []);

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
