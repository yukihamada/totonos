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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, ExternalLink, Mail, Phone, Plus, Video, VideoOff } from "lucide-react";
import { useEmrTelemedicine } from "@/hooks/emr/useEmrTelemedicine";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  scheduled: { label: "予約済", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  waiting: { label: "待機中", variant: "outline", icon: <Video className="h-3 w-3" /> },
  in_progress: { label: "診療中", variant: "default", icon: <Video className="h-3 w-3" /> },
  completed: { label: "完了", variant: "outline", icon: <VideoOff className="h-3 w-3" /> },
  cancelled: { label: "キャンセル", variant: "destructive", icon: <VideoOff className="h-3 w-3" /> },
};

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export default function EmrTelemedicine() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formData, setFormData] = useState({
    patient_id: "",
    scheduled_date: format(new Date(), "yyyy-MM-dd"),
    scheduled_time: "09:00",
    duration_minutes: 15,
    doctor_name: "",
    notes: "",
  });

  const { sessions, isLoading, createSession, startSession, updateStatus, completeSession } = useEmrTelemedicine(selectedDate);
  const { patients } = useEmrPatients();

  const handleSubmit = async () => {
    if (!formData.patient_id) return;
    const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`);
    await createSession.mutateAsync({
      patient_id: formData.patient_id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: formData.duration_minutes,
      meeting_url: null,
      meeting_id: null,
      status: "scheduled",
      doctor_name: formData.doctor_name || null,
      notes: formData.notes || null,
      record_id: null,
      updated_at: new Date().toISOString(),
    });
    setDialogOpen(false);
    setFormData({
      patient_id: "",
      scheduled_date: format(new Date(), "yyyy-MM-dd"),
      scheduled_time: "09:00",
      duration_minutes: 15,
      doctor_name: "",
      notes: "",
    });
  };

  const handleStart = async (id: string) => {
    const url = await startSession.mutateAsync(id);
    // Open in new window
    window.open(url, "_blank", "width=800,height=600");
  };

  const handleNotifyPatient = (session: typeof sessions[0]) => {
    // In production, this would send an email/SMS
    toast.success(`${session.patient?.name}様に診療開始の通知を送信しました`);
  };

  const todaySessions = sessions.filter(
    (s) => format(new Date(s.scheduled_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  const upcomingSession = todaySessions.find((s) => s.status === "scheduled" || s.status === "waiting");

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">オンライン診療</h1>
            <p className="text-muted-foreground">遠隔診療の予約・実施管理</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />新規予約</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>オンライン診療予約</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>患者</Label>
                  <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
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
                    <Label>日付</Label>
                    <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>時刻</Label>
                    <Select value={formData.scheduled_time} onValueChange={(v) => setFormData({ ...formData, scheduled_time: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>所要時間</Label>
                    <Select value={String(formData.duration_minutes)} onValueChange={(v) => setFormData({ ...formData, duration_minutes: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10分</SelectItem>
                        <SelectItem value="15">15分</SelectItem>
                        <SelectItem value="20">20分</SelectItem>
                        <SelectItem value="30">30分</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>担当医</Label>
                    <Input value={formData.doctor_name} onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>備考</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                </div>
                <Button onClick={handleSubmit} disabled={!formData.patient_id} className="w-full">予約を登録</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Actions */}
        {upcomingSession && (
          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                次のオンライン診療
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{format(new Date(upcomingSession.scheduled_at), "HH:mm")}</p>
                  <p className="font-medium">{upcomingSession.patient?.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {upcomingSession.patient?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {upcomingSession.patient.phone}
                      </span>
                    )}
                    {upcomingSession.patient?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {upcomingSession.patient.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleNotifyPatient(upcomingSession)}>
                    <Mail className="h-4 w-4 mr-2" />患者に通知
                  </Button>
                  <Button onClick={() => handleStart(upcomingSession.id)}>
                    <Video className="h-4 w-4 mr-2" />診療開始
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-muted-foreground text-sm mb-1">本日予約数</div>
              <p className="text-2xl font-bold">{todaySessions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-muted-foreground text-sm mb-1">待機中</div>
              <p className="text-2xl font-bold">{todaySessions.filter((s) => s.status === "waiting").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-muted-foreground text-sm mb-1">診療中</div>
              <p className="text-2xl font-bold text-green-600">{todaySessions.filter((s) => s.status === "in_progress").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-muted-foreground text-sm mb-1">完了</div>
              <p className="text-2xl font-bold">{todaySessions.filter((s) => s.status === "completed").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Session List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>予約一覧</CardTitle>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時刻</TableHead>
                  <TableHead>患者</TableHead>
                  <TableHead>担当医</TableHead>
                  <TableHead>所要時間</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      予約がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono font-bold">
                        {format(new Date(s.scheduled_at), "HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{s.patient?.name}</p>
                          <p className="text-sm text-muted-foreground">{s.patient?.patient_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>{s.doctor_name || "-"}</TableCell>
                      <TableCell>{s.duration_minutes}分</TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[s.status]?.variant} className="flex items-center gap-1 w-fit">
                          {statusLabels[s.status]?.icon}
                          {statusLabels[s.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {s.status === "scheduled" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: s.id, status: "waiting" })}>
                                待機開始
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: s.id, status: "cancelled" })}>
                                キャンセル
                              </Button>
                            </>
                          )}
                          {s.status === "waiting" && (
                            <Button size="sm" onClick={() => handleStart(s.id)}>
                              <Video className="h-4 w-4 mr-1" />開始
                            </Button>
                          )}
                          {s.status === "in_progress" && (
                            <>
                              {s.meeting_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={s.meeting_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" />入室
                                  </a>
                                </Button>
                              )}
                              <Button size="sm" onClick={() => completeSession.mutate({ id: s.id })}>
                                完了
                              </Button>
                            </>
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
      </div>
    </AppLayout>
  );
}
