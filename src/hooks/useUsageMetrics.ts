import { useState, useCallback } from 'react';

interface ApiUsage {
  date: string;
  requestCount: number;
  errorCount: number;
  avgLatency: number;
}

interface StorageUsage {
  files: number;
  totalBytes: number;
  byType: Record<string, number>;
}

interface PlanLimits {
  apiRequestsPerMonth: number;
  storageBytes: number;
  membersCount: number;
  apiKeysCount: number;
}

interface UsageMetrics {
  api: {
    daily: ApiUsage[];
    currentMonth: {
      total: number;
      errors: number;
      avgLatency: number;
    };
    previousMonth: {
      total: number;
      errors: number;
    };
  };
  storage: StorageUsage;
  members: {
    current: number;
    limit: number;
  };
  apiKeys: {
    current: number;
    limit: number;
    active: number;
  };
  plan: {
    name: string;
    limits: PlanLimits;
  };
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    apiRequestsPerMonth: 1000,
    storageBytes: 100 * 1024 * 1024, // 100 MB
    membersCount: 3,
    apiKeysCount: 1,
  },
  pro: {
    apiRequestsPerMonth: 50000,
    storageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    membersCount: 25,
    apiKeysCount: 10,
  },
  enterprise: {
    apiRequestsPerMonth: 1000000,
    storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    membersCount: -1, // Unlimited
    apiKeysCount: 100,
  },
};

// Mock metrics - tables don't exist in DB yet
const emptyMetrics: UsageMetrics = {
  api: {
    daily: [],
    currentMonth: { total: 0, errors: 0, avgLatency: 0 },
    previousMonth: { total: 0, errors: 0 },
  },
  storage: { files: 0, totalBytes: 0, byType: {} },
  members: { current: 0, limit: 3 },
  apiKeys: { current: 0, limit: 1, active: 0 },
  plan: { name: 'free', limits: PLAN_LIMITS.free },
};

export function useUsageMetrics() {
  const [metrics] = useState<UsageMetrics>(emptyMetrics);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    // Stub - tables don't exist
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
    usagePercentages: {
      api: 0,
      storage: 0,
      members: 0,
    },
    isNearLimit: {
      api: false,
      storage: false,
      members: false,
    },
    formatBytes: (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
  };
}

export type { UsageMetrics, ApiUsage, StorageUsage, PlanLimits };
