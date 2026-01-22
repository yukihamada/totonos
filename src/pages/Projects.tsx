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
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutGrid,
  GanttChart,
  Timer,
  Loader2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import { useProjects } from "@/hooks/useProjects";
import { projectStatusLabels, projectStatusColors } from "@/types/project";
import type { ProjectStatus } from "@/types/project";

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: typeof Clock }> = {
  active: { label: "進行中", color: "bg-blue-500", icon: Clock },
  completed: { label: "完了", color: "bg-green-500", icon: CheckCircle2 },
  on_hold: { label: "保留中", color: "bg-yellow-500", icon: AlertCircle },
  planning: { label: "計画中", color: "bg-gray-500", icon: Folder },
  cancelled: { label: "キャンセル", color: "bg-red-500", icon: AlertCircle },
};

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: projects = [], isLoading } = useProjects();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;

  const totalTasks = projects.reduce((sum, p) => sum + (p.tasks_total || 0), 0);
  const completedTasks = projects.reduce((sum, p) => sum + (p.tasks_completed || 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">プロジェクト管理</h1>
            <p className="text-sm text-muted-foreground">
              プロジェクトの進捗を管理します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
              <Link to="/timelog">
                <Timer className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">工数記録</span>
                <span className="sm:hidden">工数</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="flex-1 sm:flex-none">
              <Link to="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                新規
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">全プロジェクト</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
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
                {overallProgress}%
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">プロジェクトがありません</h3>
              <p className="text-muted-foreground mb-4">
                最初のプロジェクトを作成して始めましょう
              </p>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新規プロジェクト
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid/List */}
        {!isLoading && filteredProjects.length > 0 && viewMode === "grid" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const config = statusConfig[project.status] || statusConfig.planning;
              const StatusIcon = config.icon;
              const endDate = project.end_date ? new Date(project.end_date) : null;
              const daysLeft = endDate ? differenceInDays(endDate, new Date()) : null;
              
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || "#3B82F6" }}
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
                      {project.description || "説明なし"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${config.color} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      {project.status === "active" && daysLeft !== null && daysLeft >= 0 && (
                        <span className="text-xs text-muted-foreground">
                          残り{daysLeft}日
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">進捗</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {endDate ? format(endDate, "MM/dd", { locale: ja }) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {project.tasks_completed || 0}/{project.tasks_total || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            PM
                          </AvatarFallback>
                        </Avatar>
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
        )}

        {!isLoading && filteredProjects.length > 0 && viewMode === "list" && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredProjects.map((project) => {
                  const config = statusConfig[project.status] || statusConfig.planning;
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || "#3B82F6" }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description || "説明なし"}
                        </p>
                      </div>
                      <Badge className={`${config.color} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      <div className="w-32">
                        <Progress value={project.progress || 0} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {project.progress || 0}%
                      </span>
                      <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            PM
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
      </div>
    </AppLayout>
  );
}
