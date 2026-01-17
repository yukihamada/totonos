import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const typeStyles = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const categoryLabels: Record<Notification['category'], string> = {
  payment: '入金',
  invoice: '請求書',
  contract: '契約',
  system: 'システム',
  hr: '人事',
  crm: '営業',
};

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | Notification['category']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter !== 'all' && n.category !== filter) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const readNotifications = filteredNotifications.filter((n) => n.read);

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = typeIcons[notification.type];
    return (
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          !notification.read && 'border-primary/50 bg-accent/20'
        )}
        onClick={() => handleClick(notification)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'p-2 rounded-full',
                notification.type === 'info' && 'bg-blue-100 text-blue-600',
                notification.type === 'success' && 'bg-green-100 text-green-600',
                notification.type === 'warning' && 'bg-yellow-100 text-yellow-600',
                notification.type === 'error' && 'bg-red-100 text-red-600'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn('text-xs', typeStyles[notification.type])}>
                  {categoryLabels[notification.category]}
                </Badge>
                {!notification.read && (
                  <Badge variant="default" className="text-xs">
                    未読
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(notification.createdAt, 'yyyy/MM/dd HH:mm', { locale: ja })}
                {' '}({formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ja })})
              </p>
            </div>
            <div className="flex gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="h-8 w-8" />
                通知センター
              </h1>
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-20 bg-muted animate-shimmer rounded" />
                  <div className="h-8 w-12 bg-muted animate-shimmer rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-muted animate-shimmer rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-shimmer rounded" />
                      <div className="h-4 w-full bg-muted animate-shimmer rounded" />
                      <div className="h-3 w-24 bg-muted animate-shimmer rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              通知センター
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount}件の未読通知` : '未読通知なし'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                すべて既読
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                すべて削除
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総通知数</CardDescription>
              <CardTitle className="text-2xl">{notifications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>未読</CardDescription>
              <CardTitle className="text-2xl text-primary">{unreadCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>要対応（警告・エラー）</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {notifications.filter((n) => n.type === 'warning' || n.type === 'error').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今日の通知</CardDescription>
              <CardTitle className="text-2xl">
                {notifications.filter((n) => {
                  const today = new Date();
                  return n.createdAt.toDateString() === today.toDateString();
                }).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">フィルター:</span>
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="payment">入金</SelectItem>
              <SelectItem value="invoice">請求書</SelectItem>
              <SelectItem value="contract">契約</SelectItem>
              <SelectItem value="system">システム</SelectItem>
              <SelectItem value="hr">人事</SelectItem>
              <SelectItem value="crm">営業</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全種類</SelectItem>
              <SelectItem value="info">情報</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
              <SelectItem value="error">エラー</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <Tabs defaultValue="unread" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unread">
              未読 ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              既読 ({readNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              すべて ({filteredNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">未読の通知はありません</p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            {readNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">既読の通知はありません</p>
                </CardContent>
              </Card>
            ) : (
              readNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">通知はありません</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
