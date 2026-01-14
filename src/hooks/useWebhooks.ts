import { useState, useCallback } from 'react';

export type WebhookEvent =
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'contract.created'
  | 'contract.signed'
  | 'contract.expired'
  | 'lead.created'
  | 'lead.converted'
  | 'deal.won'
  | 'deal.lost'
  | 'employee.onboarded'
  | 'employee.offboarded'
  | 'payment.received'
  | 'payment.failed'
  | 'document.uploaded'
  | 'task.completed';

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string; category: string }[] = [
  { value: 'invoice.created', label: '請求書作成', category: '請求' },
  { value: 'invoice.paid', label: '請求書支払い完了', category: '請求' },
  { value: 'invoice.overdue', label: '請求書期限超過', category: '請求' },
  { value: 'contract.created', label: '契約書作成', category: '契約' },
  { value: 'contract.signed', label: '契約署名完了', category: '契約' },
  { value: 'contract.expired', label: '契約期限切れ', category: '契約' },
  { value: 'lead.created', label: 'リード作成', category: '営業' },
  { value: 'lead.converted', label: 'リード変換', category: '営業' },
  { value: 'deal.won', label: '商談成立', category: '営業' },
  { value: 'deal.lost', label: '商談失注', category: '営業' },
  { value: 'employee.onboarded', label: '従業員入社', category: '人事' },
  { value: 'employee.offboarded', label: '従業員退社', category: '人事' },
  { value: 'payment.received', label: '入金完了', category: '支払い' },
  { value: 'payment.failed', label: '入金失敗', category: '支払い' },
  { value: 'document.uploaded', label: 'ドキュメント追加', category: 'その他' },
  { value: 'task.completed', label: 'タスク完了', category: 'その他' },
];

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  enabled: boolean;
  headers: Record<string, string>;
  maxRetries: number;
  timeoutSeconds: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  lastTriggeredAt: string | null;
  successRate: number;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode: number | null;
  responseBody: string | null;
  success: boolean;
  errorMessage: string | null;
  durationMs: number | null;
  attemptNumber: number;
  triggeredAt: string;
  completedAt: string | null;
}

interface CreateWebhookInput {
  name: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  maxRetries?: number;
  timeoutSeconds?: number;
}

interface UpdateWebhookInput extends Partial<CreateWebhookInput> {
  enabled?: boolean;
}

// Stub hook - tables don't exist in DB yet
export function useWebhooks() {
  const [webhooks] = useState<Webhook[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    // Stub
  }, []);

  const createWebhook = async (_input: CreateWebhookInput): Promise<Webhook | null> => {
    return null;
  };

  const updateWebhook = async (_id: string, _input: UpdateWebhookInput): Promise<boolean> => {
    return false;
  };

  const deleteWebhook = async (_id: string): Promise<boolean> => {
    return false;
  };

  const toggleWebhook = async (_id: string, _enabled: boolean): Promise<boolean> => {
    return false;
  };

  const regenerateSecret = async (_id: string): Promise<string | null> => {
    return null;
  };

  const getDeliveries = async (_webhookId: string, _limit = 50): Promise<WebhookDelivery[]> => {
    return [];
  };

  const testWebhook = async (_id: string): Promise<boolean> => {
    return false;
  };

  return {
    webhooks,
    isLoading,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    regenerateSecret,
    getDeliveries,
    testWebhook,
    refresh: fetchWebhooks,
  };
}

export type { Webhook, WebhookDelivery, CreateWebhookInput, UpdateWebhookInput };
