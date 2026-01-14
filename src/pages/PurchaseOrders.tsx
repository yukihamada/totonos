import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrderStatus, useDeletePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useClients } from "@/hooks/useClients";
import { Plus, MoreHorizontal, FileText, Send, CheckCircle, Clock, XCircle, X, Trash2, Package, Truck } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AIDocumentAssistant } from "@/components/AIDocumentAssistant";
import { GeneratedPurchaseOrderData } from "@/hooks/useDocumentAI";

const statusConfig = {
  draft: { label: "下書き", variant: "secondary" as const, icon: FileText },
  sent: { label: "送付済", variant: "default" as const, icon: Send },
  confirmed: { label: "確認済", variant: "default" as const, icon: CheckCircle },
  delivered: { label: "納品済", variant: "default" as const, icon: Package },
  cancelled: { label: "キャンセル", variant: "destructive" as const, icon: XCircle },
};

interface PurchaseOrderItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function PurchaseOrders() {
  const { data: purchaseOrders, isLoading } = usePurchaseOrders();
  const { data: clients } = useClients();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updateStatus = useUpdatePurchaseOrderStatus();
  const deletePurchaseOrder = useDeletePurchaseOrder();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const tax = Math.floor(subtotal * 0.1);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSubmit = async () => {
    if (!title || items.length === 0) return;

    await createPurchaseOrder.mutateAsync({
      title,
      client_id: clientId || null,
      description: description || null,
      delivery_date: deliveryDate || null,
      items: items.filter(item => item.description && item.unit_price > 0),
    });

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setClientId("");
    setDescription("");
    setDeliveryDate("");
    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
  };

  const totals = calculateTotal();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">発注書</h1>
            <p className="text-muted-foreground">発注書の作成と管理</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>発注書を作成</DialogTitle>
                <DialogDescription>新しい発注書を作成します</DialogDescription>
              </DialogHeader>
              
              <AIDocumentAssistant
                documentType="purchase_order"
                clientInfo={clientId && clients ? clients.find(c => c.id === clientId) ? { id: clientId, name: clients.find(c => c.id === clientId)!.name } : undefined : undefined}
                onGenerate={(data) => {
                  const poData = data as GeneratedPurchaseOrderData;
                  setTitle(poData.title || "");
                  if (poData.client_id) setClientId(poData.client_id);
                  setDescription(poData.description || "");
                  setDeliveryDate(poData.delivery_date || "");
                  if (poData.items && poData.items.length > 0) {
                    setItems(poData.items.map(item => ({
                      description: item.description || "",
                      quantity: item.quantity || 1,
                      unit_price: item.unit_price || 0,
                    })));
                  }
                }}
              />
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">件名 *</Label>
                    <Input
                      id="title"
                      placeholder="○○部品 発注"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">発注先</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="発注先を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">納品希望日</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">備考</Label>
                  <Textarea
                    id="description"
                    placeholder="発注条件など"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>明細項目</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                      <Plus className="mr-1 h-3 w-3" />
                      行を追加
                    </Button>
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">品目</TableHead>
                          <TableHead className="w-[15%]">数量</TableHead>
                          <TableHead className="w-[20%]">単価</TableHead>
                          <TableHead className="w-[20%]">金額</TableHead>
                          <TableHead className="w-[5%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                placeholder="品目名"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, "unit_price", parseInt(e.target.value) || 0)}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ¥{(item.quantity * item.unit_price).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                  <div className="flex justify-between">
                    <span>小計</span>
                    <span>¥{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>消費税 (10%)</span>
                    <span>¥{totals.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>合計</span>
                    <span>¥{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={createPurchaseOrder.isPending}>
                  {createPurchaseOrder.isPending ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 統計カード */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>送付済</CardDescription>
              <CardTitle className="text-2xl">
                ¥{purchaseOrders?.filter(e => e.status === 'sent').reduce((sum, e) => sum + e.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>確認済</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                ¥{purchaseOrders?.filter(e => e.status === 'confirmed').reduce((sum, e) => sum + e.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>納品済</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                ¥{purchaseOrders?.filter(e => e.status === 'delivered').reduce((sum, e) => sum + e.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>発注書数</CardDescription>
              <CardTitle className="text-2xl">{purchaseOrders?.length || 0}件</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 発注書一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>発注書一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : purchaseOrders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                発注書がありません。「新規作成」から作成してください。
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>発注番号</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>発注先</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>納品希望日</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders?.map((order) => {
                    const config = statusConfig[order.status];
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>{(order as any).client?.name || "-"}</TableCell>
                        <TableCell className="font-medium">¥{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(order.issue_date), "yyyy/MM/dd", { locale: ja })}</TableCell>
                        <TableCell>
                          {order.delivery_date
                            ? format(new Date(order.delivery_date), "yyyy/MM/dd", { locale: ja })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {order.status === 'draft' && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, status: 'sent' })}>
                                  <Send className="mr-2 h-4 w-4" />
                                  送付済にする
                                </DropdownMenuItem>
                              )}
                              {order.status === 'sent' && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, status: 'confirmed' })}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  確認済にする
                                </DropdownMenuItem>
                              )}
                              {order.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}>
                                  <Truck className="mr-2 h-4 w-4" />
                                  納品済にする
                                </DropdownMenuItem>
                              )}
                              {(order.status === 'draft' || order.status === 'sent') && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  キャンセル
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => deletePurchaseOrder.mutate(order.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
