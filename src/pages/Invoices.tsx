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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus, useDeleteInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useSendEmail } from "@/hooks/useEmailSending";
import { useCreatePaymentSession } from "@/hooks/useStripePayment";
import { Plus, MoreHorizontal, FileText, Send, CheckCircle, Clock, AlertCircle, X, Trash2, Mail, Bell, CreditCard, Pencil, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ClientQuickCreate } from "@/components/ClientQuickCreate";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AIDocumentAssistant } from "@/components/AIDocumentAssistant";
import { GeneratedInvoiceData } from "@/hooks/useDocumentAI";
import { LoadingWithTips } from "@/components/LoadingWithTips";

const statusConfig = {
  draft: { label: "下書き", variant: "secondary" as const, icon: FileText },
  sent: { label: "送付済", variant: "default" as const, icon: Send },
  pending: { label: "未払い", variant: "outline" as const, icon: Clock },
  paid: { label: "入金済", variant: "default" as const, icon: CheckCircle },
  overdue: { label: "延滞", variant: "destructive" as const, icon: AlertCircle },
  cancelled: { label: "キャンセル", variant: "secondary" as const, icon: X },
};

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: clients } = useClients();
  const createInvoice = useCreateInvoice();
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();
  const sendEmail = useSendEmail();
  const createPaymentSession = useCreatePaymentSession();

  const [isOpen, setIsOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [emailType, setEmailType] = useState<'invoice' | 'reminder' | 'payment_confirmation'>('invoice');
  const [recipientEmail, setRecipientEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  const handleOpenEmailDialog = (invoice: any, type: 'invoice' | 'reminder' | 'payment_confirmation') => {
    setSelectedInvoice(invoice);
    setEmailType(type);
    setRecipientEmail(invoice.client?.email || "");
    setCustomMessage("");
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedInvoice || !recipientEmail) return;
    
    await sendEmail.mutateAsync({
      type: emailType,
      invoiceId: selectedInvoice.id,
      recipientEmail,
      recipientName: selectedInvoice.client?.name,
      customMessage: customMessage || undefined,
    });
    
    setIsEmailDialogOpen(false);
    setSelectedInvoice(null);
    setRecipientEmail("");
    setCustomMessage("");
  };

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

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const tax = Math.floor(subtotal * 0.1);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSubmit = async () => {
    if (!title || !dueDate || items.length === 0) return;

    await createInvoice.mutateAsync({
      title,
      client_id: clientId || null,
      description: description || null,
      due_date: dueDate,
      items: items.filter(item => item.description && item.unit_price > 0),
    });

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setClientId("");
    setDescription("");
    setDueDate("");
    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
  };

  const totals = calculateTotal();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">請求書</h1>
            <p className="text-muted-foreground">請求書の作成と管理</p>
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
                <DialogTitle>請求書を作成</DialogTitle>
                <DialogDescription>新しい請求書を作成します</DialogDescription>
              </DialogHeader>
              
              <AIDocumentAssistant
                documentType="invoice"
                clientInfo={clientId && clients ? clients.find(c => c.id === clientId) ? { id: clientId, name: clients.find(c => c.id === clientId)!.name } : undefined : undefined}
                onGenerate={(data) => {
                  const invoiceData = data as GeneratedInvoiceData;
                  setTitle(invoiceData.title || "");
                  if (invoiceData.client_id) setClientId(invoiceData.client_id);
                  setDescription(invoiceData.description || "");
                  setDueDate(invoiceData.due_date || "");
                  if (invoiceData.items && invoiceData.items.length > 0) {
                    setItems(invoiceData.items.map(item => ({
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
                      placeholder="2024年1月分 業務委託費"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="client">取引先</Label>
                      <ClientQuickCreate onCreated={(client) => setClientId(client.id)} />
                    </div>
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
                  <Label htmlFor="dueDate">支払期限 *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">備考</Label>
                  <Textarea
                    id="description"
                    placeholder="備考や支払い条件など"
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
                <Button onClick={handleSubmit} disabled={createInvoice.isPending}>
                  {createInvoice.isPending ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 統計カード */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>未払い</CardDescription>
              <CardTitle className="text-2xl">
                ¥{invoices?.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, i) => sum + i.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今月入金済</CardDescription>
              <CardTitle className="text-2xl">
                ¥{invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>延滞中</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                ¥{invoices?.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total_amount, 0).toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>請求書数</CardDescription>
              <CardTitle className="text-2xl">{invoices?.length || 0}件</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 請求書一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>請求書一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingWithTips module="invoices" columns={8} rows={5} />
            ) : invoices?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                請求書がありません。「新規作成」から作成してください。
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>取引先</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>支払期限</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice) => {
                    const config = statusConfig[invoice.status];
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">
                          <Link to={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>{invoice.title}</TableCell>
                        <TableCell>{(invoice as any).client?.name || "-"}</TableCell>
                        <TableCell className="font-medium">¥{invoice.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(invoice.issue_date), "yyyy/MM/dd", { locale: ja })}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), "yyyy/MM/dd", { locale: ja })}</TableCell>
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
                              <DropdownMenuItem asChild>
                                <Link to={`/invoices/${invoice.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  詳細を見る
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/invoices/${invoice.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  編集
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenEmailDialog(invoice, 'invoice')}>
                                <Mail className="mr-2 h-4 w-4" />
                                請求書をメール送信
                              </DropdownMenuItem>
                              {(invoice.status === 'sent' || invoice.status === 'pending' || invoice.status === 'overdue') && (
                                <DropdownMenuItem onClick={() => handleOpenEmailDialog(invoice, 'reminder')}>
                                  <Bell className="mr-2 h-4 w-4" />
                                  リマインダー送信
                                </DropdownMenuItem>
                              )}
                              {invoice.status === 'paid' && (
                                <DropdownMenuItem onClick={() => handleOpenEmailDialog(invoice, 'payment_confirmation')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  入金確認メール送信
                                </DropdownMenuItem>
                              )}
                              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <DropdownMenuItem 
                                  onClick={() => createPaymentSession.mutate({
                                    invoiceId: invoice.id,
                                    amount: invoice.total_amount,
                                    invoiceNumber: invoice.invoice_number,
                                    title: invoice.title,
                                    clientEmail: (invoice as any).client?.email,
                                  })}
                                  disabled={createPaymentSession.isPending}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  オンライン決済リンクを発行
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: invoice.id, status: 'sent' })}>
                                  <Send className="mr-2 h-4 w-4" />
                                  送付済にする
                                </DropdownMenuItem>
                              )}
                              {(invoice.status === 'sent' || invoice.status === 'pending') && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: invoice.id, status: 'paid' })}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  入金済にする
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteInvoice.mutate(invoice.id)}
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

        {/* メール送信ダイアログ */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {emailType === 'invoice' && '請求書をメール送信'}
                {emailType === 'reminder' && 'リマインダーを送信'}
                {emailType === 'payment_confirmation' && '入金確認メールを送信'}
              </DialogTitle>
              <DialogDescription>
                {selectedInvoice?.invoice_number} - {selectedInvoice?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">送信先メールアドレス *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="example@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              {emailType === 'invoice' && (
                <div className="space-y-2">
                  <Label htmlFor="customMessage">カスタムメッセージ（任意）</Label>
                  <Textarea
                    id="customMessage"
                    placeholder="追加のメッセージがあれば入力してください"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={sendEmail.isPending || !recipientEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                {sendEmail.isPending ? "送信中..." : "送信"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
