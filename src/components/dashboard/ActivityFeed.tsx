import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  CreditCard,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ActivityItem {
  id: string;
  type: 'invoice' | 'contract' | 'lead' | 'deal' | 'employee' | 'expense' | 'journal' | 'project' | 'client' | 'estimate' | 'task';
  action: 'create' | 'update' | 'delete' | 'status_change' | 'approve' | 'reject' | 'sign' | 'view';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

const ACTION_ICONS = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  status_change: RefreshCw,
  approve: CheckCircle,
  reject: XCircle,
  sign: FileText,
  view: Eye,
};

const TYPE_ICONS = {
  invoice: FileText,
  contract: FileText,
  lead: Users,
  deal: Briefcase,
  employee: Users,
  expense: CreditCard,
  journal: FileText,
  project: Briefcase,
  client: Users,
  estimate: FileText,
  task: CheckCircle,
};

const TYPE_COLORS = {
  invoice: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  contract: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  lead: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  deal: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  employee: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  expense: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  journal: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  project: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  client: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  estimate: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
  task: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
};

const ACTION_LABELS = {
  create: '作成',
  update: '更新',
  delete: '削除',
  status_change: 'ステータス変更',
  approve: '承認',
  reject: '却下',
  sign: '署名',
  view: '閲覧',
};

const TYPE_LABELS = {
  invoice: '請求書',
  contract: '契約書',
  lead: 'リード',
  deal: '商談',
  employee: '従業員',
  expense: '経費',
  journal: '仕訳',
  project: 'プロジェクト',
  client: '取引先',
  estimate: '見積書',
  task: 'タスク',
};

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function ActivityFeed({ limit = 10, showHeader = true, className }: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const allActivities: ActivityItem[] = [];

        // Fetch recent invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, invoice_number, total_amount, status, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (invoices) {
          for (const inv of invoices) {
            const isNew = Math.abs(new Date(inv.created_at).getTime() - new Date(inv.updated_at).getTime()) < 1000;
            allActivities.push({
              id: `inv-${inv.id}`,
              type: 'invoice',
              action: isNew ? 'create' : 'update',
              title: `請求書 ${inv.invoice_number}`,
              description: `¥${Number(inv.total_amount).toLocaleString()}`,
              timestamp: new Date(inv.updated_at),
            });
          }
        }

        // Fetch recent contracts
        const { data: contracts } = await supabase
          .from('contracts')
          .select('id, title, status, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (contracts) {
          for (const contract of contracts) {
            const isNew = Math.abs(new Date(contract.created_at).getTime() - new Date(contract.updated_at).getTime()) < 1000;
            allActivities.push({
              id: `con-${contract.id}`,
              type: 'contract',
              action: isNew ? 'create' : 'update',
              title: contract.title,
              description: `ステータス: ${contract.status === 'draft' ? '下書き' : contract.status === 'signed' ? '署名済' : contract.status}`,
              timestamp: new Date(contract.updated_at),
            });
          }
        }

        // Fetch recent leads
        const { data: leads } = await supabase
          .from('leads')
          .select('id, company_name, status, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (leads) {
          for (const lead of leads) {
            const isNew = Math.abs(new Date(lead.created_at).getTime() - new Date(lead.updated_at).getTime()) < 1000;
            allActivities.push({
              id: `lead-${lead.id}`,
              type: 'lead',
              action: isNew ? 'create' : 'update',
              title: lead.company_name,
              description: `新規リード`,
              timestamp: new Date(lead.updated_at),
            });
          }
        }

        // Fetch recent deals
        const { data: deals } = await supabase
          .from('deals')
          .select('id, deal_name, stage, amount, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (deals) {
          for (const deal of deals) {
            const isNew = Math.abs(new Date(deal.created_at).getTime() - new Date(deal.updated_at).getTime()) < 1000;
            allActivities.push({
              id: `deal-${deal.id}`,
              type: 'deal',
              action: isNew ? 'create' : 'status_change',
              title: deal.deal_name,
              description: deal.amount ? `¥${Number(deal.amount).toLocaleString()}` : `ステージ: ${deal.stage}`,
              timestamp: new Date(deal.updated_at),
            });
          }
        }

        // Fetch recent clients
        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (clients) {
          for (const client of clients) {
            const isNew = Math.abs(new Date(client.created_at).getTime() - new Date(client.updated_at).getTime()) < 1000;
            allActivities.push({
              id: `client-${client.id}`,
              type: 'client',
              action: isNew ? 'create' : 'update',
              title: client.name,
              description: '取引先',
              timestamp: new Date(client.updated_at),
            });
          }
        }

        // Fetch recent estimates
        const { data: estimates } = await supabase
          .from('estimates')
          .select('id, estimate_number, total_amount, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (estimates) {
          for (const est of estimates) {
            const isNew = Math.abs(new Date(est.created_at).getTime() - new Date(est.updated_at).getTime()) < 1000;
            allActivities.push({
              id: `est-${est.id}`,
              type: 'estimate',
              action: isNew ? 'create' : 'update',
              title: `見積書 ${est.estimate_number}`,
              description: `¥${Number(est.total_amount).toLocaleString()}`,
              timestamp: new Date(est.updated_at),
            });
          }
        }

        // Sort by timestamp and limit
        allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(allActivities.slice(0, limit));
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [user, limit]);

  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              アクティビティ
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                アクティビティ
              </CardTitle>
              <CardDescription>最新の操作履歴</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/audit-log">
                すべて見る
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>アクティビティはありません</p>
            <p className="text-sm mt-1">データを作成すると、ここに表示されます</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const TypeIcon = TYPE_ICONS[activity.type] || FileText;
                const ActionIcon = ACTION_ICONS[activity.action] || Edit;

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-start gap-3 pb-4',
                      index !== activities.length - 1 && 'border-b'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-full shrink-0',
                        TYPE_COLORS[activity.type] || 'text-muted-foreground bg-muted'
                      )}
                    >
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[activity.type] || activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ActionIcon className="h-3 w-3" />
                          {ACTION_LABELS[activity.action] || activity.action}
                        </span>
                      </div>
                      <p className="font-medium text-sm mt-1 truncate">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
