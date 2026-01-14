import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
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
  MessageSquare,
  Paperclip,
  GanttChart,
  List,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Mock data
const mockColumns = [
  {
    id: "todo",
    title: "未着手",
    color: "#6B7280",
    tasks: [
      {
        id: "1",
        title: "SNS広告クリエイティブ作成",
        priority: "medium",
        assignee: { name: "鈴木花子", avatar: "SH" },
        dueDate: new Date("2024-02-15"),
        comments: 2,
        attachments: 1,
      },
      {
        id: "2",
        title: "A/Bテスト設計",
        priority: "low",
        assignee: { name: "佐藤美咲", avatar: "SM" },
        dueDate: new Date("2024-02-20"),
        comments: 0,
        attachments: 0,
      },
      {
        id: "3",
        title: "効果測定KPI設定",
        priority: "high",
        assignee: { name: "山田太郎", avatar: "YT" },
        dueDate: new Date("2024-02-25"),
        comments: 3,
        attachments: 2,
      },
    ],
  },
  {
    id: "in_progress",
    title: "進行中",
    color: "#3B82F6",
    tasks: [
      {
        id: "4",
        title: "LP実装",
        priority: "high",
        assignee: { name: "田中次郎", avatar: "TJ" },
        dueDate: new Date("2024-02-05"),
        comments: 5,
        attachments: 3,
      },
      {
        id: "5",
        title: "メール配信システム設定",
        priority: "medium",
        assignee: { name: "田中次郎", avatar: "TJ" },
        dueDate: new Date("2024-02-10"),
        comments: 1,
        attachments: 0,
      },
    ],
  },
  {
    id: "review",
    title: "レビュー",
    color: "#F59E0B",
    tasks: [],
  },
  {
    id: "done",
    title: "完了",
    color: "#10B981",
    tasks: [
      {
        id: "6",
        title: "キャンペーンコンセプト策定",
        priority: "high",
        assignee: { name: "山田太郎", avatar: "YT" },
        dueDate: new Date("2024-01-10"),
        comments: 4,
        attachments: 2,
      },
      {
        id: "7",
        title: "ターゲット顧客分析",
        priority: "high",
        assignee: { name: "佐藤美咲", avatar: "SM" },
        dueDate: new Date("2024-01-12"),
        comments: 2,
        attachments: 1,
      },
      {
        id: "8",
        title: "ランディングページデザイン",
        priority: "medium",
        assignee: { name: "鈴木花子", avatar: "SH" },
        dueDate: new Date("2024-01-20"),
        comments: 6,
        attachments: 4,
      },
    ],
  },
];

const priorityConfig = {
  high: { label: "高", color: "bg-red-500" },
  medium: { label: "中", color: "bg-yellow-500" },
  low: { label: "低", color: "bg-gray-500" },
};

export default function ProjectKanban() {
  const { id } = useParams();
  const [columns, setColumns] = useState(mockColumns);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const projectName = "新製品ローンチキャンペーン";

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !activeColumn) return;

    setColumns(
      columns.map((col) => {
        if (col.id === activeColumn) {
          return {
            ...col,
            tasks: [
              ...col.tasks,
              {
                id: Date.now().toString(),
                title: newTaskTitle,
                priority: "medium" as const,
                assignee: { name: "山田太郎", avatar: "YT" },
                dueDate: new Date(),
                comments: 0,
                attachments: 0,
              },
            ],
          };
        }
        return col;
      })
    );

    setNewTaskTitle("");
    setIsAddTaskOpen(false);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedTask) return;

    // Find source column and task
    let taskToMove: typeof columns[0]["tasks"][0] | null = null;
    let sourceColumnId: string | null = null;

    columns.forEach((col) => {
      const task = col.tasks.find((t) => t.id === draggedTask);
      if (task) {
        taskToMove = task;
        sourceColumnId = col.id;
      }
    });

    if (!taskToMove || !sourceColumnId || sourceColumnId === columnId) {
      setDraggedTask(null);
      return;
    }

    // Move task
    setColumns(
      columns.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== draggedTask),
          };
        }
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [...col.tasks, taskToMove!],
          };
        }
        return col;
      })
    );

    setDraggedTask(null);
  };

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
              <h1 className="text-xl font-bold">{projectName}</h1>
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
          {columns.map((column) => (
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
                      {column.tasks.length}
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
                  {column.tasks.map((task) => (
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
                              <DropdownMenuItem>複製</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
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
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(task.dueDate, "MM/dd", { locale: ja })}
                            </div>
                            {task.comments > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments}
                              </div>
                            )}
                            {task.attachments > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {task.attachments}
                              </div>
                            )}
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {task.assignee.avatar}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Quick Add */}
                  {column.tasks.length === 0 && (
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
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>担当者</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yamada">山田太郎</SelectItem>
                      <SelectItem value="suzuki">鈴木花子</SelectItem>
                      <SelectItem value="tanaka">田中次郎</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAddTask}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
