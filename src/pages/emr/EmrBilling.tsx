import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, CreditCard, FileText, JapaneseYen, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { useEmrBilling, useEmrBillingMasters, useEmrReceipts, BillingItem } from "@/hooks/emr/useEmrBilling";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unpaid: { label: "未払", variant: "destructive" },
  paid: { label: "支払済", variant: "default" },
  partial: { label: "一部払", variant: "secondary" },
};

const insuranceLabels: Record<string, string> = {
  national_health: "国保",
  employee_health: "社保",
  late_elderly: "後期高齢",
  welfare: "生保",
  self_pay: "自費",
};

export default function EmrBilling() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    insurance_type: "national_health",
    copay_ratio: 30,
  });
  const [searchCode, setSearchCode] = useState("");

  const { billings, isLoading, createBilling, updatePayment } = useEmrBilling(selectedDate);
  const { masters } = useEmrBillingMasters();
  const { patients } = useEmrPatients();

  const filteredMasters = masters.filter(
    (m) => m.code.includes(searchCode) || m.name.includes(searchCode)
  );

  const addItem = (master: typeof masters[0]) => {
    const existing = billingItems.find((i) => i.code === master.code);
    if (existing) {
      setBillingItems(
        billingItems.map((i) =>
          i.code === master.code ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setBillingItems([
        ...billingItems,
        {
          code: master.code,
          name: master.name,
          category: master.category || "",
          points: master.points,
          quantity: 1,
        },
      ]);
    }
  };

  const removeItem = (code: string) => {
    setBillingItems(billingItems.filter((i) => i.code !== code));
  };

  const totalPoints = billingItems.reduce((sum, i) => sum + i.points * i.quantity, 0);
  const totalAmount = totalPoints * 10;
  const patientAmount = Math.floor(totalAmount * (formData.copay_ratio / 100));

  const handleSubmit = async () => {
    if (!formData.patient_id || billingItems.length === 0) return;
    await createBilling.mutateAsync({
      patient_id: formData.patient_id,
      reception_id: null,
      billing_date: selectedDate,
      items: billingItems,
      total_points: totalPoints,
      insurance_type: formData.insurance_type,
      copay_ratio: formData.copay_ratio,
      patient_amount: patientAmount,
      insurance_amount: totalAmount - patientAmount,
      payment_status: "unpaid",
      payment_method: null,
      paid_at: null,
    });
    setDialogOpen(false);
    setBillingItems([]);
    setFormData({ patient_id: "", insurance_type: "national_health", copay_ratio: 30 });
  };

  const todaySummary = {
    total: billings.length,
    totalAmount: billings.reduce((s, b) => s + b.patient_amount, 0),
    paid: billings.filter((b) => b.payment_status === "paid").length,
    unpaid: billings.filter((b) => b.payment_status === "unpaid").length,
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">会計・レセプト</h1>
            <p className="text-muted-foreground">診療報酬計算・請求管理</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />新規会計</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>会計入力</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                {/* Left: Patient & Items */}
                <div className="space-y-4">
                  <div>
                    <Label>患者</Label>
                    <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="患者を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.patient_number} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>保険種別</Label>
                      <Select value={formData.insurance_type} onValueChange={(v) => setFormData({ ...formData, insurance_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_health">国保</SelectItem>
                          <SelectItem value="employee_health">社保</SelectItem>
                          <SelectItem value="late_elderly">後期高齢</SelectItem>
                          <SelectItem value="welfare">生保</SelectItem>
                          <SelectItem value="self_pay">自費</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>負担割合</Label>
                      <Select value={String(formData.copay_ratio)} onValueChange={(v) => setFormData({ ...formData, copay_ratio: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">1割</SelectItem>
                          <SelectItem value="20">2割</SelectItem>
                          <SelectItem value="30">3割</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>診療報酬コード検索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        placeholder="コードまたは名称で検索"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    {filteredMasters.slice(0, 20).map((m) => (
                      <div
                        key={m.id}
                        className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center border-b last:border-0"
                        onClick={() => addItem(m)}
                      >
                        <div>
                          <span className="font-mono text-sm">{m.code}</span>
                          <span className="ml-2">{m.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{m.points}点</span>
                      </div>
                    ))}
                    {filteredMasters.length === 0 && (
                      <p className="p-4 text-center text-muted-foreground">該当なし</p>
                    )}
                  </div>
                </div>

                {/* Right: Selected Items & Total */}
                <div className="space-y-4">
                  <Label>診療項目</Label>
                  <div className="border rounded-md min-h-[200px]">
                    {billingItems.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground">項目を追加してください</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>項目</TableHead>
                            <TableHead className="text-right">点数</TableHead>
                            <TableHead className="text-right">数量</TableHead>
                            <TableHead className="text-right">小計</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingItems.map((item) => (
                            <TableRow key={item.code}>
                              <TableCell className="text-sm">{item.name}</TableCell>
                              <TableCell className="text-right">{item.points}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{item.points * item.quantity}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.code)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>合計点数</span>
                        <span className="font-bold">{totalPoints.toLocaleString()} 点</span>
                      </div>
                      <div className="flex justify-between">
                        <span>総額（10円/点）</span>
                        <span>¥{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>患者負担（{formData.copay_ratio}割）</span>
                        <span className="text-primary">¥{patientAmount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.patient_id || billingItems.length === 0 || createBilling.isPending}
                    className="w-full"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    会計を確定
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Receipt className="h-4 w-4" />
                <span className="text-sm">本日会計数</span>
              </div>
              <p className="text-2xl font-bold">{todaySummary.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <JapaneseYen className="h-4 w-4" />
                <span className="text-sm">本日売上</span>
              </div>
              <p className="text-2xl font-bold">¥{todaySummary.totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">支払済</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{todaySummary.paid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm">未払</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{todaySummary.unpaid}</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter & List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>会計一覧</CardTitle>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>患者</TableHead>
                  <TableHead>保険</TableHead>
                  <TableHead className="text-right">点数</TableHead>
                  <TableHead className="text-right">患者負担</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      会計データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  billings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{b.patient?.name || "不明"}</p>
                          <p className="text-sm text-muted-foreground">{b.patient?.patient_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {insuranceLabels[b.insurance_type || ""] || b.insurance_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{b.total_points?.toLocaleString()} 点</TableCell>
                      <TableCell className="text-right font-medium">¥{b.patient_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[b.payment_status]?.variant || "secondary"}>
                          {statusLabels[b.payment_status]?.label || b.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {b.payment_status === "unpaid" && (
                          <Button
                            size="sm"
                            onClick={() => updatePayment.mutate({ id: b.id, payment_status: "paid", payment_method: "cash" })}
                          >
                            入金処理
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
