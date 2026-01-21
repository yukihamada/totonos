import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Home, Calendar, Users, DollarSign, Sparkles, 
  ArrowRight, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { useVacationDashboardStats, useVacationProperties } from '@/hooks/useVacationRental';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function VacationDashboard() {
  const { data: stats, isLoading: statsLoading } = useVacationDashboardStats();
  const { data: properties, isLoading: propertiesLoading } = useVacationProperties();

  const isLoading = statsLoading || propertiesLoading;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">民泊ダッシュボード</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'yyyy年M月d日 (EEEE)', { locale: ja })}
            </p>
          </div>
          <Button asChild>
            <Link to="/vacation-rental/properties/new">
              <Home className="mr-2 h-4 w-4" />
              物件を追加
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">物件数</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.propertyCount || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">稼働中の物件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今日のチェックイン</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.checkIns?.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">本日到着予定</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今日のチェックアウト</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.checkOuts?.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">本日出発予定</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今月の売上</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  ¥{(stats?.monthlyRevenue || 0).toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">予約確定分</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                本日のスケジュール
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <>
                  {stats?.checkIns?.map((booking: any) => (
                    <div key={booking.id} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="p-2 bg-green-500/20 rounded-full">
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{booking.property?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          チェックイン: {booking.guest_name || 'ゲスト'} ({booking.guest_count}名)
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        IN
                      </Badge>
                    </div>
                  ))}
                  {stats?.checkOuts?.map((booking: any) => (
                    <div key={booking.id} className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="p-2 bg-blue-500/20 rounded-full">
                        <ArrowRight className="h-4 w-4 text-blue-600 rotate-180" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{booking.property?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          チェックアウト: {booking.guest_name || 'ゲスト'}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        OUT
                      </Badge>
                    </div>
                  ))}
                  {(!stats?.checkIns?.length && !stats?.checkOuts?.length) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>本日の予定はありません</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Cleaning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                清掃タスク
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <>
                  {stats?.pendingCleaning?.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="p-2 bg-orange-500/20 rounded-full">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.property?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.assigned_to || '未アサイン'} • {task.scheduled_time}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                        待機中
                      </Badge>
                    </div>
                  ))}
                  {!stats?.pendingCleaning?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>未完了の清掃タスクはありません</p>
                    </div>
                  )}
                </>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/vacation-rental/cleaning">
                  すべての清掃タスクを見る
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Properties Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                物件一覧
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/vacation-rental/properties">すべて見る</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : properties?.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">物件がありません</h3>
                <p className="text-muted-foreground mb-4">
                  最初の物件を登録して、予約管理を始めましょう
                </p>
                <Button asChild>
                  <Link to="/vacation-rental/properties/new">物件を登録する</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {properties?.slice(0, 6).map((property) => (
                  <Link
                    key={property.id}
                    to={`/vacation-rental/properties/${property.id}`}
                    className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{property.name}</h4>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status === 'active' ? '稼働中' : '停止中'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>最大{property.max_guests}名</span>
                      <span>{property.bedrooms}ベッドルーム</span>
                      <span>¥{property.base_price?.toLocaleString()}/泊</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/vacation-rental/calendar">
              <Calendar className="h-6 w-6" />
              <span>予約カレンダー</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/vacation-rental/bookings">
              <Users className="h-6 w-6" />
              <span>予約一覧</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/vacation-rental/cleaning">
              <Sparkles className="h-6 w-6" />
              <span>清掃スケジュール</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/vacation-rental/operating-days">
              <AlertTriangle className="h-6 w-6" />
              <span>営業日数管理</span>
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
