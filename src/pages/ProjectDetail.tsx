import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  LayoutGrid,
  GanttChart,
  MoreHorizontal,
  Flag,
  MessageSquare,
  Paperclip,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";

// Mock data
const mockProject = {
  id: "1",
  name: "新製品ローンチキャンペーン",
  description: "2024年春の新製品発売に向けたマーケティングキャンペーン。ウェブサイト、SNS、メールマーケティングを統合した包括的なキャンペーンを実施。",
  status: "active",
  progress: 65,
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-03-31"),
  owner: { id: "1", name: "山田太郎", avatar: "YT", email: "yamada@example.com" },
  members: [
    { id: "2", name: "鈴木花子", avatar: "SH", role: "デザイナー" },
    { id: "3", name: "田中次郎", avatar: "TJ", role: "エンジニア" },
    { id: "4", name: "佐藤美咲", avatar: "SM", role: "マーケター" },
  ],
  color: "#3B82F6",
  milestones: [
    { id: "1", name: "企画フェーズ完了", date: new Date("2024-01-15"), completed: true },
    { id: "2", name: "デザイン完了", date: new Date("2024-02-01"), completed: true },
    { id: "3", name: "開発完了", date: new Date("2024-02-28"), completed: false },
    { id: "4", name: "ローンチ", date: new Date("2024-03-15"), completed: false },
  ],
};

const mockTasks = [
  { id: "1", title: "キャンペーンコンセプト策定", status: "done", priority: "high", assignee: "山田太郎", dueDate: new Date("2024-01-10") },
  { id: "2", title: "ターゲット顧客分析", status: "done", priority: "high", assignee: "佐藤美咲", dueDate: new Date("2024-01-12") },
  { id: "3", title: "ランディングページデザイン", status: "done", priority: "medium", assignee: "鈴木花子", dueDate: new Date("2024-01-20") },
  { id: "4", title: "LP実装", status: "in_progress", priority: "high", assignee: "田中次郎", dueDate: new Date("2024-02-05") },
  { id: "5", title: "メール配信システム設定", status: "in_progress", priority: "medium", assignee: "田中次郎", dueDate: new Date("2024-02-10") },
  { id: "6", title: "SNS広告クリエイティブ作成", status: "todo", priority: "medium", assignee: "鈴木花子", dueDate: new Date("2024-02-15") },
  { id: "7", title: "A/Bテスト設計", status: "todo", priority: "low", assignee: "佐藤美咲", dueDate: new Date("2024-02-20") },
  { id: "8", title: "効果測定KPI設定", status: "todo", priority: "high", assignee: "山田太郎", dueDate: new Date("2024-02-25") },
];

const priorityConfig = {
  high: { label: "高", color: "bg-red-500" },
  medium: { label: "中", color: "bg-yellow-500" },
  low: { label: "低", color: "bg-gray-500" },
};

const statusLabels = {
  todo: "未着手",
  in_progress: "進行中",
  review: "レビュー",
  done: "完了",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const project = mockProject;
  const daysLeft = differenceInDays(project.endDate, new Date());
  const totalDays = differenceInDays(project.endDate, project.startDate);
  const daysElapsed = totalDays - daysLeft;

  const tasksByStatus = {
    todo: mockTasks.filter((t) => t.status === "todo"),
    in_progress: mockTasks.filter((t) => t.status === "in_progress"),
    review: mockTasks.filter((t) => t.status === "review"),
    done: mockTasks.filter((t) => t.status === "done"),
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      // Add task logic
      setNewTaskTitle("");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: project.color }}
                />
                <h1 className="text-2xl font-bold">{project.name}</h1>
              </div>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {project.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/projects/${id}/kanban`}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                カンバン
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/projects/${id}/gantt`}>
                <GanttChart className="h-4 w-4 mr-2" />
                ガント
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">進捗</span>
                <span className="text-2xl font-bold">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">残り日数</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">{daysLeft}</span>
                  <span className="text-sm text-muted-foreground ml-1">日</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(project.endDate, "yyyy/MM/dd", { locale: ja })}まで
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">タスク</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">
                    {tasksByStatus.done.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{mockTasks.length}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">完了</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">メンバー</span>
                <span className="text-2xl font-bold">
                  {project.members.length + 1}
                </span>
              </div>
              <div className="flex -space-x-2 mt-2">
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {project.owner.avatar}
                  </AvatarFallback>
                </Avatar>
                {project.members.slice(0, 3).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-6 w-6 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="tasks" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tasks">タスク</TabsTrigger>
                <TabsTrigger value="milestones">マイルストーン</TabsTrigger>
                <TabsTrigger value="activity">アクティビティ</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4">
                {/* Add Task */}
                <div className="flex gap-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="新しいタスクを追加..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  />
                  <Button onClick={handleAddTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Task List */}
                <Card>
                  <CardContent className="p-0 divide-y">
                    {mockTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50"
                      >
                        <Checkbox checked={task.status === "done"} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium ${
                              task.status === "done"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`${
                                priorityConfig[task.priority as keyof typeof priorityConfig]
                                  .color
                              } text-white text-xs`}
                            >
                              {
                                priorityConfig[task.priority as keyof typeof priorityConfig]
                                  .label
                              }
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {task.assignee}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(task.dueDate, "MM/dd", { locale: ja })}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {statusLabels[task.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {project.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="relative">
                          {index < project.milestones.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                          )}
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                milestone.completed
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Flag className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  milestone.completed
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {milestone.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(milestone.date, "yyyy/MM/dd", {
                                  locale: ja,
                                })}
                              </p>
                            </div>
                            {!milestone.completed && (
                              <Badge variant="outline">予定</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground text-center py-8">
                      アクティビティ履歴がここに表示されます
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">プロジェクト情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">期間</p>
                    <p className="text-sm">
                      {format(project.startDate, "yyyy/MM/dd", { locale: ja })} -{" "}
                      {format(project.endDate, "yyyy/MM/dd", { locale: ja })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      プロジェクトオーナー
                    </p>
                    <p className="text-sm">{project.owner.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">メンバー</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{project.owner.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{project.owner.name}</p>
                    <p className="text-xs text-muted-foreground">オーナー</p>
                  </div>
                </div>
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">タスク状況</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">未着手</span>
                  <Badge variant="outline">{tasksByStatus.todo.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">進行中</span>
                  <Badge variant="outline">
                    {tasksByStatus.in_progress.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">完了</span>
                  <Badge variant="outline">{tasksByStatus.done.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
