import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import { useProject, useProjectTasks, useCreateTask, useUpdateTask } from "@/hooks/useProjects";
import { taskStatusLabels, taskPriorityLabels } from "@/types/project";
import type { TaskStatus, TaskPriority } from "@/types/project";

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: "高", color: "bg-red-500" },
  medium: { label: "中", color: "bg-yellow-500" },
  low: { label: "低", color: "bg-gray-500" },
  urgent: { label: "緊急", color: "bg-purple-500" },
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: project, isLoading: projectLoading } = useProject(id || "");
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(id || "");
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">プロジェクトが見つかりません</p>
          <Button asChild>
            <Link to="/projects">プロジェクト一覧へ</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const startDate = project.start_date ? new Date(project.start_date) : new Date();
  const endDate = project.end_date ? new Date(project.end_date) : new Date();
  const daysLeft = differenceInDays(endDate, new Date());
  const totalDays = differenceInDays(endDate, startDate);

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && id) {
      await createTask.mutateAsync({
        project_id: id,
        title: newTaskTitle,
        status: "todo",
        priority: "medium",
        assignee_id: null,
        due_date: null,
        description: null,
      });
      setNewTaskTitle("");
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === "done" ? "todo" : "done";
    await updateTask.mutateAsync({ id: taskId, status: newStatus });
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
                  style={{ backgroundColor: project.color || "#3B82F6" }}
                />
                <h1 className="text-2xl font-bold">{project.name}</h1>
              </div>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {project.description || "説明なし"}
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
                <span className="text-2xl font-bold">{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">残り日数</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">{daysLeft > 0 ? daysLeft : 0}</span>
                  <span className="text-sm text-muted-foreground ml-1">日</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(endDate, "yyyy/MM/dd", { locale: ja })}まで
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
                    /{tasks.length}
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
                  {(project.members?.length || 0) + 1}
                </span>
              </div>
              <div className="flex -space-x-2 mt-2">
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">PM</AvatarFallback>
                </Avatar>
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
                  <Button onClick={handleAddTask} disabled={createTask.isPending}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Task List */}
                <Card>
                  <CardContent className="p-0 divide-y">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        タスクがありません
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50"
                        >
                          <Checkbox 
                            checked={task.status === "done"}
                            onCheckedChange={() => handleToggleTask(task.id, task.status)}
                          />
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
                                  priorityConfig[task.priority]?.color || "bg-gray-500"
                                } text-white text-xs`}
                              >
                                {priorityConfig[task.priority]?.label || task.priority}
                              </Badge>
                              {task.due_date && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(task.due_date), "MM/dd", { locale: ja })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {taskStatusLabels[task.status]}
                          </Badge>
                        </div>
                      ))
                    )}
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
                      {format(startDate, "yyyy/MM/dd", { locale: ja })} -{" "}
                      {format(endDate, "yyyy/MM/dd", { locale: ja })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      プロジェクトオーナー
                    </p>
                    <p className="text-sm">オーナー</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">タスク状況</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">未着手</span>
                  <Badge variant="secondary">{tasksByStatus.todo.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">進行中</span>
                  <Badge variant="secondary">{tasksByStatus.in_progress.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">レビュー</span>
                  <Badge variant="secondary">{tasksByStatus.review.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">完了</span>
                  <Badge variant="secondary">{tasksByStatus.done.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
