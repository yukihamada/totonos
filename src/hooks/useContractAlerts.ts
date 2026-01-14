import { useState, useEffect, useCallback } from 'react';

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

// Mock contract data for alerts
const mockContracts = [
  { id: '1', title: '業務委託契約', clientName: '株式会社ABC', validUntil: '2026-01-20', status: 'active' },
  { id: '2', title: '保守契約', clientName: 'DEF株式会社', validUntil: '2026-01-25', status: 'active' },
  { id: '3', title: 'ライセンス契約', clientName: 'GHI商事', validUntil: '2026-02-15', status: 'active' },
  { id: '4', title: '秘密保持契約', clientName: 'JKL工業', validUntil: '2026-03-01', status: 'active' },
  { id: '5', title: 'サービス契約', clientName: 'MNO株式会社', validUntil: '2025-12-31', status: 'active' },
];

function getAlertType(daysRemaining: number): ContractAlert['alertType'] {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'warning';
  return 'upcoming';
}

function generateAlerts(): ContractAlert[] {
  const today = new Date();

  return mockContracts.map(contract => {
    const validUntil = new Date(contract.validUntil);
    const diffTime = validUntil.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: `alert-${contract.id}`,
      contractId: contract.id,
      contractTitle: contract.title,
      clientName: contract.clientName,
      validUntil: contract.validUntil,
      daysRemaining,
      alertType: getAlertType(daysRemaining),
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    };
  }).filter(alert => alert.daysRemaining <= 90); // Only show alerts for next 90 days
}

export function useContractAlerts() {
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAlerts(generateAlerts());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'dismissed' as const } : alert
    ));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
    ));
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
