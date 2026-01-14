import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  Plus,
  Timer,
  Play,
  Square,
  Clock,
  CalendarIcon,
  Edit,
  Trash2,
  BarChart3,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data
const mockTimeLogs = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    project: "新製品ローンチキャンペーン",
    task: "LP実装",
    hours: 3.5,
    description: "ヘッダーとヒーローセクションの実装",
  },
  {
    id: "2",
    date: new Date("2024-01-15"),
    project: "新製品ローンチキャンペーン",
    task: "メール配信システム設定",
    hours: 2.0,
    description: "Mailchimpとの連携設定",
  },
  {
    id: "3",
    date: new Date("2024-01-14"),
    project: "基幹システムリニューアル",
    task: "要件定義",
    hours: 4.0,
    description: "ユーザーヒアリングと要件まとめ",
  },
  {
    id: "4",
    date: new Date("2024-01-14"),
    project: "新製品ローンチキャンペーン",
    task: "LP実装",
    hours: 2.5,
    description: "フォームセクションの実装",
  },
  {
    id: "5",
    date: new Date("2024-01-13"),
    project: "新製品ローンチキャンペーン",
    task: "ランディングページデザイン",
    hours: 5.0,
    description: "デザインレビューと修正",
  },
];

const mockProjects = [
  { id: "1", name: "新製品ローンチキャンペーン", color: "#3B82F6" },
  { id: "2", name: "基幹システムリニューアル", color: "#8B5CF6" },
  { id: "3", name: "顧客満足度向上プロジェクト", color: "#F59E0B" },
];

const mockTasks = [
  { id: "1", name: "LP実装", projectId: "1" },
  { id: "2", name: "メール配信システム設定", projectId: "1" },
  { id: "3", name: "ランディングページデザイン", projectId: "1" },
  { id: "4", name: "要件定義", projectId: "2" },
  { id: "5", name: "設計", projectId: "2" },
];

export default function ProjectTimelog() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const todayHours = mockTimeLogs
    .filter(
      (log) =>
        format(log.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    )
    .reduce((sum, log) => sum + log.hours, 0);

  const weekHours = mockTimeLogs
    .filter((log) => log.date >= weekStart && log.date <= weekEnd)
    .reduce((sum, log) => sum + log.hours, 0);

  const projectHours = mockTimeLogs.reduce((acc, log) => {
    acc[log.project] = (acc[log.project] || 0) + log.hours;
    return acc;
  }, {} as Record<string, number>);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    // In real app, would start interval
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const hours = Math.round((timerSeconds / 3600) * 100) / 100;
    setHours(hours.toString());
    setIsAddDialogOpen(true);
  };

  const handleAddLog = () => {
    if (!selectedProject || !hours) {
      toast.error("プロジェクトと時間を入力してください");
      return;
    }
    toast.success("工数を記録しました");
    setIsAddDialogOpen(false);
    setSelectedProject("");
    setSelectedTask("");
    setHours("");
    setDescription("");
    setTimerSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">工数記録</h1>
              <p className="text-muted-foreground">
                プロジェクトの作業時間を記録します
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
              <Timer className="h-4 w-4" />
              <span className="font-mono text-lg">{formatTime(timerSeconds)}</span>
              {isTimerRunning ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopTimer}
                >
                  <Square className="h-4 w-4 mr-1" />
                  停止
                </Button>
              ) : (
                <Button size="sm" onClick={handleStartTimer}>
                  <Play className="h-4 w-4 mr-1" />
                  開始
                </Button>
              )}
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  手動入力
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>工数を記録</DialogTitle>
                  <DialogDescription>
                    プロジェクトの作業時間を記録します
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>日付</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, "PPP", { locale: ja })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(d) => d && setSelectedDate(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>プロジェクト</Label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>タスク（任意）</Label>
                    <Select value={selectedTask} onValueChange={setSelectedTask}>
                      <SelectTrigger>
                        <SelectValue placeholder="選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTasks
                          .filter((t) => t.projectId === selectedProject)
                          .map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>時間（時）</Label>
                    <Input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="1.5"
                      step="0.25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>作業内容</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="作業内容を入力..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleAddLog}>記録</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今日</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayHours}h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今週</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weekHours}h</div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                プロジェクト別
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {Object.entries(projectHours).map(([project, hours]) => (
                  <div key={project} className="text-sm">
                    <span className="text-muted-foreground">{project}: </span>
                    <span className="font-medium">{hours}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>週間ビュー</span>
              <span className="text-sm font-normal text-muted-foreground">
                {format(weekStart, "MM/dd", { locale: ja })} -{" "}
                {format(weekEnd, "MM/dd", { locale: ja })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayLogs = mockTimeLogs.filter(
                  (log) =>
                    format(log.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                );
                const dayTotal = dayLogs.reduce((sum, log) => sum + log.hours, 0);
                const isSelected =
                  format(day, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd");

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-xs opacity-75">
                      {format(day, "E", { locale: ja })}
                    </div>
                    <div className="font-medium">
                      {format(day, "d", { locale: ja })}
                    </div>
                    <div className="text-lg font-bold mt-1">{dayTotal}h</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, "MM月dd日", { locale: ja })}の工数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>プロジェクト</TableHead>
                  <TableHead>タスク</TableHead>
                  <TableHead>作業内容</TableHead>
                  <TableHead className="text-right">時間</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTimeLogs
                  .filter(
                    (log) =>
                      format(log.date, "yyyy-MM-dd") ===
                      format(selectedDate, "yyyy-MM-dd")
                  )
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.project}</TableCell>
                      <TableCell>{log.task}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {log.description}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {log.hours}h
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {mockTimeLogs.filter(
                  (log) =>
                    format(log.date, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd")
                ).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      この日の工数記録はありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
