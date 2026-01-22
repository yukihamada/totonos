import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { useProjectDashboardStats } from "@/hooks/useProjectDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function BillableHoursWidget() {
  const { data: stats, isLoading } = useProjectDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">請求可能時間</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const estimatedHours = stats?.estimatedHours || 0;
  const completedTasks = stats?.completedTasksThisMonth || 0;
  const breakdown = stats?.projectBreakdown || [];

  // Calculate project-wise hours (proportional to completed tasks)
  const totalTasks = breakdown.reduce((sum, p) => sum + p.tasksCompleted, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">請求可能時間</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{estimatedHours}</span>
            <span className="text-sm text-muted-foreground">時間</span>
          </div>
          <p className="text-xs text-muted-foreground">
            今月の概算（{completedTasks}タスク完了）
          </p>
        </div>

        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          完了タスク × 2h で概算
        </Badge>

        {breakdown.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">プロジェクト別内訳</p>
            {breakdown
              .filter(p => p.tasksCompleted > 0)
              .slice(0, 4)
              .map((project) => {
                const projectHours = totalTasks > 0 
                  ? Math.round((project.tasksCompleted / totalTasks) * estimatedHours)
                  : 0;
                return (
                  <div key={project.name} className="flex justify-between text-xs">
                    <span className="truncate max-w-[120px]">{project.name}</span>
                    <span className="text-muted-foreground">
                      {project.tasksCompleted}タスク / {projectHours}h
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {completedTasks === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            今月の完了タスクはありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
