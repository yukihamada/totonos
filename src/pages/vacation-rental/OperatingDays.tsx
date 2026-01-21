import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, CalendarDays, Home, TrendingUp, 
  CheckCircle2, Info
} from 'lucide-react';
import { useVacationProperties, useOperatingDays, useVacationBookings } from '@/hooks/useVacationRental';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function OperatingDays() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const { data: properties, isLoading: propertiesLoading } = useVacationProperties();
  const { data: bookings } = useVacationBookings();

  const years = [currentYear - 1, currentYear, currentYear + 1];

  // Calculate operating days for each property
  const propertyStats = properties?.map((property) => {
    const propertyBookings = bookings?.filter(
      (b) => b.property_id === property.id &&
             b.status !== 'cancelled' &&
             new Date(b.check_in_date).getFullYear() === parseInt(selectedYear)
    ) || [];

    const days = propertyBookings.reduce((total, booking) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return total + nights;
    }, 0);

    const limit = property.annual_limit_days;
    const percentage = Math.min((days / limit) * 100, 100);
    const remaining = Math.max(limit - days, 0);
    const isWarning = percentage >= 80;
    const isDanger = percentage >= 95;

    return {
      ...property,
      operatingDays: days,
      limit,
      percentage,
      remaining,
      isWarning,
      isDanger,
      bookingCount: propertyBookings.length,
    };
  }) || [];

  const totalDays = propertyStats.reduce((sum, p) => sum + p.operatingDays, 0);
  const warningCount = propertyStats.filter((p) => p.isWarning).length;
  const dangerCount = propertyStats.filter((p) => p.isDanger).length;

  if (propertiesLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">営業日数管理</h1>
            <p className="text-muted-foreground mt-1">
              住宅宿泊事業法に基づく180日制限の管理
            </p>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Alert */}
        {dangerCount > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>制限到達間近</AlertTitle>
            <AlertDescription>
              {dangerCount}件の物件が年間営業日数の上限に近づいています。新規予約の受付にご注意ください。
            </AlertDescription>
          </Alert>
        )}

        {warningCount > 0 && dangerCount === 0 && (
          <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
            <Info className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-600">注意</AlertTitle>
            <AlertDescription className="text-orange-600">
              {warningCount}件の物件が営業日数の80%以上に達しています。
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                物件数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties?.length || 0}</div>
              <p className="text-xs text-muted-foreground">管理中の物件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                合計営業日数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDays}日</div>
              <p className="text-xs text-muted-foreground">{selectedYear}年累計</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                正常
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {propertyStats.filter((p) => !p.isWarning).length}件
              </div>
              <p className="text-xs text-muted-foreground">80%未満</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                警告
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {warningCount}件
              </div>
              <p className="text-xs text-muted-foreground">80%以上</p>
            </CardContent>
          </Card>
        </div>

        {/* Property List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              物件別営業日数 ({selectedYear}年)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {propertyStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>登録済みの物件がありません</p>
              </div>
            ) : (
              <div className="space-y-6">
                {propertyStats.map((property) => (
                  <div key={property.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{property.name}</h4>
                        {property.isDanger && (
                          <Badge variant="destructive" className="text-xs">
                            危険
                          </Badge>
                        )}
                        {property.isWarning && !property.isDanger && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                            注意
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{property.operatingDays}</span>
                        <span className="text-muted-foreground"> / {property.limit}日</span>
                      </div>
                    </div>
                    <Progress 
                      value={property.percentage} 
                      className={`h-3 ${
                        property.isDanger 
                          ? '[&>div]:bg-red-500' 
                          : property.isWarning 
                          ? '[&>div]:bg-orange-500' 
                          : '[&>div]:bg-green-500'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{property.bookingCount}件の予約</span>
                      <span>残り {property.remaining}日 ({(100 - property.percentage).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">住宅宿泊事業法について</h4>
                <p className="text-sm text-muted-foreground">
                  住宅宿泊事業法（民泊新法）では、住宅宿泊事業の届出を行った住宅において、
                  年間の営業日数が180日を超えてはならないと定められています。
                  営業日数は人を宿泊させた日数であり、チェックインからチェックアウトまでの泊数をカウントします。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
