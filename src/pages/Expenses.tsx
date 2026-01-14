import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Search,
  Filter,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Mock data
const mockExpenses = [
  {
    id: "1",
    title: "クライアント会食",
    category: "交際費",
    amount: 25000,
    date: new Date("2024-01-10"),
    status: "approved",
    submittedBy: "山田太郎",
    approvedBy: "鈴木一郎",
  },
  {
    id: "2",
    title: "新幹線（東京-大阪）",
    category: "交通費",
    amount: 13870,
    date: new Date("2024-01-12"),
    status: "pending",
    submittedBy: "山田太郎",
    approvedBy: null,
  },
  {
    id: "3",
    title: "オフィス用品購入",
    category: "消耗品費",
    amount: 5500,
    date: new Date("2024-01-14"),
    status: "draft",
    submittedBy: "田中花子",
    approvedBy: null,
  },
  {
    id: "4",
    title: "タクシー代",
    category: "交通費",
    amount: 3200,
    date: new Date("2024-01-15"),
    status: "rejected",
    submittedBy: "佐藤次郎",
    approvedBy: null,
  },
  {
    id: "5",
    title: "書籍購入",
    category: "図書費",
    amount: 4800,
    date: new Date("2024-01-16"),
    status: "approved",
    submittedBy: "山田太郎",
    approvedBy: "鈴木一郎",
  },
];

const statusConfig = {
  draft: { label: "下書き", color: "bg-gray-500", icon: FileText },
  pending: { label: "承認待ち", color: "bg-yellow-500", icon: Clock },
  approved: { label: "承認済み", color: "bg-green-500", icon: CheckCircle2 },
  rejected: { label: "却下", color: "bg-red-500", icon: XCircle },
};

const categoryColors: Record<string, string> = {
  交通費: "bg-blue-100 text-blue-800",
  交際費: "bg-purple-100 text-purple-800",
  消耗品費: "bg-green-100 text-green-800",
  図書費: "bg-orange-100 text-orange-800",
  通信費: "bg-pink-100 text-pink-800",
  その他: "bg-gray-100 text-gray-800",
};

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || expense.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalApproved = mockExpenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPending = mockExpenses
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalThisMonth = mockExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">経費精算</h1>
            <p className="text-muted-foreground">
              経費の申請・承認を管理します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/advance-payment">
                <Wallet className="h-4 w-4 mr-2" />
                仮払い申請
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/expenses/settings">
                <Settings className="h-4 w-4 mr-2" />
                設定
              </Link>
            </Button>
            <Button asChild>
              <Link to="/expenses/new">
                <Plus className="h-4 w-4 mr-2" />
                経費申請
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今月の経費</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{totalThisMonth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockExpenses.length}件の申請
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">承認済み</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ¥{totalApproved.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockExpenses.filter((e) => e.status === "approved").length}件
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ¥{totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockExpenses.filter((e) => e.status === "pending").length}件
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                レシート読取
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/receipt-capture">
                  レシートをスキャン
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="mine">自分の申請</TabsTrigger>
              <TabsTrigger value="approval">承認待ち</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="pending">承認待ち</SelectItem>
                  <SelectItem value="approved">承認済み</SelectItem>
                  <SelectItem value="rejected">却下</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="交通費">交通費</SelectItem>
                  <SelectItem value="交際費">交際費</SelectItem>
                  <SelectItem value="消耗品費">消耗品費</SelectItem>
                  <SelectItem value="図書費">図書費</SelectItem>
                  <SelectItem value="通信費">通信費</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申請日</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>申請者</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const StatusIcon = statusConfig[expense.status as keyof typeof statusConfig].icon;
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="text-muted-foreground">
                          {format(expense.date, "MM/dd", { locale: ja })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={categoryColors[expense.category] || categoryColors["その他"]}
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.submittedBy}</TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusConfig[expense.status as keyof typeof statusConfig].color} text-white`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[expense.status as keyof typeof statusConfig].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/expenses/${expense.id}`}>詳細</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="mine">
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                自分の申請のみ表示されます
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="approval">
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                あなたの承認待ちの申請が表示されます
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
