import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CalendarIcon, Upload, Receipt, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const expenseCategories = [
  { value: "transportation", label: "交通費" },
  { value: "entertainment", label: "交際費" },
  { value: "supplies", label: "消耗品費" },
  { value: "books", label: "図書費" },
  { value: "communication", label: "通信費" },
  { value: "accommodation", label: "宿泊費" },
  { value: "other", label: "その他" },
];

const departments = [
  { value: "sales", label: "営業部" },
  { value: "engineering", label: "開発部" },
  { value: "marketing", label: "マーケティング部" },
  { value: "hr", label: "人事部" },
  { value: "finance", label: "経理部" },
  { value: "general", label: "総務部" },
];

interface AllocationItem {
  id: string;
  department: string;
  percentage: number;
}

export default function ExpenseNew() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [enableAllocation, setEnableAllocation] = useState(false);
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { id: "1", department: "", percentage: 100 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAllocation = () => {
    setAllocations([
      ...allocations,
      { id: Date.now().toString(), department: "", percentage: 0 },
    ]);
  };

  const handleRemoveAllocation = (id: string) => {
    if (allocations.length > 1) {
      setAllocations(allocations.filter((a) => a.id !== id));
    }
  };

  const handleAllocationChange = (
    id: string,
    field: "department" | "percentage",
    value: string | number
  ) => {
    setAllocations(
      allocations.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };

  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && (!date || !category || !amount || !title)) {
      toast.error("必須項目を入力してください");
      return;
    }

    if (enableAllocation && totalPercentage !== 100) {
      toast.error("配賦割合の合計を100%にしてください");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(isDraft ? "下書きを保存しました" : "経費申請を提出しました");
    navigate("/expenses");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/expenses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">経費申請</h1>
            <p className="text-muted-foreground">新しい経費を申請します</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>経費情報</CardTitle>
            <CardDescription>
              経費の詳細を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  利用日 <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ja }) : "日付を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">
                  カテゴリ <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                内容 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：クライアント会食、出張交通費"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                金額 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ¥
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">備考</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="補足説明があれば入力してください"
                rows={3}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>領収書・レシート</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {receiptFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <Receipt className="h-5 w-5 text-green-500" />
                    <span>{receiptFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReceiptFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      ファイルをドラッグ＆ドロップまたはクリックしてアップロード
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/receipt-capture">
                        <Receipt className="h-4 w-4 mr-2" />
                        レシート読取を使用
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Department Allocation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allocation"
                  checked={enableAllocation}
                  onCheckedChange={(checked) =>
                    setEnableAllocation(checked as boolean)
                  }
                />
                <Label htmlFor="allocation" className="cursor-pointer">
                  部門配賦を設定する
                </Label>
              </div>

              {enableAllocation && (
                <div className="space-y-3 pl-6">
                  {allocations.map((allocation, index) => (
                    <div key={allocation.id} className="flex items-center gap-2">
                      <Select
                        value={allocation.department}
                        onValueChange={(value) =>
                          handleAllocationChange(allocation.id, "department", value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="部門を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 w-24">
                        <Input
                          type="number"
                          value={allocation.percentage}
                          onChange={(e) =>
                            handleAllocationChange(
                              allocation.id,
                              "percentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-16"
                          min={0}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      {allocations.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAllocation(allocation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAllocation}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      配賦先を追加
                    </Button>
                    <span
                      className={cn(
                        "text-sm",
                        totalPercentage === 100
                          ? "text-green-600"
                          : "text-red-500"
                      )}
                    >
                      合計: {totalPercentage}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            下書き保存
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : "申請を提出"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
