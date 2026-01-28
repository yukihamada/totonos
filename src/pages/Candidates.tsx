import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  FileText,
  Star,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useCandidates } from "@/hooks/useCandidates";
import { Skeleton } from "@/components/ui/skeleton";

// Removed mock data - now using useCandidates hook

const statusConfig = {
  new: { label: "新規", color: "bg-gray-500" },
  screening: { label: "書類選考", color: "bg-yellow-500" },
  interview: { label: "面接中", color: "bg-blue-500" },
  offer: { label: "内定", color: "bg-green-500" },
  rejected: { label: "不採用", color: "bg-red-500" },
  hired: { label: "入社", color: "bg-purple-500" },
};

const pipelineStages = [
  { id: "screening", label: "書類選考", count: 0 },
  { id: "interview1", label: "一次面接", count: 0 },
  { id: "interview2", label: "技術面接", count: 0 },
  { id: "final", label: "最終面接", count: 0 },
  { id: "offer", label: "内定", count: 0 },
];

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const { data: candidates = [], isLoading } = useCandidates();

  const positions = [...new Set(candidates.map((c) => c.position))];

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || candidate.status === statusFilter;
    const matchesPosition =
      positionFilter === "all" || candidate.position === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  // Group by stage for kanban view
  const kanbanColumns = [
    {
      id: "screening",
      title: "書類選考",
      candidates: filteredCandidates.filter((c) => c.status === "screening"),
    },
    {
      id: "interview",
      title: "面接中",
      candidates: filteredCandidates.filter((c) => c.status === "interview"),
    },
    {
      id: "offer",
      title: "内定",
      candidates: filteredCandidates.filter((c) => c.status === "offer"),
    },
    {
      id: "hired",
      title: "入社",
      candidates: filteredCandidates.filter((c) => c.status === "hired"),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/recruiting">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">候補者管理</h1>
              <p className="text-muted-foreground">
                {candidates.length}名の候補者
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              リスト
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              カンバン
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="候補者を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="screening">書類選考</SelectItem>
              <SelectItem value="interview">面接中</SelectItem>
              <SelectItem value="offer">内定</SelectItem>
              <SelectItem value="rejected">不採用</SelectItem>
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="ポジション" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのポジション</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{candidate.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/candidates/${candidate.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {candidate.name}
                      </Link>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{candidate.position}</span>
                        <span>•</span>
                        <span>{candidate.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < candidate.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge
                      className={`${
                        statusConfig[candidate.status as keyof typeof statusConfig]
                          .color
                      } text-white`}
                    >
                      {candidate.stage}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      {format(candidate.appliedAt, "MM/dd", { locale: ja })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/candidates/${candidate.id}`}>
                            詳細を見る
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          メール送信
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          面接を設定
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>ステージを変更</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          不採用にする
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-72">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{column.title}</h3>
                    <Badge variant="secondary">{column.candidates.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {column.candidates.map((candidate) => (
                      <Card
                        key={candidate.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {candidate.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/candidates/${candidate.id}`}
                                className="font-medium text-sm hover:text-primary"
                              >
                                {candidate.name}
                              </Link>
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.position}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < candidate.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {candidate.stage}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {column.candidates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        候補者なし
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCandidates.length === 0 && viewMode === "list" && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              該当する候補者がいません
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
