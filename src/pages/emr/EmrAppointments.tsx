import { useState } from "react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, User, Phone } from "lucide-react";
import { useEmrAppointments, useEmrAppointmentSlots } from "@/hooks/emr/useEmrAppointments";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "予約済", variant: "secondary" },
  confirmed: { label: "確認済", variant: "default" },
  cancelled: { label: "キャンセル", variant: "destructive" },
  completed: { label: "完了", variant: "outline" },
  no_show: { label: "未来院", variant: "destructive" },
};

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export default function EmrAppointments() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    appointment_time: "09:00",
    duration_minutes: 30,
    department: "",
    doctor_name: "",
    notes: "",
  });

  const { appointments, isLoading, createAppointment, updateStatus } = useEmrAppointments();
  const { patients } = useEmrPatients();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((a) => a.appointment_date === dateStr);
  };

  const handleSubmit = async () => {
    if (!formData.patient_id) return;
    await createAppointment.mutateAsync({
      patient_id: formData.patient_id,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      duration_minutes: formData.duration_minutes,
      department: formData.department || null,
      doctor_name: formData.doctor_name || null,
      notes: formData.notes || null,
      status: "scheduled",
      reminder_sent: false,
    });
    setDialogOpen(false);
    setFormData({
      patient_id: "",
      appointment_date: format(new Date(), "yyyy-MM-dd"),
      appointment_time: "09:00",
      duration_minutes: 30,
      department: "",
      doctor_name: "",
      notes: "",
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">予約管理</h1>
            <p className="text-muted-foreground">診察予約の確認・管理</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />新規予約</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>新規予約登録</DialogTitle>
              </DialogHeader>
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
                    <Label>日付</Label>
                    <Input type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>時刻</Label>
                    <Select value={formData.appointment_time} onValueChange={(v) => setFormData({ ...formData, appointment_time: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>所要時間（分）</Label>
                    <Select value={String(formData.duration_minutes)} onValueChange={(v) => setFormData({ ...formData, duration_minutes: Number(v) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15分</SelectItem>
                        <SelectItem value="30">30分</SelectItem>
                        <SelectItem value="45">45分</SelectItem>
                        <SelectItem value="60">60分</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>担当医</Label>
                    <Input value={formData.doctor_name} onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })} placeholder="担当医名" />
                  </div>
                </div>
                <div>
                  <Label>備考</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                </div>
                <Button onClick={handleSubmit} disabled={!formData.patient_id || createAppointment.isPending} className="w-full">
                  予約を登録
                </Button>
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

        {/* Weekly Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            
            return (
              <Card key={day.toISOString()} className={isToday ? "border-primary" : ""}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className={`text-sm ${isToday ? "text-primary" : ""}`}>
                    {format(day, "M/d (E)", { locale: ja })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2 min-h-[200px]">
                  {dayAppointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">予約なし</p>
                  ) : (
                    dayAppointments.map((apt) => (
                      <div key={apt.id} className="p-2 bg-muted rounded-md text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {apt.appointment_time}
                          </span>
                          <Badge variant={statusLabels[apt.status]?.variant || "secondary"} className="text-[10px]">
                            {statusLabels[apt.status]?.label || apt.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{apt.patient?.name || "不明"}</span>
                        </div>
                        {apt.doctor_name && (
                          <div className="text-muted-foreground">
                            担当: {apt.doctor_name}
                          </div>
                        )}
                        {apt.status === "scheduled" && (
                          <div className="flex gap-1 pt-1">
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => updateStatus.mutate({ id: apt.id, status: "confirmed" })}>
                              確認
                            </Button>
                            <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}>
                              取消
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Appointments Detail */}
        <Card>
          <CardHeader>
            <CardTitle>本日の予約一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAppointmentsForDay(new Date()).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">本日の予約はありません</p>
              ) : (
                getAppointmentsForDay(new Date()).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold">{apt.appointment_time}</div>
                      <div>
                        <p className="font-medium">{apt.patient?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.patient?.patient_number}
                          {apt.patient?.phone && (
                            <span className="ml-2 flex items-center gap-1 inline-flex">
                              <Phone className="h-3 w-3" />
                              {apt.patient.phone}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusLabels[apt.status]?.variant || "secondary"}>
                        {statusLabels[apt.status]?.label || apt.status}
                      </Badge>
                      {apt.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })}>
                          完了
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
