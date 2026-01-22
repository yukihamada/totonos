import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Home, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Building, Unit, OwnerPayment } from '@/types/estate';

interface BuildingWithUnits extends Building {
  units: Pick<Unit, 'id' | 'status' | 'base_rent'>[];
}

export default function OwnerDashboard() {
  const { user, profile } = useAuth();

  // Fetch buildings with units
  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          units (id, status, base_rent)
        `)
        .eq('user_id', user.id)
        .limit(10);

      if (error) throw error;
      return data as BuildingWithUnits[];
    },
    enabled: !!user?.id,
  });

  // Fetch owner payments
  const { data: recentPayments, isLoading: loadingPayments } = useQuery({
    queryKey: ['owner-payments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('owner_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_month', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as OwnerPayment[];
    },
    enabled: !!user?.id,
  });

  // Calculate stats from properties
  const stats = {
    totalProperties: properties?.length || 0,
    occupiedUnits:
      properties?.reduce((sum, p) => sum + (p.units?.filter((u) => u.status === 'occupied').length || 0), 0) || 0,
    vacantUnits:
      properties?.reduce((sum, p) => sum + (p.units?.filter((u) => u.status === 'vacant').length || 0), 0) || 0,
    totalUnits: properties?.reduce((sum, p) => sum + (p.units?.length || 0), 0) || 0,
    get occupancyRate() {
      return this.totalUnits > 0 ? Math.round((this.occupiedUnits / this.totalUnits) * 100 * 10) / 10 : 0;
    },
    monthlyIncome:
      properties?.reduce(
        (sum, p) =>
          sum +
          (p.units
            ?.filter((u) => u.status === 'occupied')
            .reduce((s, u) => s + (u.base_rent || 0), 0) || 0),
        0
      ) || 0,
  };

  const isLoading = loadingProperties || loadingPayments;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">オーナーポータル</h1>
        <p className="text-muted-foreground">
          ようこそ、{profile?.display_name || 'オーナー'}様
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">所有物件数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProperties}棟</div>
                <p className="text-xs text-muted-foreground">
                  {stats.occupiedUnits}室入居中 / {stats.vacantUnits}室空室
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">稼働率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.occupiedUnits} / {stats.totalUnits}室
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月間家賃収入</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthlyIncome)}</div>
                <p className="text-xs text-muted-foreground">入居中物件の合計</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">前回送金額</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <Skeleton className="h-8 w-24" />
            ) : recentPayments?.[0] ? (
              <>
                <div className="text-2xl font-bold">{formatCurrency(recentPayments[0].net_payment || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(recentPayments[0].payment_month), 'yyyy年M月分', { locale: ja })}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">送金履歴なし</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Properties List */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>所有物件</CardTitle>
            <CardDescription>物件別の入居状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingProperties ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : properties?.length ? (
              properties.map((property) => {
                const units = property.units || [];
                const occupied = units.filter((u) => u.status === 'occupied').length;
                return (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[property.prefecture, property.city].filter(Boolean).join('')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={occupied === units.length ? 'default' : 'secondary'}>
                        {occupied}/{units.length}室
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground py-4">物件がありません</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>送金履歴</CardTitle>
            <CardDescription>直近の送金明細</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPayments ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))
            ) : recentPayments?.length ? (
              recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(new Date(payment.payment_month), 'yyyy年M月', { locale: ja })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.payment_date
                        ? format(new Date(payment.payment_date), 'M/d送金', { locale: ja })
                        : '未送金'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payment.net_payment || 0)}</p>
                    <Badge variant="outline">{payment.is_paid ? '送金済' : '処理中'}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">送金履歴がありません</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income Summary */}
      {recentPayments?.[0] && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>直近の収支明細</CardTitle>
            <CardDescription>
              {format(new Date(recentPayments[0].payment_month), 'yyyy年M月分', { locale: ja })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span>家賃収入</span>
                <span className="font-medium">{formatCurrency(recentPayments[0].total_rent_collected || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b text-muted-foreground">
                <span>管理手数料</span>
                <span>-{formatCurrency(recentPayments[0].management_fee || 0)}</span>
              </div>
              {(recentPayments[0].repair_costs || 0) > 0 && (
                <div className="flex justify-between py-2 border-b text-muted-foreground">
                  <span>修繕費</span>
                  <span>-{formatCurrency(recentPayments[0].repair_costs)}</span>
                </div>
              )}
              {(recentPayments[0].other_deductions || 0) > 0 && (
                <div className="flex justify-between py-2 border-b text-muted-foreground">
                  <span>その他控除</span>
                  <span>-{formatCurrency(recentPayments[0].other_deductions)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>送金額</span>
                <span className="text-primary">{formatCurrency(recentPayments[0].net_payment || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
