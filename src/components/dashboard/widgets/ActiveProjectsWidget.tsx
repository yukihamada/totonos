import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, AlertTriangle, TrendingUp } from "lucide-react";
import { useProjectDashboardStats } from "@/hooks/useProjectDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function ActiveProjectsWidget() {
  const { data: stats, isLoading } = useProjectDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">進行中プロジェクト</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeCount = stats?.activeProjectsCount || 0;
  const avgProgress = stats?.averageProgress || 0;
  const nearDeadline = stats?.nearDeadlineCount || 0;
  const breakdown = stats?.projectBreakdown || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">進行中プロジェクト</CardTitle>
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{activeCount}</span>
          <span className="text-sm text-muted-foreground">件</span>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            平均進捗 {avgProgress}%
          </Badge>
          {nearDeadline > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              期限間近 {nearDeadline}
            </Badge>
          )}
        </div>

        {breakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">プロジェクト進捗</p>
            {breakdown.slice(0, 3).map((project) => (
              <div key={project.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="truncate max-w-[150px]">{project.name}</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        )}

        {activeCount === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            進行中のプロジェクトはありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
