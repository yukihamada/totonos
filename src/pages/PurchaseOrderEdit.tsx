import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useClients } from "@/hooks/useClients";
import { ClientQuickCreate } from "@/components/ClientQuickCreate";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseOrderItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function PurchaseOrderEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading } = usePurchaseOrder(id!);
  const { data: clients } = useClients();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setTitle(order.title);
      setClientId(order.client_id || "");
      setDescription(order.description || "");
      setDeliveryDate(order.delivery_date || "");
      setItems(
        order.items?.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })) || []
      );
    }
  }, [order]);

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

  const calculateTotals = () => {
    const amount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxAmount = Math.floor(amount * 0.1);
    const totalAmount = amount + taxAmount;
    return { amount, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || items.length === 0) {
      toast.error("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const { amount, taxAmount, totalAmount } = calculateTotals();

      // Update purchase order
      const { error: orderError } = await supabase
        .from("purchase_orders")
        .update({
          title,
          client_id: clientId || null,
          description: description || null,
          delivery_date: deliveryDate || null,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        })
        .eq("id", id!);

      if (orderError) throw orderError;

      // Delete existing items and re-insert
      await supabase.from("purchase_order_items").delete().eq("purchase_order_id", id!);

      const validItems = items.filter((item) => item.description.trim());
      if (validItems.length > 0) {
        const { error: itemsError } = await supabase.from("purchase_order_items").insert(
          validItems.map((item) => ({
            purchase_order_id: id!,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          }))
        );
        if (itemsError) throw itemsError;
      }

      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
      toast.success("発注書を更新しました");
      navigate(`/purchase-orders/${id}`);
    } catch (error) {
      toast.error("発注書の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { totalAmount } = calculateTotals();

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

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" type="button" asChild>
            <Link to={`/purchase-orders/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">発注書を編集</h1>
            <p className="text-muted-foreground font-mono">{order.order_number}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">件名 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：○○部品 発注"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="client">発注先</Label>
                  <ClientQuickCreate onCreated={(client) => setClientId(client.id)} />
                </div>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="発注先を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">なし</SelectItem>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="備考を入力"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>明細</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              項目を追加
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <Label>品目</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="品目名"
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>単価</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>金額</Label>
                    <div className="h-10 flex items-center">
                      ¥{(item.quantity * item.unit_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="pt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  項目を追加してください
                </p>
              )}
            </div>
            <div className="mt-6 text-right">
              <p className="text-lg font-bold">合計: ¥{totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">（税込）</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to={`/purchase-orders/${id}`}>キャンセル</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
