import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  category: 'payment' | 'invoice' | 'contract' | 'system' | 'hr' | 'crm';
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: '入金確認',
    message: '株式会社ABCから500,000円の入金がありました',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    link: '/reconciliation',
    category: 'payment',
  },
  {
    id: '2',
    type: 'warning',
    title: '支払期限間近',
    message: 'INV-2026-015の支払期限が3日後です',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    link: '/invoices',
    category: 'invoice',
  },
  {
    id: '3',
    type: 'info',
    title: '契約書署名完了',
    message: '株式会社XYZとの業務委託契約が署名完了しました',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    link: '/contracts',
    category: 'contract',
  },
  {
    id: '4',
    type: 'error',
    title: '支払期限超過',
    message: 'INV-2026-008が30日以上未回収です',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    link: '/accounting/receivables',
    category: 'invoice',
  },
  {
    id: '5',
    type: 'info',
    title: '休暇申請',
    message: '山田太郎さんから休暇申請があります',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    link: '/leave-requests',
    category: 'hr',
  },
  {
    id: '6',
    type: 'success',
    title: '商談成約',
    message: '株式会社DEFとの商談が成約しました (¥2,500,000)',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    link: '/deals',
    category: 'crm',
  },
  {
    id: '7',
    type: 'info',
    title: 'Trust Score更新',
    message: 'あなたのTrust Scoreが720から750に上がりました',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    link: '/trust-passport',
    category: 'system',
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };
}
