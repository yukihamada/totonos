import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Calendar,
  GanttChart,
  List,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useProject, useProjectTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useProjects";
import type { TaskStatus, TaskPriority, ProjectTask } from "@/types/project";

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: "高", color: "bg-red-500" },
  medium: { label: "中", color: "bg-yellow-500" },
  low: { label: "低", color: "bg-gray-500" },
  urgent: { label: "緊急", color: "bg-purple-500" },
};

const columnConfig: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "未着手", color: "#6B7280" },
  { id: "in_progress", title: "進行中", color: "#3B82F6" },
  { id: "review", title: "レビュー", color: "#F59E0B" },
  { id: "done", title: "完了", color: "#10B981" },
];

export default function ProjectKanban() {
  const { id } = useParams<{ id: string }>();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading } = useProject(id || "");
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(id || "");
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isLoading = projectLoading || tasksLoading;

  const tasksByStatus: Record<TaskStatus, ProjectTask[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !activeColumn || !id) return;

    await createTask.mutateAsync({
      project_id: id,
      title: newTaskTitle,
      status: activeColumn,
      priority: newTaskPriority,
      assignee_id: null,
      due_date: null,
      description: null,
    });

    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setIsAddTaskOpen(false);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: TaskStatus) => {
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === columnId) {
      setDraggedTaskId(null);
      return;
    }

    await updateTask.mutateAsync({ id: draggedTaskId, status: columnId });
    setDraggedTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!id) return;
    await deleteTask.mutateAsync({ id: taskId, projectId: id });
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
      <div className="space-y-4 h-full">
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
              <p className="text-sm text-muted-foreground">カンバンボード</p>
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
              <Link to={`/projects/${id}/gantt`}>
                <GanttChart className="h-4 w-4 mr-2" />
                ガント
              </Link>
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
          {columnConfig.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="bg-muted/50 rounded-lg p-3 h-full flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {tasksByStatus[column.id].length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setActiveColumn(column.id);
                      setIsAddTaskOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tasks */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {tasksByStatus[column.id].map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{task.title}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mr-1 -mt-1"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>編集</DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              priorityConfig[task.priority]?.color || "bg-gray-500"
                            } text-white text-xs`}
                          >
                            {priorityConfig[task.priority]?.label || task.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(task.due_date), "MM/dd", { locale: ja })}
                              </div>
                            )}
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {task.assignee_id ? "U" : "-"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Empty State */}
                  {tasksByStatus[column.id].length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      タスクをドロップまたは追加
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>タスクを追加</DialogTitle>
              <DialogDescription>
                新しいタスクを作成します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">タスク名</Label>
                <Input
                  id="task-title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスク名を入力..."
                />
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea placeholder="タスクの詳細を入力..." rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>優先度</Label>
                  <Select 
                    value={newTaskPriority} 
                    onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">緊急</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAddTask} disabled={createTask.isPending}>
                追加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
