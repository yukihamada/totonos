import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEstimate, useUpdateEstimateStatus, useDeleteEstimate, useConvertEstimateToInvoice } from "@/hooks/useEstimates";
import { useDocumentPDF } from "@/hooks/useDocumentPDF";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { ArrowLeft, Pencil, Send, CheckCircle, Clock, FileText, X, Trash2, FileOutput, Eye, Download } from "lucide-react";
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
  accepted: { label: "承認済", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "却下", variant: "destructive" as const, icon: X },
  expired: { label: "期限切れ", variant: "secondary" as const, icon: Clock },
};

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: estimate, isLoading } = useEstimate(id!);
  const updateStatus = useUpdateEstimateStatus();
  const deleteEstimate = useDeleteEstimate();
  const convertToInvoice = useConvertEstimateToInvoice();
  const { downloadEstimatePDF } = useDocumentPDF();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDelete = async () => {
    await deleteEstimate.mutateAsync(id!);
    navigate("/estimates");
  };

  const handleConvertToInvoice = async () => {
    await convertToInvoice.mutateAsync(id!);
    navigate("/invoices");
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

  if (!estimate) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">見積書が見つかりません</p>
          <Button className="mt-4" asChild>
            <Link to="/estimates">見積書一覧へ</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const status = statusConfig[estimate.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/estimates">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{estimate.title}</h1>
                <Badge variant={status.variant}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">{estimate.estimate_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              プレビュー
            </Button>
            <Button variant="outline" onClick={() => downloadEstimatePDF(estimate)}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/estimates/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </Link>
            </Button>
            {(estimate.status === 'sent' || estimate.status === 'accepted') && (
              <Button onClick={handleConvertToInvoice} disabled={convertToInvoice.isPending}>
                <FileOutput className="mr-2 h-4 w-4" />
                請求書に変換
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
              <CardTitle>見積書情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">発行日</p>
                  <p className="font-medium">
                    {format(new Date(estimate.issue_date), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">有効期限</p>
                  <p className="font-medium">
                    {format(new Date(estimate.valid_until), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
              </div>
              {estimate.accepted_at && (
                <div>
                  <p className="text-sm text-muted-foreground">承認日</p>
                  <p className="font-medium">
                    {format(new Date(estimate.accepted_at), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
              )}
              {estimate.description && (
                <div>
                  <p className="text-sm text-muted-foreground">備考</p>
                  <p className="whitespace-pre-wrap">{estimate.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>取引先</CardTitle>
            </CardHeader>
            <CardContent>
              {estimate.client ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{estimate.client.name}</p>
                  {estimate.client.email && (
                    <p className="text-muted-foreground">{estimate.client.email}</p>
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
                {estimate.items?.map((item: any) => (
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
                <span>¥{estimate.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">消費税（10%）</span>
                <span>¥{(estimate.tax_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-lg font-bold">
                <span>合計</span>
                <span>¥{estimate.total_amount.toLocaleString()}</span>
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
              {estimate.status === 'draft' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: estimate.id, status: 'sent' })}
                >
                  <Send className="mr-2 h-4 w-4" />
                  送付済にする
                </Button>
              )}
              {estimate.status === 'sent' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => updateStatus.mutate({ id: estimate.id, status: 'accepted' })}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    承認済にする
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => updateStatus.mutate({ id: estimate.id, status: 'rejected' })}
                  >
                    <X className="mr-2 h-4 w-4" />
                    却下にする
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>見積書を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。見積書 {estimate.estimate_number} を完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        document={{
          type: 'estimate',
          number: estimate.estimate_number,
          title: estimate.title,
          issueDate: estimate.issue_date,
          validUntil: estimate.valid_until,
          clientName: estimate.client?.name,
          clientAddress: undefined,
          items: estimate.items,
          amount: estimate.amount,
          taxAmount: estimate.tax_amount || 0,
          totalAmount: estimate.total_amount,
          description: estimate.description || undefined,
        }}
        onDownloadPDF={() => {
          downloadEstimatePDF(estimate);
          setShowPreview(false);
        }}
      />
    </AppLayout>
  );
}
