import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePurchaseOrder, useUpdatePurchaseOrderStatus, useDeletePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { ArrowLeft, Pencil, Send, CheckCircle, FileText, XCircle, Trash2, Package, Truck } from "lucide-react";
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
  confirmed: { label: "確認済", variant: "default" as const, icon: CheckCircle },
  delivered: { label: "納品済", variant: "default" as const, icon: Package },
  cancelled: { label: "キャンセル", variant: "destructive" as const, icon: XCircle },
};

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = usePurchaseOrder(id!);
  const updateStatus = useUpdatePurchaseOrderStatus();
  const deletePurchaseOrder = useDeletePurchaseOrder();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deletePurchaseOrder.mutateAsync(id!);
    navigate("/purchase-orders");
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

  if (!order) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">発注書が見つかりません</p>
          <Button className="mt-4" asChild>
            <Link to="/purchase-orders">発注書一覧へ</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/purchase-orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{order.title}</h1>
                <Badge variant={status.variant}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">{order.order_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/purchase-orders/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>発注書情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">発行日</p>
                  <p className="font-medium">
                    {format(new Date(order.issue_date), "yyyy年M月d日", { locale: ja })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">納品希望日</p>
                  <p className="font-medium">
                    {order.delivery_date
                      ? format(new Date(order.delivery_date), "yyyy年M月d日", { locale: ja })
                      : "未設定"}
                  </p>
                </div>
              </div>
              {order.description && (
                <div>
                  <p className="text-sm text-muted-foreground">備考</p>
                  <p className="whitespace-pre-wrap">{order.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>発注先</CardTitle>
            </CardHeader>
            <CardContent>
              {order.client ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{order.client.name}</p>
                  {order.client.email && (
                    <p className="text-muted-foreground">{order.client.email}</p>
                  )}
                  {order.client.phone && (
                    <p className="text-muted-foreground">{order.client.phone}</p>
                  )}
                  {order.client.address && (
                    <p className="text-muted-foreground whitespace-pre-wrap">{order.client.address}</p>
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
                {order.items?.map((item: any) => (
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
                <span>¥{order.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">消費税（10%）</span>
                <span>¥{(order.tax_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-lg font-bold">
                <span>合計</span>
                <span>¥{order.total_amount.toLocaleString()}</span>
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
              {order.status === 'draft' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'sent' })}
                >
                  <Send className="mr-2 h-4 w-4" />
                  送付済にする
                </Button>
              )}
              {order.status === 'sent' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'confirmed' })}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  確認済にする
                </Button>
              )}
              {order.status === 'confirmed' && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  納品済にする
                </Button>
              )}
              {(order.status === 'draft' || order.status === 'sent') && (
                <Button 
                  variant="outline" 
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                >
                  <XCircle className="mr-2 h-4 w-4" />
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
            <AlertDialogTitle>発注書を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。発注書 {order.order_number} を完全に削除します。
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
