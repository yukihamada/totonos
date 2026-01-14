import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  Eye,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Mock data
const mockJobPostings = [
  {
    id: "1",
    title: "フロントエンドエンジニア",
    department: "開発部",
    location: "東京",
    type: "正社員",
    salaryMin: 5000000,
    salaryMax: 8000000,
    applicants: 15,
    views: 234,
    status: "open",
    postedAt: new Date("2024-01-05"),
  },
  {
    id: "2",
    title: "プロダクトマネージャー",
    department: "プロダクト部",
    location: "東京",
    type: "正社員",
    salaryMin: 7000000,
    salaryMax: 12000000,
    applicants: 8,
    views: 156,
    status: "open",
    postedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    title: "カスタマーサポート",
    department: "サポート部",
    location: "大阪",
    type: "契約社員",
    salaryMin: 3500000,
    salaryMax: 4500000,
    applicants: 12,
    views: 189,
    status: "open",
    postedAt: new Date("2024-01-12"),
  },
  {
    id: "4",
    title: "バックエンドエンジニア",
    department: "開発部",
    location: "リモート",
    type: "正社員",
    salaryMin: 6000000,
    salaryMax: 10000000,
    applicants: 7,
    views: 98,
    status: "draft",
    postedAt: null,
  },
  {
    id: "5",
    title: "マーケティングマネージャー",
    department: "マーケティング部",
    location: "東京",
    type: "正社員",
    salaryMin: 6000000,
    salaryMax: 9000000,
    applicants: 23,
    views: 312,
    status: "closed",
    postedAt: new Date("2023-12-01"),
  },
];

const statusConfig = {
  open: { label: "公開中", color: "bg-green-500" },
  draft: { label: "下書き", color: "bg-gray-500" },
  closed: { label: "募集終了", color: "bg-red-500" },
};

export default function JobPostings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const departments = [...new Set(mockJobPostings.map((j) => j.department))];

  const filteredPostings = mockJobPostings.filter((posting) => {
    const matchesSearch = posting.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || posting.status === statusFilter;
    const matchesDept =
      departmentFilter === "all" || posting.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const formatSalary = (min: number, max: number) => {
    const formatNum = (n: number) => `${Math.round(n / 10000)}万`;
    return `${formatNum(min)}〜${formatNum(max)}円`;
  };

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
              <h1 className="text-2xl font-bold">求人管理</h1>
              <p className="text-muted-foreground">
                求人の作成・編集・公開を管理します
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/job-postings/new">
              <Plus className="h-4 w-4 mr-2" />
              新規求人
            </Link>
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {mockJobPostings.filter((j) => j.status === "open").length}
              </div>
              <p className="text-sm text-muted-foreground">公開中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {mockJobPostings.filter((j) => j.status === "draft").length}
              </div>
              <p className="text-sm text-muted-foreground">下書き</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {mockJobPostings.reduce((sum, j) => sum + j.applicants, 0)}
              </div>
              <p className="text-sm text-muted-foreground">総応募数</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="求人を検索..."
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
              <SelectItem value="open">公開中</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="closed">募集終了</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="部署" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての部署</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Postings Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>求人タイトル</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>勤務地</TableHead>
                <TableHead>給与レンジ</TableHead>
                <TableHead className="text-center">応募者</TableHead>
                <TableHead className="text-center">閲覧数</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPostings.map((posting) => (
                <TableRow key={posting.id}>
                  <TableCell>
                    <Link
                      to={`/job-postings/${posting.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {posting.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {posting.type}
                      </Badge>
                      {posting.postedAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(posting.postedAt, "MM/dd", { locale: ja })}
                          公開
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{posting.department}</TableCell>
                  <TableCell>{posting.location}</TableCell>
                  <TableCell>
                    {formatSalary(posting.salaryMin, posting.salaryMax)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {posting.applicants}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {posting.views}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        statusConfig[posting.status as keyof typeof statusConfig]
                          .color
                      } text-white`}
                    >
                      {
                        statusConfig[posting.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/job-postings/${posting.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            詳細
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          複製
                        </DropdownMenuItem>
                        {posting.status === "open" && (
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            求人ページを開く
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredPostings.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              該当する求人がありません
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
