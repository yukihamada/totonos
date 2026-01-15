import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice } from "@/hooks/useInvoices";
import { useCreatePaymentSession } from "@/hooks/useStripePayment";
import { ArrowLeft, Pencil, Send, CheckCircle, Clock, AlertCircle, FileText, X, Trash2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig = {
  draft: { label: "下書き", variant: "secondary" as const, icon: FileText },
  sent: { label: "送付済", variant: "default" as const, icon: Send },
  pending: { label: "未払い", variant: "outline" as const, icon: Clock },
  paid: { label: "入金済", variant: "default" as const, icon: CheckCircle },
  overdue: { label: "延滞", variant: "destructive" as const, icon: AlertCircle },
  cancelled: { label: "キャンセル", variant: "secondary" as const, icon: X },
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id!);
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();
  const createPaymentSession = useCreatePaymentSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteInvoice.mutateAsync(id!);
    navigate("/invoices");
  };

  const handleCreatePaymentLink = () => {
    if (!invoice) return;
    createPaymentSession.mutate({
      invoiceId: invoice.id,
      amount: invoice.total_amount,
      invoiceNumber: invoice.invoice_number,
      title: invoice.title,
      clientEmail: invoice.client?.email,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">請求書が見つかりません</p>
          <Button className="mt-4" asChild>
            <Link to="/invoices">請求書一覧へ</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{invoice.title}</h1>
                <Badge variant={status.variant}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/invoices/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </Link>
            </Button>
            {invoice.status !== 'paid' && (
              <Button onClick={handleCreatePaymentLink} disabled={createPaymentSession.isPending}>
                <CreditCard className="mr-2 h-4 w-4" />
                決済リンク作成
              </Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>請求書情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">発行日</p>
                  <p className="font-medium">
                    {format(new Date(invoice.issue_date), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">支払期限</p>
                  <p className="font-medium">
                    {format(new Date(invoice.due_date), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
              </div>
              {invoice.paid_date && (
                <div>
                  <p className="text-sm text-muted-foreground">入金日</p>
                  <p className="font-medium">
                    {format(new Date(invoice.paid_date), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
              )}
              {invoice.description && (
                <div>
                  <p className="text-sm text-muted-foreground">備考</p>
                  <p className="whitespace-pre-wrap">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>取引先</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.client ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{invoice.client.name}</p>
                  {invoice.client.email && (
                    <p className="text-muted-foreground">{invoice.client.email}</p>
                  )}
                  {invoice.client.phone && (
                    <p className="text-muted-foreground">{invoice.client.phone}</p>
                  )}
                  {invoice.client.address && (
                    <p className="text-muted-foreground whitespace-pre-wrap">{invoice.client.address}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">未設定</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>明細</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>品目</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">単価</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">¥{item.unit_price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">¥{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 space-y-2 text-right">
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">小計</span>
                <span>¥{invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">消費税（10%）</span>
                <span>¥{(invoice.tax_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-lg font-bold">
                <span>合計</span>
                <span>¥{invoice.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ステータス変更</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {invoice.status === 'draft' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: invoice.id, status: 'sent' })}
                >
                  <Send className="mr-2 h-4 w-4" />
                  送付済にする
                </Button>
              )}
              {(invoice.status === 'sent' || invoice.status === 'pending') && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: invoice.id, status: 'paid' })}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  入金済にする
                </Button>
              )}
              {invoice.status !== 'overdue' && invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: invoice.id, status: 'overdue' })}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  延滞にする
                </Button>
              )}
              {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: invoice.id, status: 'cancelled' })}
                >
                  <X className="mr-2 h-4 w-4" />
                  キャンセル
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>請求書を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。請求書 {invoice.invoice_number} を完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
