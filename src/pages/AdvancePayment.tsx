import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  Plus,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarIcon,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data
const mockAdvancePayments = [
  {
    id: "1",
    purpose: "大阪出張",
    requestedAmount: 50000,
    approvedAmount: 50000,
    settledAmount: 48500,
    status: "settled",
    requestDate: new Date("2024-01-05"),
    settleDate: new Date("2024-01-15"),
  },
  {
    id: "2",
    purpose: "展示会出展費用",
    requestedAmount: 150000,
    approvedAmount: 150000,
    settledAmount: null,
    status: "approved",
    requestDate: new Date("2024-01-10"),
    settleDate: null,
  },
  {
    id: "3",
    purpose: "新入社員歓迎会",
    requestedAmount: 80000,
    approvedAmount: null,
    settledAmount: null,
    status: "pending",
    requestDate: new Date("2024-01-12"),
    settleDate: null,
  },
  {
    id: "4",
    purpose: "営業車修理費",
    requestedAmount: 100000,
    approvedAmount: null,
    settledAmount: null,
    status: "rejected",
    requestDate: new Date("2024-01-08"),
    settleDate: null,
  },
];

const statusConfig = {
  pending: { label: "承認待ち", color: "bg-yellow-500", icon: Clock },
  approved: { label: "承認済み", color: "bg-blue-500", icon: CheckCircle2 },
  settled: { label: "精算済み", color: "bg-green-500", icon: CheckCircle2 },
  rejected: { label: "却下", color: "bg-red-500", icon: XCircle },
  overdue: { label: "精算期限超過", color: "bg-orange-500", icon: AlertCircle },
};

export default function AdvancePayment() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPending = mockAdvancePayments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + (p.approvedAmount || 0), 0);

  const handleSubmit = async () => {
    if (!purpose || !amount || !expectedDate) {
      toast.error("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("仮払い申請を提出しました");
    setIsNewDialogOpen(false);
    setPurpose("");
    setAmount("");
    setReason("");
    setExpectedDate(undefined);
    setIsSubmitting(false);
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">仮払い申請</h1>
            <p className="text-muted-foreground">
              事前に経費の仮払いを申請し、利用後に精算します
            </p>
          </div>
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                仮払い申請
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>仮払い申請</DialogTitle>
                <DialogDescription>
                  仮払いの用途と金額を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose">
                    用途 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="例：大阪出張、展示会出展"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    申請金額 <span className="text-red-500">*</span>
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
                  <Label>
                    利用予定日 <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expectedDate
                          ? format(expectedDate, "PPP", { locale: ja })
                          : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expectedDate}
                        onSelect={setExpectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">申請理由</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="仮払いが必要な理由を記載してください"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "送信中..." : "申請する"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">未精算残高</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockAdvancePayments.filter((p) => p.status === "approved").length}
                件の仮払い
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAdvancePayments.filter((p) => p.status === "pending").length}件
              </div>
              <p className="text-xs text-muted-foreground">
                ¥
                {mockAdvancePayments
                  .filter((p) => p.status === "pending")
                  .reduce((sum, p) => sum + p.requestedAmount, 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">今月精算済み</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAdvancePayments.filter((p) => p.status === "settled").length}件
              </div>
              <p className="text-xs text-muted-foreground">
                ¥
                {mockAdvancePayments
                  .filter((p) => p.status === "settled")
                  .reduce((sum, p) => sum + (p.settledAmount || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advance Payment List */}
        <Card>
          <CardHeader>
            <CardTitle>仮払い一覧</CardTitle>
            <CardDescription>
              仮払いの申請状況と精算状況を確認できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>申請日</TableHead>
                  <TableHead>用途</TableHead>
                  <TableHead className="text-right">申請額</TableHead>
                  <TableHead className="text-right">承認額</TableHead>
                  <TableHead className="text-right">精算額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAdvancePayments.map((payment) => {
                  const StatusIcon =
                    statusConfig[payment.status as keyof typeof statusConfig].icon;
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="text-muted-foreground">
                        {format(payment.requestDate, "MM/dd", { locale: ja })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.purpose}
                      </TableCell>
                      <TableCell className="text-right">
                        ¥{payment.requestedAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.approvedAmount
                          ? `¥${payment.approvedAmount.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.settledAmount
                          ? `¥${payment.settledAmount.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            statusConfig[payment.status as keyof typeof statusConfig]
                              .color
                          } text-white`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {
                            statusConfig[payment.status as keyof typeof statusConfig]
                              .label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.status === "approved" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/expenses/new">
                              <Receipt className="h-4 w-4 mr-1" />
                              精算
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">仮払い精算の流れ</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">仮払い申請</span>
                ：用途と金額を記載して申請
              </li>
              <li>
                <span className="font-medium text-foreground">承認</span>
                ：上長が申請内容を確認・承認
              </li>
              <li>
                <span className="font-medium text-foreground">支給</span>
                ：経理から仮払い金を受領
              </li>
              <li>
                <span className="font-medium text-foreground">利用・精算</span>
                ：利用後、領収書を添付して経費精算
              </li>
              <li>
                <span className="font-medium text-foreground">過不足精算</span>
                ：差額を返金または追加支給
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
