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
import { useInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: invoice, isLoading } = useInvoice(id!);
  const { data: clients } = useClients();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setTitle(invoice.title);
      setClientId(invoice.client_id || "");
      setDescription(invoice.description || "");
      setDueDate(invoice.due_date);
      setItems(
        invoice.items?.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })) || []
      );
    }
  }, [invoice]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
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
    if (!title || !dueDate || items.length === 0) {
      toast.error("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const { amount, taxAmount, totalAmount } = calculateTotals();

      // Update invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          title,
          client_id: clientId || null,
          description: description || null,
          due_date: dueDate,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        })
        .eq("id", id!);

      if (invoiceError) throw invoiceError;

      // Delete existing items and re-insert
      await supabase.from("invoice_items").delete().eq("invoice_id", id!);

      const validItems = items.filter((item) => item.description.trim());
      if (validItems.length > 0) {
        const { error: itemsError } = await supabase.from("invoice_items").insert(
          validItems.map((item) => ({
            invoice_id: id!,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          }))
        );
        if (itemsError) throw itemsError;
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast.success("請求書を更新しました");
      navigate(`/invoices/${id}`);
    } catch (error) {
      toast.error("請求書の更新に失敗しました");
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

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" type="button" asChild>
            <Link to={`/invoices/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">請求書を編集</h1>
            <p className="text-muted-foreground font-mono">{invoice.invoice_number}</p>
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
                  placeholder="例：Webサイト制作費用"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">取引先</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="取引先を選択" />
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
              <Label htmlFor="dueDate">支払期限 *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
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
            <Link to={`/invoices/${id}`}>キャンセル</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
