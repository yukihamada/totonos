import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Grid,
  List,
  MoreHorizontal,
  Folder,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutGrid,
  GanttChart,
  Timer,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";

// Mock data
const mockProjects = [
  {
    id: "1",
    name: "新製品ローンチキャンペーン",
    description: "2024年春の新製品発売に向けたマーケティングキャンペーン",
    status: "active",
    progress: 65,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    owner: { name: "山田太郎", avatar: "YT" },
    members: [
      { name: "鈴木花子", avatar: "SH" },
      { name: "田中次郎", avatar: "TJ" },
    ],
    tasksTotal: 24,
    tasksCompleted: 16,
    color: "#3B82F6",
  },
  {
    id: "2",
    name: "基幹システムリニューアル",
    description: "レガシーシステムの刷新とクラウド移行",
    status: "active",
    progress: 30,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-06-30"),
    owner: { name: "佐藤一郎", avatar: "SI" },
    members: [
      { name: "高橋美咲", avatar: "TM" },
      { name: "伊藤健太", avatar: "IK" },
      { name: "渡辺由美", avatar: "WY" },
    ],
    tasksTotal: 45,
    tasksCompleted: 14,
    color: "#8B5CF6",
  },
  {
    id: "3",
    name: "顧客満足度向上プロジェクト",
    description: "NPS改善とカスタマーサポート体制の強化",
    status: "on_hold",
    progress: 45,
    startDate: new Date("2023-11-01"),
    endDate: new Date("2024-02-29"),
    owner: { name: "木村由美", avatar: "KY" },
    members: [{ name: "中村太一", avatar: "NT" }],
    tasksTotal: 18,
    tasksCompleted: 8,
    color: "#F59E0B",
  },
  {
    id: "4",
    name: "新卒採用2024",
    description: "2024年度新卒採用活動",
    status: "completed",
    progress: 100,
    startDate: new Date("2023-06-01"),
    endDate: new Date("2023-12-31"),
    owner: { name: "加藤美穂", avatar: "KM" },
    members: [{ name: "小林健", avatar: "KT" }],
    tasksTotal: 32,
    tasksCompleted: 32,
    color: "#10B981",
  },
];

const statusConfig = {
  active: { label: "進行中", color: "bg-blue-500", icon: Clock },
  completed: { label: "完了", color: "bg-green-500", icon: CheckCircle2 },
  on_hold: { label: "保留中", color: "bg-yellow-500", icon: AlertCircle },
  planning: { label: "計画中", color: "bg-gray-500", icon: Folder },
};

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = mockProjects.filter((p) => p.status === "active").length;
  const completedProjects = mockProjects.filter(
    (p) => p.status === "completed"
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">プロジェクト管理</h1>
            <p className="text-muted-foreground">
              プロジェクトの進捗を管理します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/timelog">
                <Timer className="h-4 w-4 mr-2" />
                工数記録
              </Link>
            </Button>
            <Button asChild>
              <Link to="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                新規プロジェクト
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">全プロジェクト</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">進行中</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activeProjects}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">完了</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedProjects}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">総タスク完了率</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (mockProjects.reduce((sum, p) => sum + p.tasksCompleted, 0) /
                    mockProjects.reduce((sum, p) => sum + p.tasksTotal, 0)) *
                    100
                )}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="プロジェクトを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">進行中</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="on_hold">保留中</SelectItem>
                <SelectItem value="planning">計画中</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const StatusIcon =
                statusConfig[project.status as keyof typeof statusConfig].icon;
              const daysLeft = differenceInDays(project.endDate, new Date());
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/projects/${project.id}`}>詳細を見る</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/projects/${project.id}/kanban`}>
                              <LayoutGrid className="h-4 w-4 mr-2" />
                              カンバン
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/projects/${project.id}/gantt`}>
                              <GanttChart className="h-4 w-4 mr-2" />
                              ガントチャート
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Link to={`/projects/${project.id}`}>
                      <CardTitle className="text-lg hover:text-primary">
                        {project.name}
                      </CardTitle>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`${
                          statusConfig[project.status as keyof typeof statusConfig]
                            .color
                        } text-white`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {
                          statusConfig[project.status as keyof typeof statusConfig]
                            .label
                        }
                      </Badge>
                      {project.status === "active" && daysLeft >= 0 && (
                        <span className="text-xs text-muted-foreground">
                          残り{daysLeft}日
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">進捗</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(project.endDate, "MM/dd", { locale: ja })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {project.tasksCompleted}/{project.tasksTotal}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {project.owner.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {project.members.slice(0, 2).map((member, index) => (
                          <Avatar
                            key={index}
                            className="h-8 w-8 border-2 border-background"
                          >
                            <AvatarFallback className="text-xs">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members.length > 2 && (
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className="text-xs bg-muted">
                              +{project.members.length - 2}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>開く</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredProjects.map((project) => {
                  const StatusIcon =
                    statusConfig[project.status as keyof typeof statusConfig].icon;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          statusConfig[project.status as keyof typeof statusConfig]
                            .color
                        } text-white`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {
                          statusConfig[project.status as keyof typeof statusConfig]
                            .label
                        }
                      </Badge>
                      <div className="w-32">
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {project.progress}%
                      </span>
                      <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {project.owner.avatar}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>開く</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredProjects.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>該当するプロジェクトがありません</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
