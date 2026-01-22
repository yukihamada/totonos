import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, UserPlus, RotateCcw, Clock, CheckCircle } from "lucide-react";
import { useEmrDashboardStats } from "@/hooks/useEmrDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function DailyPatientsWidget() {
  const { data: stats, isLoading } = useEmrDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本日の患者数</CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = stats?.todayPatients || 0;
  const waiting = stats?.waitingCount || 0;
  const inProgress = stats?.inProgressCount || 0;
  const completed = stats?.completedCount || 0;
  const firstVisit = stats?.firstVisitCount || 0;
  const returnVisit = stats?.returnVisitCount || 0;

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">本日の患者数</CardTitle>
        <Stethoscope className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-sm text-muted-foreground">名</span>
        </div>

        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <UserPlus className="h-3 w-3" />
            初診 {firstVisit}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <RotateCcw className="h-3 w-3" />
            再診 {returnVisit}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>診療進捗</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-500" />
            <span>待機 {waiting}</span>
          </div>
          <div className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3 text-blue-500" />
            <span>診察中 {inProgress}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>完了 {completed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
