import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContractAlert {
  id: string;
  contractId: string;
  contractTitle: string;
  clientName: string;
  validUntil: string;
  daysRemaining: number;
  alertType: 'expired' | 'critical' | 'warning' | 'upcoming';
  status: 'active' | 'dismissed' | 'acknowledged';
  createdAt: string;
}

function getAlertType(daysRemaining: number): ContractAlert['alertType'] {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'warning';
  return 'upcoming';
}

export function useContractAlerts() {
  const [alertStatuses, setAlertStatuses] = useState<Record<string, 'active' | 'dismissed' | 'acknowledged'>>({});

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contract-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          title,
          valid_until,
          status,
          client:client_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .not('valid_until', 'is', null)
        .in('status', ['draft', 'sent', 'signed']);

      if (error) throw error;
      return data || [];
    },
  });

  const alerts: ContractAlert[] = contracts
    .map(contract => {
      const validUntil = new Date(contract.valid_until as string);
      const today = new Date();
      const diffTime = validUntil.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Only show alerts for contracts expiring within 90 days or already expired
      if (daysRemaining > 90) return null;

      const alertId = `alert-${contract.id}`;
      return {
        id: alertId,
        contractId: contract.id,
        contractTitle: contract.title,
        clientName: (contract.client as any)?.name || '取引先不明',
        validUntil: contract.valid_until as string,
        daysRemaining,
        alertType: getAlertType(daysRemaining),
        status: alertStatuses[alertId] || 'active' as const,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((alert): alert is ContractAlert => alert !== null)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const dismissAlert = useCallback((alertId: string) => {
    setAlertStatuses(prev => ({ ...prev, [alertId]: 'dismissed' }));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlertStatuses(prev => ({ ...prev, [alertId]: 'acknowledged' }));
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const expiredCount = activeAlerts.filter(a => a.alertType === 'expired').length;
  const criticalCount = activeAlerts.filter(a => a.alertType === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.alertType === 'warning').length;

  return {
    alerts,
    activeAlerts,
    isLoading,
    dismissAlert,
    acknowledgeAlert,
    stats: {
      total: activeAlerts.length,
      expired: expiredCount,
      critical: criticalCount,
      warning: warningCount,
    },
  };
}
