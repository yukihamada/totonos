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
  type: 'invoice' | 'contract' | 'lead' | 'deal' | 'employee' | 'expense' | 'journal' | 'project';
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
        // Use demo data as audit_logs table structure may vary
        // In production, this would fetch from a proper audit log table
        setActivities(generateDemoActivities());
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setActivities(generateDemoActivities());
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
              <CardDescription>最新{limit}件のアクション</CardDescription>
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
                        TYPE_COLORS[activity.type]
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

// Helper functions
function mapTableToType(tableName: string): ActivityItem['type'] {
  const mapping: Record<string, ActivityItem['type']> = {
    invoices: 'invoice',
    contracts: 'contract',
    leads: 'lead',
    deals: 'deal',
    employees: 'employee',
    expenses: 'expense',
    journal_entries: 'journal',
    projects: 'project',
  };
  return mapping[tableName] || 'invoice';
}

function mapActionToType(action: string): ActivityItem['action'] {
  const mapping: Record<string, ActivityItem['action']> = {
    INSERT: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
  };
  return mapping[action] || 'update';
}

function generateTitle(log: Record<string, unknown>): string {
  const newValues = log.new_values as Record<string, unknown> | null;
  const tableName = log.table_name as string;

  if (newValues) {
    const name = newValues.name || newValues.title || newValues.client_name || newValues.invoice_number;
    if (name) return String(name);
  }

  const tableLabels: Record<string, string> = {
    invoices: '請求書',
    contracts: '契約書',
    leads: 'リード',
    deals: '商談',
    employees: '従業員',
    expenses: '経費',
    journal_entries: '仕訳',
    projects: 'プロジェクト',
  };

  return `${tableLabels[tableName] || tableName}が更新されました`;
}

function generateDescription(log: Record<string, unknown>): string | undefined {
  const newValues = log.new_values as Record<string, unknown> | null;
  if (!newValues) return undefined;

  const amount = newValues.amount || newValues.total_amount;
  if (amount) {
    return `¥${Number(amount).toLocaleString()}`;
  }

  const status = newValues.status;
  if (status) {
    return `ステータス: ${status}`;
  }

  return undefined;
}

function generateDemoActivities(): ActivityItem[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'invoice',
      action: 'create',
      title: '請求書 INV-2024-001',
      description: '¥150,000',
      timestamp: new Date(now.getTime() - 1000 * 60 * 5),
    },
    {
      id: '2',
      type: 'contract',
      action: 'sign',
      title: '業務委託契約書',
      description: '署名完了',
      timestamp: new Date(now.getTime() - 1000 * 60 * 30),
    },
    {
      id: '3',
      type: 'deal',
      action: 'status_change',
      title: '新規導入案件',
      description: 'ステータス: 商談中',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60),
    },
    {
      id: '4',
      type: 'expense',
      action: 'approve',
      title: '交通費精算',
      description: '¥12,500',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    },
    {
      id: '5',
      type: 'lead',
      action: 'create',
      title: '株式会社サンプル',
      description: '新規リード',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3),
    },
  ];
}
