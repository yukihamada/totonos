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
import { useEstimates, useCreateEstimate, useUpdateEstimateStatus, useDeleteEstimate, useConvertEstimateToInvoice } from "@/hooks/useEstimates";
import { useClients } from "@/hooks/useClients";
import { Plus, MoreHorizontal, FileText, Send, CheckCircle, Clock, XCircle, X, Trash2, FileOutput, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const statusConfig = {
  draft: { label: "下書き", variant: "secondary" as const, icon: FileText },
  sent: { label: "送付済", variant: "default" as const, icon: Send },
  accepted: { label: "承諾", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "却下", variant: "destructive" as const, icon: XCircle },
  expired: { label: "期限切れ", variant: "outline" as const, icon: AlertTriangle },
};

interface EstimateItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function Estimates() {
  const { data: estimates, isLoading } = useEstimates();
  const { data: clients } = useClients();
  const createEstimate = useCreateEstimate();
  const updateStatus = useUpdateEstimateStatus();
  const deleteEstimate = useDeleteEstimate();
  const convertToInvoice = useConvertEstimateToInvoice();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<EstimateItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof EstimateItem, value: string | number) => {
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
    if (!title || !validUntil || items.length === 0) return;

    await createEstimate.mutateAsync({
      title,
      client_id: clientId || null,
      description: description || null,
      valid_until: validUntil,
      items: items.filter(item => item.description && item.unit_price > 0),
    });

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setClientId("");
    setDescription("");
    setValidUntil("");
    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
  };

  const totals = calculateTotal();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">見積書</h1>
            <p className="text-muted-foreground">見積書の作成と管理</p>
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
                <DialogTitle>見積書を作成</DialogTitle>
                <DialogDescription>新しい見積書を作成します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">件名 *</Label>
                    <Input
                      id="title"
                      placeholder="システム開発費用 見積"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">取引先</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="取引先を選択" />
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
                  <Label htmlFor="validUntil">有効期限 *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">備考</Label>
                  <Textarea
                    id="description"
                    placeholder="見積条件など"
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
                <Button onClick={handleSubmit} disabled={createEstimate.isPending}>
                  {createEstimate.isPending ? "作成中..." : "作成"}
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
                ¥{estimates?.filter(e => e.status === 'sent').reduce((sum, e) => sum + e.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>承諾済</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                ¥{estimates?.filter(e => e.status === 'accepted').reduce((sum, e) => sum + e.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>期限切れ</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                ¥{estimates?.filter(e => e.status === 'expired').reduce((sum, e) => sum + e.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>見積書数</CardDescription>
              <CardTitle className="text-2xl">{estimates?.length || 0}件</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 見積書一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>見積書一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : estimates?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                見積書がありません。「新規作成」から作成してください。
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>見積番号</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>取引先</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>有効期限</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimates?.map((estimate) => {
                    const config = statusConfig[estimate.status];
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={estimate.id}>
                        <TableCell className="font-mono">{estimate.estimate_number}</TableCell>
                        <TableCell>{estimate.title}</TableCell>
                        <TableCell>{(estimate as any).client?.name || "-"}</TableCell>
                        <TableCell className="font-medium">¥{estimate.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(estimate.issue_date), "yyyy/MM/dd", { locale: ja })}</TableCell>
                        <TableCell>{format(new Date(estimate.valid_until), "yyyy/MM/dd", { locale: ja })}</TableCell>
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
                              {estimate.status === 'draft' && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: estimate.id, status: 'sent' })}>
                                  <Send className="mr-2 h-4 w-4" />
                                  送付済にする
                                </DropdownMenuItem>
                              )}
                              {estimate.status === 'sent' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateStatus.mutate({ id: estimate.id, status: 'accepted' })}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    承諾済にする
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateStatus.mutate({ id: estimate.id, status: 'rejected' })}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    却下にする
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(estimate.status === 'sent' || estimate.status === 'accepted') && (
                                <DropdownMenuItem onClick={() => convertToInvoice.mutate(estimate.id)}>
                                  <FileOutput className="mr-2 h-4 w-4" />
                                  請求書に変換
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => deleteEstimate.mutate(estimate.id)}
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
