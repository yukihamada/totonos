import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Receipt,
  Calendar,
  User,
  Building,
  MessageSquare,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

// Mock data
const mockExpense = {
  id: "1",
  title: "クライアント会食（ABC株式会社）",
  category: "交際費",
  amount: 25000,
  date: new Date("2024-01-10"),
  status: "pending",
  submittedBy: {
    name: "山田太郎",
    department: "営業部",
    avatar: "YT",
  },
  description: "ABC株式会社の田中部長との会食。新規プロジェクトの打ち合わせを兼ねて実施。",
  receiptUrl: "/receipts/receipt-001.jpg",
  allocations: [
    { department: "営業部", percentage: 70 },
    { department: "マーケティング部", percentage: 30 },
  ],
  approvalFlow: [
    {
      step: 1,
      role: "部長承認",
      approver: "鈴木一郎",
      status: "approved",
      date: new Date("2024-01-11"),
      comment: "内容確認しました。問題ありません。",
    },
    {
      step: 2,
      role: "経理承認",
      approver: "佐藤花子",
      status: "pending",
      date: null,
      comment: null,
    },
  ],
  history: [
    { action: "申請", user: "山田太郎", date: new Date("2024-01-10T10:30:00") },
    { action: "部長承認", user: "鈴木一郎", date: new Date("2024-01-11T14:20:00") },
  ],
  createdAt: new Date("2024-01-10T10:30:00"),
};

const statusConfig = {
  draft: { label: "下書き", color: "bg-gray-500", icon: FileText },
  pending: { label: "承認待ち", color: "bg-yellow-500", icon: Clock },
  approved: { label: "承認済み", color: "bg-green-500", icon: CheckCircle2 },
  rejected: { label: "却下", color: "bg-red-500", icon: XCircle },
};

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const expense = mockExpense;
  const StatusIcon = statusConfig[expense.status as keyof typeof statusConfig].icon;
  const canApprove = expense.status === "pending"; // In real app, check if current user is approver

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("経費を承認しました");
    navigate("/expenses");
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error("却下理由を入力してください");
      return;
    }
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("経費を却下しました");
    navigate("/expenses");
  };

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("経費申請を削除しました");
    navigate("/expenses");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/expenses">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{expense.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`${statusConfig[expense.status as keyof typeof statusConfig].color} text-white`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[expense.status as keyof typeof statusConfig].label}
                </Badge>
                <span className="text-muted-foreground">
                  申請日: {format(expense.createdAt, "yyyy/MM/dd HH:mm", { locale: ja })}
                </span>
              </div>
            </div>
          </div>
          {expense.status === "draft" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/expenses/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>経費申請を削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Details */}
            <Card>
              <CardHeader>
                <CardTitle>経費詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">利用日</p>
                      <p className="font-medium">
                        {format(expense.date, "yyyy年MM月dd日", { locale: ja })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">カテゴリ</p>
                      <p className="font-medium">{expense.category}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">金額</p>
                  <p className="text-3xl font-bold">
                    ¥{expense.amount.toLocaleString()}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">備考</p>
                  <p>{expense.description}</p>
                </div>

                {expense.allocations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">部門配賦</p>
                      <div className="space-y-2">
                        {expense.allocations.map((allocation, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{allocation.department}</span>
                            </div>
                            <span className="font-medium">
                              {allocation.percentage}% (¥
                              {Math.round(
                                (expense.amount * allocation.percentage) / 100
                              ).toLocaleString()}
                              )
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Receipt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  領収書
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expense.receiptUrl ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg"
                        alt="領収書"
                        className="w-full h-64 object-contain bg-muted"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      ダウンロード
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    領収書がアップロードされていません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Approval Action */}
            {canApprove && (
              <Card>
                <CardHeader>
                  <CardTitle>承認処理</CardTitle>
                  <CardDescription>
                    この経費申請を承認または却下してください
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">コメント（却下時は必須）</p>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="承認・却下に関するコメントを入力..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      承認する
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      却下する
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submitter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">申請者</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{expense.submittedBy.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{expense.submittedBy.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.submittedBy.department}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Flow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">承認フロー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expense.approvalFlow.map((step, index) => (
                    <div key={index} className="relative">
                      {index < expense.approvalFlow.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === "approved"
                              ? "bg-green-100 text-green-600"
                              : step.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {step.status === "approved" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : step.status === "rejected" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{step.role}</p>
                          <p className="text-sm text-muted-foreground">
                            {step.approver}
                          </p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(step.date, "MM/dd HH:mm", { locale: ja })}
                            </p>
                          )}
                          {step.comment && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <MessageSquare className="h-3 w-3 inline mr-1" />
                              {step.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expense.history.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">
                        {format(item.date, "MM/dd HH:mm", { locale: ja })}
                      </span>
                      <span>
                        {item.user}が{item.action}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
