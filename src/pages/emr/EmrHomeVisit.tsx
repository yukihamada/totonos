import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Car, ChevronLeft, ChevronRight, Clock, Home, MapPin, Phone, Plus, User } from "lucide-react";
import { useEmrHomeVisits, useEmrHomeVisitPlans, VitalSigns } from "@/hooks/emr/useEmrHomeVisit";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "予定", variant: "secondary" },
  in_progress: { label: "訪問中", variant: "default" },
  completed: { label: "完了", variant: "outline" },
  cancelled: { label: "中止", variant: "destructive" },
};

const visitTypeLabels: Record<string, string> = {
  regular: "定期",
  temporary: "臨時",
  emergency: "緊急",
};

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export default function EmrHomeVisit() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    visit_date: format(new Date(), "yyyy-MM-dd"),
    visit_time: "09:00",
    visit_type: "regular" as const,
    address: "",
    doctor_name: "",
    nurse_name: "",
    notes: "",
  });
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const [completionNotes, setCompletionNotes] = useState("");

  const { visits, isLoading, createVisit, completeVisit } = useEmrHomeVisits();
  const { plans, createPlan } = useEmrHomeVisitPlans();
  const { patients } = useEmrPatients();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getVisitsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return visits.filter((v) => v.visit_date === dateStr);
  };

  const handleSubmit = async () => {
    if (!formData.patient_id) return;
    await createVisit.mutateAsync({
      patient_id: formData.patient_id,
      plan_id: null,
      visit_date: formData.visit_date,
      visit_time: formData.visit_time,
      visit_type: formData.visit_type,
      address: formData.address || null,
      doctor_name: formData.doctor_name || null,
      nurse_name: formData.nurse_name || null,
      vital_signs: null,
      notes: formData.notes || null,
      record_id: null,
      status: "scheduled",
      completed_at: null,
      updated_at: new Date().toISOString(),
    });
    setDialogOpen(false);
    setFormData({
      patient_id: "",
      visit_date: format(new Date(), "yyyy-MM-dd"),
      visit_time: "09:00",
      visit_type: "regular",
      address: "",
      doctor_name: "",
      nurse_name: "",
      notes: "",
    });
  };

  const handleComplete = async () => {
    if (!selectedVisit) return;
    await completeVisit.mutateAsync({
      id: selectedVisit,
      vital_signs: vitalSigns,
      notes: completionNotes,
    });
    setCompleteDialogOpen(false);
    setSelectedVisit(null);
    setVitalSigns({});
    setCompletionNotes("");
  };

  const openCompleteDialog = (visitId: string) => {
    setSelectedVisit(visitId);
    setCompleteDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">訪問診療</h1>
            <p className="text-muted-foreground">訪問スケジュール・記録管理</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />訪問予定追加</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>訪問予定登録</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>患者</Label>
                  <Select value={formData.patient_id} onValueChange={(v) => {
                    const patient = patients.find((p) => p.id === v);
                    setFormData({ ...formData, patient_id: v, address: patient?.address || "" });
                  }}>
                    <SelectTrigger><SelectValue placeholder="患者を選択" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.patient_number} - {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>訪問日</Label>
                    <Input type="date" value={formData.visit_date} onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>時刻</Label>
                    <Select value={formData.visit_time} onValueChange={(v) => setFormData({ ...formData, visit_time: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>種別</Label>
                  <Select value={formData.visit_type} onValueChange={(v: "regular" | "temporary" | "emergency") => setFormData({ ...formData, visit_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">定期訪問</SelectItem>
                      <SelectItem value="temporary">臨時訪問</SelectItem>
                      <SelectItem value="emergency">緊急訪問</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>訪問先住所</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="住所" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>担当医</Label>
                    <Input value={formData.doctor_name} onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>看護師</Label>
                    <Input value={formData.nurse_name} onChange={(e) => setFormData({ ...formData, nurse_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>備考</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                </div>
                <Button onClick={handleSubmit} disabled={!formData.patient_id} className="w-full">登録</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">
              {format(weekStart, "yyyy年M月d日", { locale: ja })} - {format(addDays(weekStart, 6), "M月d日", { locale: ja })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekly Schedule */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayVisits = getVisitsForDay(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <Card key={day.toISOString()} className={isToday ? "border-primary" : ""}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className={`text-sm ${isToday ? "text-primary" : ""}`}>
                    {format(day, "M/d (E)", { locale: ja })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2 min-h-[200px]">
                  {dayVisits.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">予定なし</p>
                  ) : (
                    dayVisits.map((visit) => (
                      <div key={visit.id} className={`p-2 rounded-md text-xs space-y-1 ${visit.visit_type === "emergency" ? "bg-destructive/10" : "bg-muted"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {visit.visit_time}
                          </span>
                          <Badge variant={statusLabels[visit.status]?.variant} className="text-[10px]">
                            {statusLabels[visit.status]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{visit.patient?.name || "不明"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Home className="h-3 w-3" />
                          <span className="truncate">{visit.address || "住所未設定"}</span>
                        </div>
                        {visit.status === "scheduled" && (
                          <Button size="sm" variant="outline" className="w-full h-6 text-[10px]" onClick={() => openCompleteDialog(visit.id)}>
                            訪問完了
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Schedule Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              本日の訪問予定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getVisitsForDay(new Date()).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">本日の訪問予定はありません</p>
              ) : (
                getVisitsForDay(new Date()).map((visit, idx) => (
                  <div key={visit.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-muted-foreground w-8">{idx + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold">{visit.visit_time}</span>
                        <Badge variant={visit.visit_type === "emergency" ? "destructive" : "outline"}>
                          {visitTypeLabels[visit.visit_type]}
                        </Badge>
                        <Badge variant={statusLabels[visit.status]?.variant}>
                          {statusLabels[visit.status]?.label}
                        </Badge>
                      </div>
                      <p className="font-medium">{visit.patient?.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {visit.address || "住所未設定"}
                        </span>
                        {visit.patient?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {visit.patient.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    {visit.status === "scheduled" && (
                      <Button onClick={() => openCompleteDialog(visit.id)}>完了報告</Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complete Dialog */}
        <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>訪問完了報告</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>血圧（収縮期）</Label>
                  <Input type="number" value={vitalSigns.blood_pressure_systolic || ""} onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure_systolic: Number(e.target.value) })} placeholder="mmHg" />
                </div>
                <div>
                  <Label>血圧（拡張期）</Label>
                  <Input type="number" value={vitalSigns.blood_pressure_diastolic || ""} onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure_diastolic: Number(e.target.value) })} placeholder="mmHg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>脈拍</Label>
                  <Input type="number" value={vitalSigns.pulse || ""} onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: Number(e.target.value) })} placeholder="/分" />
                </div>
                <div>
                  <Label>体温</Label>
                  <Input type="number" step="0.1" value={vitalSigns.temperature || ""} onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: Number(e.target.value) })} placeholder="℃" />
                </div>
                <div>
                  <Label>SpO2</Label>
                  <Input type="number" value={vitalSigns.spo2 || ""} onChange={(e) => setVitalSigns({ ...vitalSigns, spo2: Number(e.target.value) })} placeholder="%" />
                </div>
              </div>
              <div>
                <Label>訪問メモ</Label>
                <Textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={3} placeholder="訪問時の所見、申し送り事項など" />
              </div>
              <Button onClick={handleComplete} className="w-full">完了報告を送信</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
