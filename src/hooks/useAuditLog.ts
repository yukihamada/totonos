import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';

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

export interface AuditLogFilters {
  action?: AuditActionType;
  resource?: string;
  userId?: string;
  status?: 'success' | 'failure';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// Map database action to display action
function mapAction(action: string): AuditLogEntry['action'] {
  const mapping: Record<string, AuditLogEntry['action']> = {
    'INSERT': 'create',
    'UPDATE': 'update',
    'DELETE': 'delete',
    'SELECT': 'read',
    'EXPORT': 'export',
    'IMPORT': 'import',
  };
  return mapping[action?.toUpperCase()] || 'update';
}

// Get resource label in Japanese
function getResourceLabel(resource: string): string {
  const labels: Record<string, string> = {
    invoices: '請求書',
    contracts: '契約書',
    leads: 'リード',
    deals: '商談',
    employees: '従業員',
    clients: '取引先',
    estimates: '見積書',
    projects: 'プロジェクト',
    tasks: 'タスク',
    members: '会員',
    attendance_records: '勤怠',
    journal_entries: '仕訳',
  };
  return labels[resource] || resource;
}

// Get details from query_details
function extractDetails(queryDetails: any, operation: string): string | undefined {
  if (!queryDetails) return undefined;
  
  if (operation === 'INSERT' && queryDetails.invoice_number) {
    return `請求書番号: ${queryDetails.invoice_number}`;
  }
  if (operation === 'INSERT' && queryDetails.deal_name) {
    return `商談名: ${queryDetails.deal_name}`;
  }
  if (operation === 'INSERT' && queryDetails.company_name) {
    return `会社名: ${queryDetails.company_name}`;
  }
  if (operation === 'INSERT' && queryDetails.title) {
    return `タイトル: ${queryDetails.title}`;
  }
  if (operation === 'UPDATE' && queryDetails.new) {
    const changes = Object.keys(queryDetails.new).length;
    return `${changes}項目を変更`;
  }
  
  return undefined;
}

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { data: currentCompany } = useCurrentCompany();

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        // Fetch from data_access_audit_log with user profile info
        const { data: auditData, error } = await supabase
          .from('data_access_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.error('Failed to fetch audit logs:', error);
          setLogs([]);
          return;
        }

        // Get unique user IDs
        const userIds = [...new Set((auditData || []).map(e => e.user_id).filter(Boolean))];
        
        // Fetch user profiles (only display_name exists in profiles table)
        const profileMap = new Map<string, { display_name: string | null }>();
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', userIds);
          
          if (profiles) {
            for (const profile of profiles) {
              profileMap.set(profile.user_id, {
                display_name: profile.display_name,
              });
            }
          }
        }

        const auditLogs: AuditLogEntry[] = [];

        // Convert audit log data
        if (auditData && auditData.length > 0) {
          for (const entry of auditData) {
            const profile = profileMap.get(entry.user_id);
            const queryDetails = entry.query_details as Record<string, any> | null;
            
            auditLogs.push({
              id: entry.id,
              timestamp: entry.created_at,
              userId: entry.user_id || 'unknown',
              userName: profile?.display_name || 'ユーザー',
              userEmail: '',
              action: mapAction(entry.operation),
              resource: entry.table_name,
              resourceId: entry.record_id || undefined,
              resourceName: getResourceLabel(entry.table_name),
              details: extractDetails(queryDetails, entry.operation) || 
                (entry.record_count ? `${entry.record_count}件のデータにアクセス` : undefined),
              ipAddress: entry.ip_address || '不明',
              userAgent: entry.user_agent || '不明',
              status: 'success',
              metadata: queryDetails || undefined,
            });
          }
        }

        setLogs(auditLogs);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [currentCompany]);

  const filteredLogs = logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.resource && log.resource !== filters.resource) return false;
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.startDate) {
      const logDate = new Date(log.timestamp);
      if (logDate < new Date(filters.startDate)) return false;
    }
    if (filters.endDate) {
      const logDate = new Date(log.timestamp);
      if (logDate > new Date(filters.endDate)) return false;
    }
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

  const logAction = useCallback(async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    // Insert into data_access_audit_log
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from('data_access_audit_log').insert({
        user_id: currentUser?.id || entry.userId,
        table_name: entry.resource,
        operation: entry.action.toUpperCase(),
        record_id: entry.resourceId || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        query_details: entry.metadata || {},
      } as any);
    } catch (error) {
      console.error('Failed to log action:', error);
    }

    // Update local state
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
