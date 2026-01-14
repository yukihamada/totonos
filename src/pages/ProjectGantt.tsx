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
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isWeekend,
  addMonths,
  subMonths,
  differenceInDays,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "キャンペーンコンセプト策定",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-10"),
    progress: 100,
    assignee: "山田太郎",
    status: "done",
  },
  {
    id: "2",
    title: "ターゲット顧客分析",
    startDate: new Date("2024-01-05"),
    endDate: new Date("2024-01-12"),
    progress: 100,
    assignee: "佐藤美咲",
    status: "done",
  },
  {
    id: "3",
    title: "ランディングページデザイン",
    startDate: new Date("2024-01-10"),
    endDate: new Date("2024-01-20"),
    progress: 100,
    assignee: "鈴木花子",
    status: "done",
  },
  {
    id: "4",
    title: "LP実装",
    startDate: new Date("2024-01-18"),
    endDate: new Date("2024-02-05"),
    progress: 60,
    assignee: "田中次郎",
    status: "in_progress",
  },
  {
    id: "5",
    title: "メール配信システム設定",
    startDate: new Date("2024-01-25"),
    endDate: new Date("2024-02-10"),
    progress: 40,
    assignee: "田中次郎",
    status: "in_progress",
  },
  {
    id: "6",
    title: "SNS広告クリエイティブ作成",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-02-15"),
    progress: 0,
    assignee: "鈴木花子",
    status: "todo",
  },
  {
    id: "7",
    title: "A/Bテスト設計",
    startDate: new Date("2024-02-10"),
    endDate: new Date("2024-02-20"),
    progress: 0,
    assignee: "佐藤美咲",
    status: "todo",
  },
  {
    id: "8",
    title: "効果測定KPI設定",
    startDate: new Date("2024-02-15"),
    endDate: new Date("2024-02-25"),
    progress: 0,
    assignee: "山田太郎",
    status: "todo",
  },
];

const mockMilestones = [
  { id: "1", name: "企画フェーズ完了", date: new Date("2024-01-15") },
  { id: "2", name: "デザイン完了", date: new Date("2024-02-01") },
  { id: "3", name: "開発完了", date: new Date("2024-02-28") },
  { id: "4", name: "ローンチ", date: new Date("2024-03-15") },
];

const statusColors = {
  done: "bg-green-500",
  in_progress: "bg-blue-500",
  todo: "bg-gray-400",
};

export default function ProjectGantt() {
  const { id } = useParams();
  const [currentMonth, setCurrentMonth] = useState(new Date("2024-01-15"));
  const [zoom, setZoom] = useState<"day" | "week">("day");

  const projectName = "新製品ローンチキャンペーン";

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getTaskBarStyle = (task: typeof mockTasks[0]) => {
    const taskStart = startOfDay(task.startDate);
    const taskEnd = startOfDay(task.endDate);

    // Check if task overlaps with current month
    if (taskEnd < monthStart || taskStart > monthEnd) {
      return { display: "none" };
    }

    const effectiveStart = taskStart < monthStart ? monthStart : taskStart;
    const effectiveEnd = taskEnd > monthEnd ? monthEnd : taskEnd;

    const startOffset = differenceInDays(effectiveStart, monthStart);
    const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;

    const cellWidth = 32; // px per day
    const left = startOffset * cellWidth;
    const width = duration * cellWidth;

    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  };

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
              <h1 className="text-xl font-bold">{projectName}</h1>
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

              {/* Milestones Row */}
              <div className="flex border-b bg-muted/30">
                <div className="w-64 flex-shrink-0 p-2 border-r text-sm font-medium">
                  マイルストーン
                </div>
                <div className="flex-1 relative h-10">
                  {mockMilestones.map((milestone) => {
                    const milestoneDate = startOfDay(milestone.date);
                    if (
                      !isWithinInterval(milestoneDate, {
                        start: monthStart,
                        end: monthEnd,
                      })
                    ) {
                      return null;
                    }
                    const offset = differenceInDays(milestoneDate, monthStart);
                    return (
                      <div
                        key={milestone.id}
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ left: `${offset * 32 + 16}px` }}
                      >
                        <div className="relative">
                          <div className="w-4 h-4 bg-purple-500 rotate-45 transform" />
                          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-background px-1">
                            {milestone.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task Rows */}
              {mockTasks.map((task) => (
                <div key={task.id} className="flex border-b hover:bg-muted/30">
                  <div className="w-64 flex-shrink-0 p-2 border-r">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.assignee}
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
                      className="absolute top-1/2 -translate-y-1/2 h-6 rounded flex items-center overflow-hidden"
                      style={{
                        ...getTaskBarStyle(task),
                        backgroundColor:
                          statusColors[task.status as keyof typeof statusColors] ||
                          "bg-gray-400",
                      }}
                    >
                      <div
                        className="h-full bg-black/20"
                        style={{ width: `${task.progress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {task.progress}%
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
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>未着手</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rotate-45 transform" />
            <span>マイルストーン</span>
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
