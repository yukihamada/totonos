import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Settings,
  FolderTree,
  GitBranch,
  Building,
  Edit,
  Trash2,
  GripVertical,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockCategories = [
  { id: "1", name: "交通費", code: "TRANSPORT", accountCode: "7311", active: true },
  { id: "2", name: "交際費", code: "ENTERTAINMENT", accountCode: "7411", active: true },
  { id: "3", name: "消耗品費", code: "SUPPLIES", accountCode: "7511", active: true },
  { id: "4", name: "図書費", code: "BOOKS", accountCode: "7521", active: true },
  { id: "5", name: "通信費", code: "COMMUNICATION", accountCode: "7611", active: true },
  { id: "6", name: "宿泊費", code: "ACCOMMODATION", accountCode: "7312", active: true },
  { id: "7", name: "会議費", code: "MEETING", accountCode: "7421", active: false },
];

const mockApprovalFlows = [
  {
    id: "1",
    name: "一般経費",
    description: "5万円以下の経費",
    maxAmount: 50000,
    steps: [
      { role: "部長", required: true },
      { role: "経理", required: true },
    ],
  },
  {
    id: "2",
    name: "高額経費",
    description: "5万円超の経費",
    maxAmount: null,
    steps: [
      { role: "部長", required: true },
      { role: "役員", required: true },
      { role: "経理", required: true },
    ],
  },
];

const mockDepartments = [
  { id: "1", name: "営業部", code: "SALES", manager: "鈴木一郎" },
  { id: "2", name: "開発部", code: "DEV", manager: "田中次郎" },
  { id: "3", name: "マーケティング部", code: "MKT", manager: "佐藤花子" },
  { id: "4", name: "人事部", code: "HR", manager: "山田太郎" },
  { id: "5", name: "経理部", code: "FIN", manager: "高橋美咲" },
];

export default function ExpenseSettings() {
  const [categories, setCategories] = useState(mockCategories);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    accountCode: "",
  });

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.code) {
      toast.error("カテゴリ名とコードを入力してください");
      return;
    }
    setCategories([
      ...categories,
      {
        id: Date.now().toString(),
        ...newCategory,
        active: true,
      },
    ]);
    setNewCategory({ name: "", code: "", accountCode: "" });
    setIsCategoryDialogOpen(false);
    toast.success("カテゴリを追加しました");
  };

  const handleToggleCategory = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, active: !cat.active } : cat
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/expenses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">経費設定</h1>
            <p className="text-muted-foreground">
              経費カテゴリ、承認フロー、部門の設定を管理します
            </p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">
              <FolderTree className="h-4 w-4 mr-2" />
              カテゴリ
            </TabsTrigger>
            <TabsTrigger value="approval">
              <GitBranch className="h-4 w-4 mr-2" />
              承認フロー
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building className="h-4 w-4 mr-2" />
              部門
            </TabsTrigger>
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              一般
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>経費カテゴリ</CardTitle>
                  <CardDescription>
                    経費申請時に選択できるカテゴリを管理します
                  </CardDescription>
                </div>
                <Dialog
                  open={isCategoryDialogOpen}
                  onOpenChange={setIsCategoryDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      カテゴリ追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新規カテゴリ</DialogTitle>
                      <DialogDescription>
                        新しい経費カテゴリを追加します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="cat-name">カテゴリ名</Label>
                        <Input
                          id="cat-name"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({ ...newCategory, name: e.target.value })
                          }
                          placeholder="例：交通費"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cat-code">コード</Label>
                        <Input
                          id="cat-code"
                          value={newCategory.code}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="例：TRANSPORT"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cat-account">勘定科目コード</Label>
                        <Input
                          id="cat-account"
                          value={newCategory.accountCode}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              accountCode: e.target.value,
                            })
                          }
                          placeholder="例：7311"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCategoryDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button onClick={handleAddCategory}>追加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>カテゴリ名</TableHead>
                      <TableHead>コード</TableHead>
                      <TableHead>勘定科目</TableHead>
                      <TableHead>有効</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                            {category.code}
                          </code>
                        </TableCell>
                        <TableCell>{category.accountCode || "-"}</TableCell>
                        <TableCell>
                          <Switch
                            checked={category.active}
                            onCheckedChange={() =>
                              handleToggleCategory(category.id)
                            }
                          />
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Flow Tab */}
          <TabsContent value="approval" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>承認フロー</CardTitle>
                  <CardDescription>
                    金額に応じた承認フローを設定します
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  フロー追加
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockApprovalFlows.map((flow) => (
                  <Card key={flow.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{flow.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {flow.description}
                          </p>
                          <p className="text-sm mt-1">
                            上限金額:{" "}
                            {flow.maxAmount
                              ? `¥${flow.maxAmount.toLocaleString()}`
                              : "なし"}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {flow.steps.map((step, index) => (
                          <div key={index} className="flex items-center">
                            {index > 0 && (
                              <div className="w-8 h-0.5 bg-border" />
                            )}
                            <Badge variant="outline">{step.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>部門マスタ</CardTitle>
                  <CardDescription>
                    経費の部門配賦で使用する部門を管理します
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  部門追加
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>部門名</TableHead>
                      <TableHead>コード</TableHead>
                      <TableHead>部門長</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDepartments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                            {dept.code}
                          </code>
                        </TableCell>
                        <TableCell>{dept.manager}</TableCell>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>一般設定</CardTitle>
                <CardDescription>
                  経費精算の基本設定を変更します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>レシート必須</Label>
                    <p className="text-sm text-muted-foreground">
                      経費申請時にレシートの添付を必須にする
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>電子帳簿保存法対応</Label>
                    <p className="text-sm text-muted-foreground">
                      タイムスタンプの付与と検索要件の確保
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>仮払い機能</Label>
                    <p className="text-sm text-muted-foreground">
                      事前の仮払い申請を有効にする
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>デフォルト通貨</Label>
                  <Select defaultValue="JPY">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                      <SelectItem value="USD">米ドル (USD)</SelectItem>
                      <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>精算締め日</Label>
                  <Select defaultValue="25">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15日</SelectItem>
                      <SelectItem value="20">20日</SelectItem>
                      <SelectItem value="25">25日</SelectItem>
                      <SelectItem value="末日">月末</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      電子帳簿保存法について
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      2024年1月より電子取引データの電子保存が義務化されています。
                      領収書のタイムスタンプと検索要件が適切に設定されていることを確認してください。
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-yellow-300"
                      asChild
                    >
                      <Link to="/e-bookkeeping">電子帳簿設定を確認</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
