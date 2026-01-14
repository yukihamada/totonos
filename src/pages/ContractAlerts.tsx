import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContractAlerts, ContractAlert } from '@/hooks/useContractAlerts';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function AlertBadge({ type }: { type: ContractAlert['alertType'] }) {
  const config = {
    expired: { label: '期限切れ', variant: 'destructive' as const, icon: XCircle },
    critical: { label: '緊急', variant: 'destructive' as const, icon: AlertTriangle },
    warning: { label: '注意', variant: 'warning' as const, icon: Clock },
    upcoming: { label: '近日', variant: 'secondary' as const, icon: Calendar },
  };

  const { label, variant } = config[type];
  return <Badge variant={variant}>{label}</Badge>;
}

function AlertCard({
  alert,
  onDismiss,
  onAcknowledge
}: {
  alert: ContractAlert;
  onDismiss: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const bgColor = {
    expired: 'bg-red-50 dark:bg-red-950 border-red-200',
    critical: 'bg-orange-50 dark:bg-orange-950 border-orange-200',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200',
    upcoming: 'bg-blue-50 dark:bg-blue-950 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${bgColor[alert.alertType]} ${alert.status !== 'active' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{alert.contractTitle}</h4>
              <AlertBadge type={alert.alertType} />
              {alert.status === 'acknowledged' && (
                <Badge variant="outline">確認済み</Badge>
              )}
              {alert.status === 'dismissed' && (
                <Badge variant="outline">非表示</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {alert.clientName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {alert.validUntil}
              </span>
              <span className={`font-medium ${alert.daysRemaining < 0 ? 'text-red-600' : alert.daysRemaining <= 7 ? 'text-orange-600' : ''}`}>
                {alert.daysRemaining < 0
                  ? `${Math.abs(alert.daysRemaining)}日超過`
                  : alert.daysRemaining === 0
                  ? '本日期限'
                  : `残り${alert.daysRemaining}日`
                }
              </span>
            </div>
          </div>
        </div>

        {alert.status === 'active' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAcknowledge(alert.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              確認
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <Link to={`/contracts`}>
              <Button variant="default" size="sm">
                詳細
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractAlerts() {
  const { alerts, activeAlerts, isLoading, dismissAlert, acknowledgeAlert, stats } = useContractAlerts();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              契約期限アラート
            </h1>
            <p className="text-muted-foreground">
              契約の期限切れを事前に通知します
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>アクティブアラート</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={stats.expired > 0 ? 'border-red-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                期限切れ
              </CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.expired}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={stats.critical > 0 ? 'border-orange-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                7日以内
              </CardDescription>
              <CardTitle className="text-2xl text-orange-600">{stats.critical}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                30日以内
              </CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{stats.warning}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>アラート一覧</CardTitle>
            <CardDescription>期限が近い契約、または期限切れの契約</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                読み込み中...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium">期限切れの契約はありません</p>
                <p className="text-muted-foreground">
                  すべての契約が正常に管理されています
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active alerts first, sorted by days remaining */}
                {[...alerts]
                  .sort((a, b) => {
                    if (a.status === 'active' && b.status !== 'active') return -1;
                    if (a.status !== 'active' && b.status === 'active') return 1;
                    return a.daysRemaining - b.daysRemaining;
                  })
                  .map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onDismiss={dismissAlert}
                      onAcknowledge={acknowledgeAlert}
                    />
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Info */}
        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
            <CardDescription>契約期限の通知タイミングを設定</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">緊急通知</span>
                </div>
                <p className="text-sm text-muted-foreground">期限7日前に通知</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">注意通知</span>
                </div>
                <p className="text-sm text-muted-foreground">期限30日前に通知</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">事前通知</span>
                </div>
                <p className="text-sm text-muted-foreground">期限90日前に通知</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
