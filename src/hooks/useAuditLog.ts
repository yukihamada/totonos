import { useState, useEffect, useCallback } from 'react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';
  resource: string;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}

export type AuditActionType = AuditLogEntry['action'];

// Mock audit log data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userId: 'user-1',
    userName: '山田 太郎',
    userEmail: 'yamada@example.com',
    action: 'create',
    resource: 'invoices',
    resourceId: 'INV-2024-001',
    resourceName: '請求書 INV-2024-001',
    details: '新規請求書を作成しました',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userId: 'user-1',
    userName: '山田 太郎',
    userEmail: 'yamada@example.com',
    action: 'update',
    resource: 'contracts',
    resourceId: 'CON-001',
    resourceName: '業務委託契約',
    details: '契約ステータスを「締結済み」に変更',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userId: 'user-2',
    userName: '佐藤 花子',
    userEmail: 'sato@example.com',
    action: 'export',
    resource: 'employees',
    resourceName: '従業員一覧',
    details: 'CSV形式でエクスポート（50件）',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userId: 'user-3',
    userName: '鈴木 一郎',
    userEmail: 'suzuki@example.com',
    action: 'login',
    resource: 'auth',
    details: 'ログインに成功しました',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    status: 'success',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userId: 'user-unknown',
    userName: '不明',
    userEmail: 'unknown@example.com',
    action: 'login',
    resource: 'auth',
    details: 'ログインに失敗しました（パスワード不一致）',
    ipAddress: '203.0.113.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'failure',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    userId: 'user-1',
    userName: '山田 太郎',
    userEmail: 'yamada@example.com',
    action: 'delete',
    resource: 'leads',
    resourceId: 'LEAD-005',
    resourceName: 'テスト株式会社',
    details: 'リードを削除しました',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userId: 'user-2',
    userName: '佐藤 花子',
    userEmail: 'sato@example.com',
    action: 'read',
    resource: 'payroll',
    resourceId: 'PAY-2024-01',
    resourceName: '2024年1月給与データ',
    details: '給与データを閲覧しました',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
  },
];

export interface AuditLogFilters {
  action?: AuditActionType;
  resource?: string;
  userId?: string;
  status?: 'success' | 'failure';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLogs(mockAuditLogs);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.resource && log.resource !== filters.resource) return false;
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchFields = [
        log.userName,
        log.userEmail,
        log.resourceName,
        log.details,
        log.ipAddress,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchFields.includes(query)) return false;
    }
    return true;
  });

  const logAction = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newEntry, ...prev]);
  }, []);

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failure: logs.filter(l => l.status === 'failure').length,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp).toDateString();
      return logDate === new Date().toDateString();
    }).length,
  };

  const resourceTypes = [...new Set(logs.map(l => l.resource))];
  const users = [...new Set(logs.map(l => l.userName))];

  return {
    logs: filteredLogs,
    allLogs: logs,
    isLoading,
    filters,
    setFilters,
    logAction,
    stats,
    resourceTypes,
    users,
  };
}
