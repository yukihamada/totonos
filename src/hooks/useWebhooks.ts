import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

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
  // Invoices
  { value: 'invoice.created', label: '請求書作成', category: '請求' },
  { value: 'invoice.paid', label: '請求書支払い完了', category: '請求' },
  { value: 'invoice.overdue', label: '請求書期限超過', category: '請求' },
  // Contracts
  { value: 'contract.created', label: '契約書作成', category: '契約' },
  { value: 'contract.signed', label: '契約署名完了', category: '契約' },
  { value: 'contract.expired', label: '契約期限切れ', category: '契約' },
  // Leads
  { value: 'lead.created', label: 'リード作成', category: '営業' },
  { value: 'lead.converted', label: 'リード変換', category: '営業' },
  // Deals
  { value: 'deal.won', label: '商談成立', category: '営業' },
  { value: 'deal.lost', label: '商談失注', category: '営業' },
  // Employees
  { value: 'employee.onboarded', label: '従業員入社', category: '人事' },
  { value: 'employee.offboarded', label: '従業員退社', category: '人事' },
  // Payments
  { value: 'payment.received', label: '入金完了', category: '支払い' },
  { value: 'payment.failed', label: '入金失敗', category: '支払い' },
  // Others
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

export function useWebhooks() {
  const { currentOrganization } = useOrganization();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!currentOrganization?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc('get_webhooks_with_stats', {
        p_organization_id: currentOrganization.id,
      });

      if (fetchError) throw fetchError;

      setWebhooks(
        (data || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          url: w.url,
          events: w.events,
          enabled: w.enabled,
          headers: {},
          maxRetries: 3,
          timeoutSeconds: 30,
          totalDeliveries: w.total_deliveries,
          successfulDeliveries: w.successful_deliveries,
          failedDeliveries: w.failed_deliveries,
          lastTriggeredAt: w.last_triggered_at,
          successRate: w.success_rate,
          createdAt: '',
        }))
      );
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
      setError('Webhookの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const createWebhook = async (input: CreateWebhookInput): Promise<Webhook | null> => {
    if (!currentOrganization?.id) return null;

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          organization_id: currentOrganization.id,
          name: input.name,
          url: input.url,
          events: input.events,
          headers: input.headers || {},
          max_retries: input.maxRetries || 3,
          timeout_seconds: input.timeoutSeconds || 30,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchWebhooks();
      return data as unknown as Webhook;
    } catch (err) {
      console.error('Failed to create webhook:', err);
      setError('Webhookの作成に失敗しました');
      return null;
    }
  };

  const updateWebhook = async (id: string, input: UpdateWebhookInput): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.url !== undefined) updates.url = input.url;
      if (input.events !== undefined) updates.events = input.events;
      if (input.headers !== undefined) updates.headers = input.headers;
      if (input.maxRetries !== undefined) updates.max_retries = input.maxRetries;
      if (input.timeoutSeconds !== undefined) updates.timeout_seconds = input.timeoutSeconds;
      if (input.enabled !== undefined) updates.enabled = input.enabled;

      const { error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchWebhooks();
      return true;
    } catch (err) {
      console.error('Failed to update webhook:', err);
      setError('Webhookの更新に失敗しました');
      return false;
    }
  };

  const deleteWebhook = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchWebhooks();
      return true;
    } catch (err) {
      console.error('Failed to delete webhook:', err);
      setError('Webhookの削除に失敗しました');
      return false;
    }
  };

  const toggleWebhook = async (id: string, enabled: boolean): Promise<boolean> => {
    return updateWebhook(id, { enabled });
  };

  const regenerateSecret = async (id: string): Promise<string | null> => {
    try {
      // Generate new secret
      const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('webhooks')
        .update({ secret: newSecret })
        .eq('id', id);

      if (error) throw error;

      return newSecret;
    } catch (err) {
      console.error('Failed to regenerate secret:', err);
      setError('シークレットの再生成に失敗しました');
      return null;
    }
  };

  const getDeliveries = async (webhookId: string, limit = 50): Promise<WebhookDelivery[]> => {
    try {
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('triggered_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        webhookId: d.webhook_id,
        event: d.event,
        payload: d.payload,
        statusCode: d.status_code,
        responseBody: d.response_body,
        success: d.success,
        errorMessage: d.error_message,
        durationMs: d.duration_ms,
        attemptNumber: d.attempt_number,
        triggeredAt: d.triggered_at,
        completedAt: d.completed_at,
      }));
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      return [];
    }
  };

  const testWebhook = async (id: string): Promise<boolean> => {
    try {
      // Get webhook details
      const webhook = webhooks.find(w => w.id === id);
      if (!webhook) return false;

      // Dispatch a test event
      const { data: deliveryIds, error } = await supabase.rpc('dispatch_webhook', {
        p_organization_id: currentOrganization?.id,
        p_event: webhook.events[0] || 'invoice.created',
        p_payload: {
          test: true,
          message: 'This is a test webhook delivery',
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      // Trigger the webhook dispatch function
      if (deliveryIds && deliveryIds.length > 0) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-dispatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ deliveryId: deliveryIds[0] }),
        });
      }

      return true;
    } catch (err) {
      console.error('Failed to test webhook:', err);
      setError('テスト送信に失敗しました');
      return false;
    }
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
