import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  addMonths,
  subMonths,
  differenceInDays,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProject, useProjectTasks } from "@/hooks/useProjects";
import type { TaskStatus } from "@/types/project";

const statusColors: Record<TaskStatus, string> = {
  done: "bg-green-500",
  in_progress: "bg-blue-500",
  review: "bg-yellow-500",
  todo: "bg-gray-400",
};

export default function ProjectGantt() {
  const { id } = useParams<{ id: string }>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [zoom, setZoom] = useState<"day" | "week">("day");

  const { data: project, isLoading: projectLoading } = useProject(id || "");
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(id || "");

  const isLoading = projectLoading || tasksLoading;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getTaskBarStyle = (task: { due_date: string | null; created_at: string }) => {
    const taskStart = startOfDay(new Date(task.created_at));
    const taskEnd = task.due_date ? startOfDay(new Date(task.due_date)) : startOfDay(new Date(task.created_at));

    // Check if task overlaps with current month
    if (taskEnd < monthStart || taskStart > monthEnd) {
      return { display: "none" as const };
    }

    const effectiveStart = taskStart < monthStart ? monthStart : taskStart;
    const effectiveEnd = taskEnd > monthEnd ? monthEnd : taskEnd;

    const startOffset = differenceInDays(effectiveStart, monthStart);
    const duration = Math.max(differenceInDays(effectiveEnd, effectiveStart) + 1, 1);

    const cellWidth = 32; // px per day
    const left = startOffset * cellWidth;
    const width = duration * cellWidth;

    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/projects/${id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{project?.name || "プロジェクト"}</h1>
              <p className="text-sm text-muted-foreground">ガントチャート</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${id}`}>
                <List className="h-4 w-4 mr-2" />
                リスト
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${id}/kanban`}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                カンバン
              </Link>
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, "yyyy年MM月", { locale: ja })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              今日
            </Button>
            <Select
              value={zoom}
              onValueChange={(v) => setZoom(v as "day" | "week")}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">日表示</SelectItem>
                <SelectItem value="week">週表示</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gantt Chart */}
        <Card>
          <CardContent className="p-0 overflow-auto">
            <div className="min-w-[1200px]">
              {/* Header Row - Days */}
              <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-64 flex-shrink-0 p-2 border-r font-medium">
                  タスク
                </div>
                <div className="flex">
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "w-8 text-center text-xs py-2 border-r",
                        isWeekend(day) && "bg-muted/50",
                        format(day, "yyyy-MM-dd") ===
                          format(new Date(), "yyyy-MM-dd") &&
                          "bg-blue-100"
                      )}
                    >
                      <div className="font-medium">
                        {format(day, "d", { locale: ja })}
                      </div>
                      <div className="text-muted-foreground">
                        {format(day, "E", { locale: ja })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  タスクがありません
                </div>
              )}

              {/* Task Rows */}
              {tasks.map((task) => (
                <div key={task.id} className="flex border-b hover:bg-muted/30">
                  <div className="w-64 flex-shrink-0 p-2 border-r">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.assignee_id ? "担当者" : "未割当"}
                    </p>
                  </div>
                  <div className="flex-1 relative h-14">
                    {/* Background grid */}
                    <div className="absolute inset-0 flex">
                      {days.map((day) => (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "w-8 border-r",
                            isWeekend(day) && "bg-muted/30"
                          )}
                        />
                      ))}
                    </div>

                    {/* Task bar */}
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-6 rounded flex items-center overflow-hidden",
                        statusColors[task.status]
                      )}
                      style={getTaskBarStyle(task)}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium px-1 truncate">
                        {task.title}
                      </span>
                    </div>

                    {/* Today indicator */}
                    {isWithinInterval(new Date(), {
                      start: monthStart,
                      end: monthEnd,
                    }) && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                        style={{
                          left: `${
                            differenceInDays(new Date(), monthStart) * 32 + 16
                          }px`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>完了</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>進行中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>レビュー</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>未着手</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-500" />
            <span>今日</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
