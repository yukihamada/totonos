import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ClipboardCheck,
  Search,
  UserPlus,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  UserRoundPlus,
  RotateCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useEmrReceptions } from "@/hooks/emr/useEmrReceptions";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";
import { VisitTypeIndicator } from "@/components/emr/VisitTypeIndicator";

type ReceptionStatus = "waiting" | "in_progress" | "completed" | "cancelled";

const statusConfig: Record<ReceptionStatus, { label: string; color: string; bgColor: string }> = {
  waiting: { label: "待機中", color: "bg-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30" },
  in_progress: { label: "診察中", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-950/30" },
  completed: { label: "完了", color: "bg-gray-500", bgColor: "" },
  cancelled: { label: "キャンセル", color: "bg-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
};

const visitTypeMapping: Record<string, "first_visit" | "return_visit"> = {
  initial: "first_visit",
  follow_up: "return_visit",
  emergency: "return_visit",
};

export default function EmrReception() {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patient");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newReceptionOpen, setNewReceptionOpen] = useState(!!preselectedPatientId);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  
  const { receptions, isLoading, createReception, updateStatus, refetch } = useEmrReceptions();
  const { patients, createPatient } = useEmrPatients();

  // Existing patient form state
  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || "",
    visit_type: "follow_up" as "initial" | "follow_up" | "emergency",
    chief_complaint: "",
    scheduled_time: format(new Date(), "HH:mm"),
  });

  // New patient form state
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    name_kana: "",
    birth_date: "",
    gender: "male" as "male" | "female" | "other",
    insurance_type: "national" as "national" | "social" | "elderly_front" | "elderly_back" | "self_pay",
    phone: "",
    address: "",
  });

  const filteredReceptions = receptions.filter(
    (r) =>
      r.patient?.name.includes(searchQuery) ||
      r.patient?.name_kana?.includes(searchQuery) ||
      r.patient?.patient_number.includes(searchQuery)
  );

  const waitingCount = receptions.filter((r) => r.status === "waiting").length;
  const inProgressCount = receptions.filter((r) => r.status === "in_progress").length;
  const completedCount = receptions.filter((r) => r.status === "completed").length;
  const initialCount = receptions.filter((r) => r.visit_type === "initial").length;
  const followUpCount = receptions.filter((r) => r.visit_type === "follow_up").length;

  const handleUpdateStatus = (id: string, newStatus: ReceptionStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleSubmitExisting = async () => {
    if (!formData.patient_id) return;

    await createReception.mutateAsync({
      patient_id: formData.patient_id,
      reception_date: new Date().toISOString().split("T")[0],
      reception_time: formData.scheduled_time,
      status: "waiting",
      visit_type: formData.visit_type,
      chief_complaint: formData.chief_complaint || null,
      department: null,
      assigned_doctor_name: null,
      notes: null,
    });

    setFormData({
      patient_id: "",
      visit_type: "follow_up",
      chief_complaint: "",
      scheduled_time: format(new Date(), "HH:mm"),
    });
    setNewReceptionOpen(false);
  };

  const handleSubmitNewPatient = async () => {
    if (!newPatientData.name || !newPatientData.birth_date) return;

    try {
      // Create patient first
      const patient = await createPatient.mutateAsync({
        name: newPatientData.name,
        name_kana: newPatientData.name_kana || null,
        birth_date: newPatientData.birth_date,
        gender: newPatientData.gender,
        insurance_type: newPatientData.insurance_type,
        phone: newPatientData.phone || null,
        address: newPatientData.address || null,
        email: null,
        blood_type: null,
        allergies: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        notes: null,
        insurance_number: null,
        is_active: true,
      });

      // Then create reception for the new patient
      await createReception.mutateAsync({
        patient_id: patient.id,
        reception_date: new Date().toISOString().split("T")[0],
        reception_time: formData.scheduled_time,
        status: "waiting",
        visit_type: "initial", // New patients are always initial visit
        chief_complaint: formData.chief_complaint || null,
        department: null,
        assigned_doctor_name: null,
        notes: null,
      });

      // Reset forms
      setNewPatientData({
        name: "",
        name_kana: "",
        birth_date: "",
        gender: "male",
        insurance_type: "national",
        phone: "",
        address: "",
      });
      setFormData({
        patient_id: "",
        visit_type: "follow_up",
        chief_complaint: "",
        scheduled_time: format(new Date(), "HH:mm"),
      });
      setNewReceptionOpen(false);
    } catch (error) {
      console.error("Failed to create patient and reception:", error);
    }
  };

  const isNewPatientFormValid = newPatientData.name && newPatientData.birth_date;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/emr">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6" />
                受付
              </h1>
              <p className="text-muted-foreground">
                {format(new Date(), "yyyy年MM月dd日 (E)", { locale: ja })} の受付状況
              </p>
            </div>
          </div>
          <Dialog open={newReceptionOpen} onOpenChange={setNewReceptionOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                新規受付
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>新規受付</DialogTitle>
                <DialogDescription>
                  既存患者を選択するか、新規患者を登録して受付処理を行います
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">既存患者</TabsTrigger>
                  <TabsTrigger value="new">新規患者登録</TabsTrigger>
                </TabsList>

                {/* Existing Patient Tab */}
                <TabsContent value="existing" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>患者 *</Label>
                    <Select 
                      value={formData.patient_id} 
                      onValueChange={(v) => setFormData({ ...formData, patient_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="患者を選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.patient_number} - {patient.name} ({patient.name_kana})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>来院区分</Label>
                    <Select 
                      value={formData.visit_type} 
                      onValueChange={(v) => setFormData({ ...formData, visit_type: v as "initial" | "follow_up" | "emergency" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="来院区分を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">
                          <div className="flex items-center gap-2">
                            <UserRoundPlus className="h-4 w-4 text-blue-500" />
                            <span>新患（初診）</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="follow_up">
                          <div className="flex items-center gap-2">
                            <RotateCw className="h-4 w-4 text-green-500" />
                            <span>再診</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>予約時刻</Label>
                    <Input 
                      type="time" 
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>主訴</Label>
                    <Textarea 
                      placeholder="来院理由・症状を入力..." 
                      value={formData.chief_complaint}
                      onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                    />
                  </div>
                </TabsContent>

                {/* New Patient Tab */}
                <TabsContent value="new" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>氏名 *</Label>
                      <Input 
                        placeholder="山田 太郎"
                        value={newPatientData.name}
                        onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>フリガナ</Label>
                      <Input 
                        placeholder="ヤマダ タロウ"
                        value={newPatientData.name_kana}
                        onChange={(e) => setNewPatientData({ ...newPatientData, name_kana: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>生年月日 *</Label>
                      <Input 
                        type="date"
                        value={newPatientData.birth_date}
                        onChange={(e) => setNewPatientData({ ...newPatientData, birth_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>性別</Label>
                      <RadioGroup
                        value={newPatientData.gender}
                        onValueChange={(v) => setNewPatientData({ ...newPatientData, gender: v as "male" | "female" | "other" })}
                        className="flex gap-4 pt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="font-normal">男性</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="font-normal">女性</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other" className="font-normal">その他</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>保険種別</Label>
                    <Select 
                      value={newPatientData.insurance_type}
                      onValueChange={(v) => setNewPatientData({ ...newPatientData, insurance_type: v as typeof newPatientData.insurance_type })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">国民健康保険</SelectItem>
                        <SelectItem value="social">社会保険</SelectItem>
                        <SelectItem value="elderly_front">後期高齢者（前期）</SelectItem>
                        <SelectItem value="elderly_back">後期高齢者（後期）</SelectItem>
                        <SelectItem value="self_pay">自費</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>電話番号</Label>
                      <Input 
                        placeholder="090-1234-5678"
                        value={newPatientData.phone}
                        onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>予約時刻</Label>
                      <Input 
                        type="time" 
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>住所</Label>
                    <Input 
                      placeholder="東京都..."
                      value={newPatientData.address}
                      onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>主訴</Label>
                    <Textarea 
                      placeholder="来院理由・症状を入力..." 
                      value={formData.chief_complaint}
                      onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNewReceptionOpen(false)}>
                  キャンセル
                </Button>
                {activeTab === "existing" ? (
                  <Button 
                    onClick={handleSubmitExisting} 
                    disabled={createReception.isPending || !formData.patient_id}
                  >
                    {createReception.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    受付登録
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmitNewPatient} 
                    disabled={createPatient.isPending || createReception.isPending || !isNewPatientFormValid}
                  >
                    {(createPatient.isPending || createReception.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    患者登録 & 受付
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <span className="text-xl font-bold text-yellow-600">{waitingCount}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待機中</p>
                <p className="text-lg font-semibold">患者</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-xl font-bold text-green-600">{inProgressCount}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">診察中</p>
                <p className="text-lg font-semibold">患者</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                  {completedCount}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本日完了</p>
                <p className="text-lg font-semibold">患者</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <UserRoundPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">新患</p>
                <p className="text-lg font-semibold">{initialCount}名</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <RotateCw className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">再診</p>
                <p className="text-lg font-semibold">{followUpCount}名</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reception List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>受付一覧</CardTitle>
                <CardDescription>本日の受付患者</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="患者を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredReceptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {receptions.length === 0 ? "本日の受付はまだありません" : "検索条件に一致する受付が見つかりません"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">番号</TableHead>
                    <TableHead>患者</TableHead>
                    <TableHead className="w-20">区分</TableHead>
                    <TableHead>予約時刻</TableHead>
                    <TableHead>主訴</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceptions.map((reception, index) => (
                    <TableRow
                      key={reception.id}
                      className={statusConfig[reception.status]?.bgColor || ""}
                    >
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reception.patient?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            No.{reception.patient?.patient_number} ・{" "}
                            {reception.patient?.name_kana}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {reception.visit_type && (
                          <VisitTypeIndicator 
                            visitType={visitTypeMapping[reception.visit_type] || "return_visit"} 
                            size="sm" 
                          />
                        )}
                      </TableCell>
                      <TableCell>{reception.reception_time || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {reception.chief_complaint || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusConfig[reception.status]?.color || "bg-gray-500"} text-white`}
                        >
                          {statusConfig[reception.status]?.label || reception.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {reception.status === "waiting" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(reception.id, "in_progress")}
                              disabled={updateStatus.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              診察開始
                            </Button>
                          )}
                          {reception.status === "in_progress" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(reception.id, "completed")}
                              disabled={updateStatus.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              完了
                            </Button>
                          )}
                          {(reception.status === "waiting" ||
                            reception.status === "in_progress") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(reception.id, "cancelled")}
                              disabled={updateStatus.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
