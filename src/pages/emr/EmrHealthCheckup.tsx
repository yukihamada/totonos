import { useState } from "react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Calendar, ClipboardCheck, FileText, Plus, Stethoscope, Trash2 } from "lucide-react";
import { useEmrCheckupCourses, useEmrCheckupAppointments, useEmrCheckupResults, CheckupItem, CheckupResult } from "@/hooks/emr/useEmrHealthCheckup";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";

const judgementColors: Record<string, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
  "-": "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "予約済", variant: "secondary" },
  completed: { label: "完了", variant: "default" },
  cancelled: { label: "キャンセル", variant: "destructive" },
};

const defaultCheckupItems: CheckupItem[] = [
  { category: "身体計測", name: "身長", unit: "cm" },
  { category: "身体計測", name: "体重", unit: "kg" },
  { category: "身体計測", name: "BMI", unit: "" },
  { category: "身体計測", name: "腹囲", unit: "cm" },
  { category: "血圧", name: "収縮期血圧", unit: "mmHg", reference_value: "~129" },
  { category: "血圧", name: "拡張期血圧", unit: "mmHg", reference_value: "~84" },
  { category: "血液検査", name: "HbA1c", unit: "%", reference_value: "~5.5" },
  { category: "血液検査", name: "空腹時血糖", unit: "mg/dL", reference_value: "~99" },
  { category: "血液検査", name: "総コレステロール", unit: "mg/dL", reference_value: "~219" },
  { category: "血液検査", name: "LDLコレステロール", unit: "mg/dL", reference_value: "~139" },
  { category: "血液検査", name: "HDLコレステロール", unit: "mg/dL", reference_value: "40~" },
  { category: "血液検査", name: "中性脂肪", unit: "mg/dL", reference_value: "~149" },
  { category: "肝機能", name: "AST(GOT)", unit: "U/L", reference_value: "~30" },
  { category: "肝機能", name: "ALT(GPT)", unit: "U/L", reference_value: "~30" },
  { category: "肝機能", name: "γ-GTP", unit: "U/L", reference_value: "~50" },
  { category: "腎機能", name: "クレアチニン", unit: "mg/dL", reference_value: "0.6~1.1" },
  { category: "腎機能", name: "eGFR", unit: "mL/min", reference_value: "60~" },
  { category: "尿検査", name: "尿蛋白", unit: "", reference_value: "(-)" },
  { category: "尿検査", name: "尿糖", unit: "", reference_value: "(-)" },
];

