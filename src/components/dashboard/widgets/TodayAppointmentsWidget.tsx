import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import { useAppointmentDashboardStats } from "@/hooks/useAppointmentDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function TodayAppointmentsWidget() {
  const { data: stats, isLoading } = useAppointmentDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本日の予約</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalCount = stats?.todayAppointmentsCount || 0;
  const confirmed = stats?.confirmedCount || 0;
  const pending = stats?.pendingCount || 0;
  const nextAppt = stats?.nextAppointment;
  const hourlyBreakdown = stats?.hourlyBreakdown || [];

  // Find peak hour
  const peakHour = hourlyBreakdown.reduce(
    (max, h) => (h.count > max.count ? h : max),
    { hour: '', count: 0 }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">本日の予約</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{totalCount}</span>
          <span className="text-sm text-muted-foreground">件</span>
        </div>

        <div className="flex gap-2 text-xs">
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            確定 {confirmed}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            未確定 {pending}
          </Badge>
        </div>

        {nextAppt && (
          <div className="p-2 rounded-md bg-muted/50 space-y-1">
            <p className="text-xs text-muted-foreground">次の予約</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">{nextAppt.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{nextAppt.patientName}</span>
              <span>・</span>
              <span>{nextAppt.doctorName}</span>
            </div>
          </div>
        )}

        {!nextAppt && totalCount > 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            本日の予約はすべて完了しました
          </p>
        )}

        {totalCount === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            本日の予約はありません
          </p>
        )}

        {peakHour.count > 0 && (
          <p className="text-xs text-muted-foreground">
            ピーク時間: {peakHour.hour}（{peakHour.count}件）
          </p>
        )}
      </CardContent>
    </Card>
  );
}
