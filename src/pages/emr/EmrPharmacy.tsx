import { useState } from "react";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { FileText, Pill, Plus, Printer, Search, Trash2 } from "lucide-react";
import { useEmrMedications, useEmrPrescriptions, PrescriptionMedication } from "@/hooks/emr/useEmrPharmacy";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";
import { InlineMedicationSearch } from "@/components/emr/MedicationSearch";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "下書き", variant: "secondary" },
  issued: { label: "発行済", variant: "default" },
  dispensed: { label: "調剤済", variant: "outline" },
  cancelled: { label: "取消", variant: "destructive" },
};

const frequencyOptions = [
  { value: "1日3回毎食後", label: "1日3回毎食後" },
  { value: "1日2回朝夕食後", label: "1日2回朝夕食後" },
  { value: "1日1回朝食後", label: "1日1回朝食後" },
  { value: "1日1回就寝前", label: "1日1回就寝前" },
  { value: "頓服", label: "頓服" },
];

export default function EmrPharmacy() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [medSearchTerm, setMedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptionMeds, setPrescriptionMeds] = useState<PrescriptionMedication[]>([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    prescription_date: format(new Date(), "yyyy-MM-dd"),
    pharmacy_notes: "",
  });
  const [medForm, setMedForm] = useState({
    name: "",
    generic_name: "",
    dosage_form: "錠剤",
    unit: "錠",
    yj_code: "",
    is_generic: false,
  });

  const { medications, isLoading: medsLoading, createMedication } = useEmrMedications();
  const { prescriptions, isLoading, createPrescription, issuePrescription } = useEmrPrescriptions();
  const { patients } = useEmrPatients();

  // Filter medications for master list
  const filteredMasterMeds = medications.filter(
    (m) => m.name.includes(medSearchTerm) || (m.yj_code?.includes(medSearchTerm) ?? false) || (m.generic_name?.includes(medSearchTerm) ?? false)
  );

  const addMedToPrescription = (med: typeof medications[0]) => {
    if (prescriptionMeds.some((p) => p.medication_id === med.id)) return;
    setPrescriptionMeds([
      ...prescriptionMeds,
      {
        medication_id: med.id,
        medication_name: med.name,
        dosage: "1錠",
        frequency: "1日3回毎食後",
        days: 7,
      },
    ]);
  };

  const updateMedInPrescription = (index: number, field: keyof PrescriptionMedication, value: string | number) => {
    setPrescriptionMeds(
      prescriptionMeds.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const removeMedFromPrescription = (index: number) => {
    setPrescriptionMeds(prescriptionMeds.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || prescriptionMeds.length === 0) return;
    await createPrescription.mutateAsync({
      patient_id: formData.patient_id,
      record_id: null,
      prescription_number: null,
      prescription_date: formData.prescription_date,
      medications: prescriptionMeds,
      pharmacy_notes: formData.pharmacy_notes || null,
      issued_at: null,
      status: "draft",
    });
    setDialogOpen(false);
    setPrescriptionMeds([]);
    setFormData({ patient_id: "", prescription_date: format(new Date(), "yyyy-MM-dd"), pharmacy_notes: "" });
  };

  const handleAddMedication = async () => {
    await createMedication.mutateAsync(medForm);
    setMedDialogOpen(false);
    setMedForm({ name: "", generic_name: "", dosage_form: "錠剤", unit: "錠", yj_code: "", is_generic: false });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">調剤・処方管理</h1>
            <p className="text-muted-foreground">処方箋の作成・薬剤管理</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={medDialogOpen} onOpenChange={setMedDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Pill className="h-4 w-4 mr-2" />薬剤登録</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>薬剤マスタ登録</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>薬剤名</Label>
                    <Input value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>一般名</Label>
                    <Input value={medForm.generic_name} onChange={(e) => setMedForm({ ...medForm, generic_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>剤形</Label>
                      <Select value={medForm.dosage_form} onValueChange={(v) => setMedForm({ ...medForm, dosage_form: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="錠剤">錠剤</SelectItem>
                          <SelectItem value="カプセル">カプセル</SelectItem>
                          <SelectItem value="散剤">散剤</SelectItem>
                          <SelectItem value="液剤">液剤</SelectItem>
                          <SelectItem value="軟膏">軟膏</SelectItem>
                          <SelectItem value="注射">注射</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>単位</Label>
                      <Input value={medForm.unit} onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>YJコード</Label>
                    <Input value={medForm.yj_code} onChange={(e) => setMedForm({ ...medForm, yj_code: e.target.value })} />
                  </div>
                  <Button onClick={handleAddMedication} className="w-full">登録</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />処方箋作成</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>処方箋作成</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Patient & Med Search */}
                  <div className="space-y-4">
                    <div>
                      <Label>患者</Label>
                      <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
                        <SelectTrigger><SelectValue placeholder="患者を選択" /></SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.patient_number} - {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>処方日</Label>
                      <Input type="date" value={formData.prescription_date} onChange={(e) => setFormData({ ...formData, prescription_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>薬剤検索</Label>
                      <InlineMedicationSearch
                        medications={medications}
                        onSelect={(med) => addMedToPrescription(med)}
                        selectedIds={prescriptionMeds.map(m => m.medication_id)}
                      />
                    </div>
                  </div>

                  {/* Right: Prescription Items */}
                  <div className="space-y-4">
                    <Label>処方内容</Label>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {prescriptionMeds.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">薬剤を追加してください</p>
                      ) : (
                        prescriptionMeds.map((med, idx) => (
                          <Card key={idx}>
                            <CardContent className="p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{med.medication_name}</span>
                                <Button variant="ghost" size="icon" onClick={() => removeMedFromPrescription(idx)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label className="text-xs">用量</Label>
                                  <Input value={med.dosage} onChange={(e) => updateMedInPrescription(idx, "dosage", e.target.value)} className="h-8" />
                                </div>
                                <div>
                                  <Label className="text-xs">用法</Label>
                                  <Select value={med.frequency} onValueChange={(v) => updateMedInPrescription(idx, "frequency", v)}>
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {frequencyOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">日数</Label>
                                  <Input type="number" value={med.days} onChange={(e) => updateMedInPrescription(idx, "days", Number(e.target.value))} className="h-8" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                    <div>
                      <Label>備考（薬局向け）</Label>
                      <Textarea value={formData.pharmacy_notes} onChange={(e) => setFormData({ ...formData, pharmacy_notes: e.target.value })} rows={2} />
                    </div>
                    <Button onClick={handleSubmit} disabled={!formData.patient_id || prescriptionMeds.length === 0} className="w-full">
                      <FileText className="h-4 w-4 mr-2" />処方箋を作成
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="prescriptions">
          <TabsList>
            <TabsTrigger value="prescriptions">処方箋一覧</TabsTrigger>
            <TabsTrigger value="medications">薬剤マスタ</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>処方番号</TableHead>
                      <TableHead>日付</TableHead>
                      <TableHead>患者</TableHead>
                      <TableHead>薬剤数</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">処方箋がありません</TableCell>
                      </TableRow>
                    ) : (
                      prescriptions.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono">{p.prescription_number || "-"}</TableCell>
                          <TableCell>{p.prescription_date}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{p.patient?.name}</p>
                              <p className="text-sm text-muted-foreground">{p.patient?.patient_number}</p>
                            </div>
                          </TableCell>
                          <TableCell>{p.medications.length}種類</TableCell>
                          <TableCell>
                            <Badge variant={statusLabels[p.status]?.variant}>{statusLabels[p.status]?.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {p.status === "draft" && (
                                <Button size="sm" onClick={() => issuePrescription.mutate(p.id)}>
                                  <Printer className="h-4 w-4 mr-1" />発行
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>薬剤マスタ</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={medSearchTerm} 
                      onChange={(e) => setMedSearchTerm(e.target.value)} 
                      placeholder="薬剤名・一般名・YJコードで検索" 
                      className="pl-9" 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>薬剤名</TableHead>
                      <TableHead>一般名</TableHead>
                      <TableHead>剤形</TableHead>
                      <TableHead>YJコード</TableHead>
                      <TableHead>GE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMasterMeds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {medications.length === 0 ? "薬剤が登録されていません" : "検索条件に一致する薬剤がありません"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMasterMeds.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell>{m.generic_name || "-"}</TableCell>
                          <TableCell>{m.dosage_form || "-"}</TableCell>
                          <TableCell className="font-mono">{m.yj_code || "-"}</TableCell>
                          <TableCell>{m.is_generic ? <Badge variant="outline">GE</Badge> : "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
