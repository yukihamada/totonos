import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { useCreateContract } from "@/hooks/useContracts";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AIDocumentAssistant } from "@/components/AIDocumentAssistant";
import { GeneratedContractData } from "@/hooks/useDocumentAI";

interface ContractItemInput {
  id: string;
  title: string;
  content: string;
}

export default function ContractNew() {
  const navigate = useNavigate();
  const { data: clients } = useClients();
  const createContract = useCreateContract();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<ContractItemInput[]>([
    { id: crypto.randomUUID(), title: "", content: "" },
  ]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), title: "", content: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: "title" | "content", value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contractItems = items
      .filter((item) => item.title.trim() || item.content.trim())
      .map(({ title, content }) => ({ title, content }));

    createContract.mutate(
      {
        title,
        client_id: clientId || null,
        content: content || null,
        amount: amount ? parseInt(amount, 10) : 0,
        valid_until: validUntil || null,
        items: contractItems,
      },
      {
        onSuccess: () => {
          navigate("/contracts");
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">契約書を作成</h1>
            <p className="text-muted-foreground">新しい契約書を作成します</p>
          </div>
        </div>

        <AIDocumentAssistant
          documentType="contract"
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
              })));
            }
          }}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>契約書の基本情報を入力してください</CardDescription>
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
              <CardDescription>契約の条項を追加してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">第{index + 1}条</span>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
              ))}

              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                条項を追加
              </Button>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/contracts">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={createContract.isPending}>
              {createContract.isPending ? "作成中..." : "契約書を作成"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