const timeSlots = Array.from({ length: 16 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export default function EmrHealthCheckup() {
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    price: 0,
    items: defaultCheckupItems,
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    course_id: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    appointment_time: "09:00",
  });

  const [resultForm, setResultForm] = useState<{
    results: CheckupResult[];
    overall_judgement: string;
    doctor_comment: string;
  }>({
    results: [],
    overall_judgement: "",
    doctor_comment: "",
  });

  const { courses, createCourse } = useEmrCheckupCourses();
  const { appointments, createAppointment, updateStatus } = useEmrCheckupAppointments();
  const { results, createResult } = useEmrCheckupResults();
  const { patients } = useEmrPatients();

  const handleCreateCourse = async () => {
    if (!courseForm.name) return;
    await createCourse.mutateAsync({
      name: courseForm.name,
      description: courseForm.description || null,
      items: courseForm.items,
      price: courseForm.price,
      is_active: true,
    });
    setCourseDialogOpen(false);
    setCourseForm({ name: "", description: "", price: 0, items: defaultCheckupItems });
  };

  const handleCreateAppointment = async () => {
    if (!appointmentForm.patient_id || !appointmentForm.course_id) return;
    await createAppointment.mutateAsync({
      patient_id: appointmentForm.patient_id,
      course_id: appointmentForm.course_id,
      appointment_date: appointmentForm.appointment_date,
      appointment_time: appointmentForm.appointment_time,
      status: "scheduled",
    });
    setAppointmentDialogOpen(false);
    setAppointmentForm({ patient_id: "", course_id: "", appointment_date: format(new Date(), "yyyy-MM-dd"), appointment_time: "09:00" });
  };

  const openResultDialog = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    const course = courses.find((c) => c.id === apt?.course_id);
    if (course) {
      setResultForm({
        results: course.items.map((item) => ({
          item: item.name,
          category: item.category,
          value: "",
          unit: item.unit,
          reference: item.reference_value,
          judgement: "-" as const,
        })),
        overall_judgement: "",
        doctor_comment: "",
      });
    }
    setSelectedAppointment(appointmentId);
    setResultDialogOpen(true);
  };

  const updateResultValue = (index: number, value: string) => {
    setResultForm({
      ...resultForm,
      results: resultForm.results.map((r, i) => i === index ? { ...r, value } : r),
    });
  };

  const updateResultJudgement = (index: number, judgement: CheckupResult["judgement"]) => {
    setResultForm({
      ...resultForm,
      results: resultForm.results.map((r, i) => i === index ? { ...r, judgement } : r),
    });
  };

  const handleSaveResult = async () => {
    if (!selectedAppointment) return;
    const apt = appointments.find((a) => a.id === selectedAppointment);
    if (!apt) return;

    await createResult.mutateAsync({
      appointment_id: selectedAppointment,
      patient_id: apt.patient_id,
      checkup_date: apt.appointment_date,
      course_name: apt.course?.name || null,
      results: resultForm.results,
      overall_judgement: resultForm.overall_judgement || null,
      doctor_comment: resultForm.doctor_comment || null,
      pdf_url: null,
    });
    await updateStatus.mutateAsync({ id: selectedAppointment, status: "completed" });
    setResultDialogOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">健診管理</h1>
            <p className="text-muted-foreground">健康診断の予約・結果管理</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Stethoscope className="h-4 w-4 mr-2" />コース作成</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>健診コース作成</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>コース名</Label>
                      <Input value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="例: 基本健診コース" />
                    </div>
                    <div>
                      <Label>料金（税込）</Label>
                      <Input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <Label>説明</Label>
                    <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <Label>検査項目（{courseForm.items.length}項目）</Label>
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                      {Object.entries(
                        courseForm.items.reduce((acc, item) => {
                          if (!acc[item.category]) acc[item.category] = [];
                          acc[item.category].push(item);
                          return acc;
                        }, {} as Record<string, CheckupItem[]>)
                      ).map(([category, items]) => (
                        <div key={category} className="mb-2">
                          <p className="font-medium text-sm text-muted-foreground">{category}</p>
                          <div className="flex flex-wrap gap-1">
                            {items.map((item, i) => (
                              <Badge key={i} variant="outline">{item.name}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreateCourse} className="w-full">コースを作成</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />健診予約</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>健診予約登録</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>患者</Label>
                    <Select value={appointmentForm.patient_id} onValueChange={(v) => setAppointmentForm({ ...appointmentForm, patient_id: v })}>
                      <SelectTrigger><SelectValue placeholder="患者を選択" /></SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.patient_number} - {p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>健診コース</Label>
                    <Select value={appointmentForm.course_id} onValueChange={(v) => setAppointmentForm({ ...appointmentForm, course_id: v })}>
                      <SelectTrigger><SelectValue placeholder="コースを選択" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} (¥{c.price.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>日付</Label>
                      <Input type="date" value={appointmentForm.appointment_date} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>時刻</Label>
                      <Select value={appointmentForm.appointment_time} onValueChange={(v) => setAppointmentForm({ ...appointmentForm, appointment_time: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreateAppointment} disabled={!appointmentForm.patient_id || !appointmentForm.course_id} className="w-full">予約登録</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">本日予約</span>
              </div>
              <p className="text-2xl font-bold">
                {appointments.filter((a) => a.appointment_date === format(new Date(), "yyyy-MM-dd")).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ClipboardCheck className="h-4 w-4" />
                <span className="text-sm">今月完了</span>
              </div>
              <p className="text-2xl font-bold">
                {results.filter((r) => r.checkup_date.startsWith(format(new Date(), "yyyy-MM"))).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm">コース数</span>
              </div>
              <p className="text-2xl font-bold">{courses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-sm">結果入力待ち</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {appointments.filter((a) => a.status === "scheduled").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">予約一覧</TabsTrigger>
            <TabsTrigger value="results">結果一覧</TabsTrigger>
            <TabsTrigger value="courses">コース管理</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日時</TableHead>
                      <TableHead>患者</TableHead>
                      <TableHead>コース</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">予約がありません</TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{a.appointment_date}</p>
                              <p className="text-sm text-muted-foreground">{a.appointment_time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{a.patient?.name}</p>
                              <p className="text-sm text-muted-foreground">{a.patient?.patient_number}</p>
                            </div>
                          </TableCell>
                          <TableCell>{a.course?.name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={statusLabels[a.status]?.variant}>
                              {statusLabels[a.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {a.status === "scheduled" && (
                              <Button size="sm" onClick={() => openResultDialog(a.id)}>
                                結果入力
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
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>受診日</TableHead>
                      <TableHead>患者</TableHead>
                      <TableHead>コース</TableHead>
                      <TableHead>総合判定</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">結果がありません</TableCell>
                      </TableRow>
                    ) : (
                      results.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.checkup_date}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{r.patient?.name}</p>
                              <p className="text-sm text-muted-foreground">{r.patient?.patient_number}</p>
                            </div>
                          </TableCell>
                          <TableCell>{r.course_name || "-"}</TableCell>
                          <TableCell>
                            {r.overall_judgement && (
                              <Badge className={judgementColors[r.overall_judgement] || ""}>
                                判定{r.overall_judgement}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />詳細
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>健診コースがありません</p>
                  </CardContent>
                </Card>
              ) : (
                courses.map((c) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle>{c.name}</CardTitle>
                      {c.description && <CardDescription>{c.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2">¥{c.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{c.items.length}項目</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Result Input Dialog */}
        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>健診結果入力</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>項目</TableHead>
                    <TableHead>結果</TableHead>
                    <TableHead>基準値</TableHead>
                    <TableHead>判定</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultForm.results.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground">{r.category}</TableCell>
                      <TableCell>{r.item}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input value={r.value} onChange={(e) => updateResultValue(idx, e.target.value)} className="w-20 h-8" />
                          <span className="text-sm text-muted-foreground">{r.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.reference || "-"}</TableCell>
                      <TableCell>
                        <Select value={r.judgement} onValueChange={(v) => updateResultJudgement(idx, v as CheckupResult["judgement"])}>
                          <SelectTrigger className="w-16 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-">-</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>総合判定</Label>
                  <Select value={resultForm.overall_judgement} onValueChange={(v) => setResultForm({ ...resultForm, overall_judgement: v })}>
                    <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A（異常なし）</SelectItem>
                      <SelectItem value="B">B（軽度異常）</SelectItem>
                      <SelectItem value="C">C（要経過観察）</SelectItem>
                      <SelectItem value="D">D（要精密検査）</SelectItem>
                      <SelectItem value="E">E（要治療）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label>医師コメント</Label>
                  <Input value={resultForm.doctor_comment} onChange={(e) => setResultForm({ ...resultForm, doctor_comment: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleSaveResult} className="w-full">結果を保存</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
