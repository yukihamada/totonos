import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { useContract, useContractItems, useUpdateContract } from "@/hooks/useContracts";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIDocumentAssistant } from "@/components/AIDocumentAssistant";
import { GeneratedContractData } from "@/hooks/useDocumentAI";

interface ContractItemInput {
  id: string;
  title: string;
  content: string;
  isNew?: boolean;
}

export default function ContractEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: clients } = useClients();
  const { data: contract, isLoading: contractLoading } = useContract(id!);
  const { data: existingItems, isLoading: itemsLoading } = useContractItems(id!);
  const updateContract = useUpdateContract();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<ContractItemInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract) {
      setTitle(contract.title);
      setClientId(contract.client_id || "");
      setContent(contract.content || "");
      setAmount(contract.amount.toString());
      setValidUntil(contract.valid_until || "");
    }
  }, [contract]);

  useEffect(() => {
    if (existingItems) {
      setItems(
        existingItems.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          isNew: false,
        }))
      );
    }
  }, [existingItems]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), title: "", content: "", isNew: true }]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateItem = (itemId: string, field: "title" | "content", value: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const amountValue = amount ? parseInt(amount, 10) : 0;
      const taxAmount = Math.floor(amountValue * 0.1);
      const totalAmount = amountValue + taxAmount;

      // Update contract
      await updateContract.mutateAsync({
        id: id!,
        title,
        client_id: clientId || null,
        content: content || null,
        amount: amountValue,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        valid_until: validUntil || null,
      });

      // Delete all existing items and re-insert
      await supabase.from("contract_items").delete().eq("contract_id", id!);

      const validItems = items.filter((item) => item.title.trim() || item.content.trim());
      if (validItems.length > 0) {
        const itemsToInsert = validItems.map((item, index) => ({
          contract_id: id!,
          title: item.title,
          content: item.content,
          item_order: index + 1,
        }));

        const { error: itemsError } = await supabase.from("contract_items").insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      toast.success("契約書を更新しました");
      navigate(`/contracts/${id}`);
    } catch (error) {
      toast.error("契約書の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contractLoading || itemsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">契約書が見つかりません</p>
          <Button className="mt-4" asChild>
            <Link to="/contracts">契約書一覧へ</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/contracts/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">契約書を編集</h1>
            <p className="text-muted-foreground font-mono">{contract.contract_number}</p>
          </div>
        </div>

        <AIDocumentAssistant
          documentType="contract"
          showEditMode
          existingData={{
            title,
            client_id: clientId,
            content,
            amount: amount ? parseInt(amount) : undefined,
            valid_until: validUntil,
            items: items.map(i => ({ title: i.title, content: i.content })),
          }}
          clientInfo={clientId && clients ? clients.find(c => c.id === clientId) ? { id: clientId, name: clients.find(c => c.id === clientId)!.name } : undefined : undefined}
          onGenerate={(data) => {
            const contractData = data as GeneratedContractData;
            setTitle(contractData.title || "");
            if (contractData.client_id) setClientId(contractData.client_id);
            setContent(contractData.content || "");
            setAmount(contractData.amount?.toString() || "");
            setValidUntil(contractData.valid_until || "");
            if (contractData.items && contractData.items.length > 0) {
              setItems(contractData.items.map(item => ({
                id: crypto.randomUUID(),
                title: item.title || "",
                content: item.content || "",
                isNew: true,
              })));
            }
          }}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>契約書の基本情報を編集してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">契約書タイトル *</Label>
                  <Input
                    id="title"
                    placeholder="例: Webサイト制作業務委託契約"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                <Label htmlFor="content">契約概要</Label>
                <Textarea
                  id="content"
                  placeholder="契約の概要や前文を入力してください"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">契約金額（税抜）</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">有効期限</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>契約条項</CardTitle>
              <CardDescription>契約の条項を編集してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">条項がありません</p>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">第{index + 1}条</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="条項タイトル（例: 目的）"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, "title", e.target.value)}
                      />
                      <Textarea
                        placeholder="条項の内容を入力してください"
                        value={item.content}
                        onChange={(e) => updateItem(item.id, "content", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}

              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                条項を追加
              </Button>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to={`/contracts/${id}`}>キャンセル</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "変更を保存"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
