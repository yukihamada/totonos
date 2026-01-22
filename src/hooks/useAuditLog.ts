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

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { data: currentCompany } = useCurrentCompany();

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        // Fetch from data_access_audit_log if available
        const { data: auditData } = await supabase
          .from('data_access_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        const auditLogs: AuditLogEntry[] = [];

        // Convert audit log data
        if (auditData && auditData.length > 0) {
          for (const entry of auditData) {
            auditLogs.push({
              id: entry.id,
              timestamp: entry.created_at,
              userId: entry.user_id || 'unknown',
              userName: 'ユーザー',
              userEmail: '',
              action: mapAction(entry.operation),
              resource: entry.table_name,
              resourceId: entry.record_id || undefined,
              resourceName: `${getResourceLabel(entry.table_name)}`,
              details: entry.record_count ? `${entry.record_count}件のデータにアクセス` : undefined,
              ipAddress: entry.ip_address || '不明',
              userAgent: entry.user_agent || '不明',
              status: 'success',
              metadata: entry.query_details as Record<string, unknown> || undefined,
            });
          }
        }

        // If no audit logs, fetch recent activities from main tables
        if (auditLogs.length === 0) {
          // Fetch recent invoices
          const { data: invoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount, status, created_at, updated_at')
            .order('updated_at', { ascending: false })
            .limit(20);

          if (invoices) {
            for (const inv of invoices) {
              const isNew = new Date(inv.created_at).getTime() === new Date(inv.updated_at).getTime();
              auditLogs.push({
                id: `inv-${inv.id}`,
                timestamp: inv.updated_at,
                userId: 'current-user',
                userName: 'ユーザー',
                userEmail: '',
                action: isNew ? 'create' : 'update',
                resource: 'invoices',
                resourceId: inv.id,
                resourceName: `請求書 ${inv.invoice_number}`,
                details: `¥${Number(inv.total_amount).toLocaleString()}`,
                ipAddress: '',
                userAgent: '',
                status: 'success',
              });
            }
          }

          // Fetch recent contracts
          const { data: contracts } = await supabase
            .from('contracts')
            .select('id, title, status, created_at, updated_at')
            .order('updated_at', { ascending: false })
            .limit(20);

          if (contracts) {
            for (const contract of contracts) {
              const isNew = new Date(contract.created_at).getTime() === new Date(contract.updated_at).getTime();
              auditLogs.push({
                id: `con-${contract.id}`,
                timestamp: contract.updated_at,
                userId: 'current-user',
                userName: 'ユーザー',
                userEmail: '',
                action: isNew ? 'create' : 'update',
                resource: 'contracts',
                resourceId: contract.id,
                resourceName: `契約書: ${contract.title}`,
                details: `ステータス: ${contract.status}`,
                ipAddress: '',
                userAgent: '',
                status: 'success',
              });
            }
          }

          // Fetch recent leads
          const { data: leads } = await supabase
            .from('leads')
            .select('id, company_name, status, created_at, updated_at')
            .order('updated_at', { ascending: false })
            .limit(20);

          if (leads) {
            for (const lead of leads) {
              const isNew = new Date(lead.created_at).getTime() === new Date(lead.updated_at).getTime();
              auditLogs.push({
                id: `lead-${lead.id}`,
                timestamp: lead.updated_at,
                userId: 'current-user',
                userName: 'ユーザー',
                userEmail: '',
                action: isNew ? 'create' : 'update',
                resource: 'leads',
                resourceId: lead.id,
                resourceName: `リード: ${lead.company_name}`,
                details: `ステータス: ${lead.status}`,
                ipAddress: '',
                userAgent: '',
                status: 'success',
              });
            }
          }

          // Fetch recent deals
          const { data: deals } = await supabase
            .from('deals')
            .select('id, deal_name, stage, amount, created_at, updated_at')
            .order('updated_at', { ascending: false })
            .limit(20);

          if (deals) {
            for (const deal of deals) {
              const isNew = new Date(deal.created_at).getTime() === new Date(deal.updated_at).getTime();
              auditLogs.push({
                id: `deal-${deal.id}`,
                timestamp: deal.updated_at,
                userId: 'current-user',
                userName: 'ユーザー',
                userEmail: '',
                action: isNew ? 'create' : 'update',
                resource: 'deals',
                resourceId: deal.id,
                resourceName: `商談: ${deal.deal_name}`,
                details: deal.amount ? `¥${Number(deal.amount).toLocaleString()}` : `ステージ: ${deal.stage}`,
                ipAddress: '',
                userAgent: '',
                status: 'success',
              });
            }
          }

          // Sort by timestamp
          auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
