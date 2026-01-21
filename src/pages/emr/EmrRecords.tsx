import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  FileHeart,
  Search,
  Plus,
  ArrowLeft,
  Lock,
  FileSignature,
  Calendar,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { HpkiBridgeDownload } from "@/components/emr/HpkiBridgeDownload";
import { useEmrRecords } from "@/hooks/emr/useEmrRecords";
import { useEmrPatients } from "@/hooks/emr/useEmrPatients";

export default function EmrRecords() {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patient");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>(preselectedPatientId || "");
  const [newRecordOpen, setNewRecordOpen] = useState(false);

  const { records, isLoading, createRecord, signRecord } = useEmrRecords(selectedPatient || undefined);
  const { patients } = useEmrPatients();

  // Form state
  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || "",
    record_date: format(new Date(), "yyyy-MM-dd"),
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const filteredRecords = records.filter((r) => {
    if (searchQuery) {
      const patient = patients.find((p) => p.id === r.patient_id);
      return (
        patient?.name.includes(searchQuery) ||
        patient?.patient_number.includes(searchQuery) ||
        r.subjective?.includes(searchQuery) ||
        r.assessment?.includes(searchQuery)
      );
    }
    return true;
  });

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || "不明";
  };

  const handleSubmit = async (finalize: boolean) => {
    if (!formData.patient_id) return;

    await createRecord.mutateAsync({
      patient_id: formData.patient_id,
      reception_id: null,
      record_date: formData.record_date,
      doctor_name: null,
      subjective: formData.subjective || null,
      objective: formData.objective || null,
      assessment: formData.assessment || null,
      plan: formData.plan || null,
      vital_signs: {},
      prescriptions: [],
      procedures: [],
      is_signed: false,
      signed_at: null,
      hpki_signature: null,
    });

    setFormData({
      patient_id: "",
      record_date: format(new Date(), "yyyy-MM-dd"),
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    });
    setNewRecordOpen(false);
  };

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
                <FileHeart className="h-6 w-6" />
                カルテ
              </h1>
              <p className="text-muted-foreground">
                診療記録の作成・閲覧
              </p>
            </div>
          </div>
          <Dialog open={newRecordOpen} onOpenChange={setNewRecordOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規カルテ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新規カルテ作成</DialogTitle>
                <DialogDescription>
                  SOAP形式で診療記録を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.patient_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>診療日 *</Label>
                    <Input 
                      type="date" 
                      value={formData.record_date}
                      onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-semibold">SOAP</h4>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline">S</Badge>
                      主観的情報（Subjective）
                    </Label>
                    <Textarea
                      placeholder="患者の訴え、症状、経過など..."
                      className="min-h-[80px]"
                      value={formData.subjective}
                      onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline">O</Badge>
                      客観的情報（Objective）
                    </Label>
                    <Textarea
                      placeholder="バイタルサイン、診察所見、検査結果など..."
                      className="min-h-[80px]"
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline">A</Badge>
                      評価（Assessment）
                    </Label>
                    <Textarea
                      placeholder="診断名、病態の評価..."
                      className="min-h-[60px]"
                      value={formData.assessment}
                      onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline">P</Badge>
                      計画（Plan）
                    </Label>
                    <Textarea
                      placeholder="治療方針、処方、次回予定..."
                      className="min-h-[60px]"
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewRecordOpen(false)}>
                  キャンセル
                </Button>
                <Button 
                  onClick={() => handleSubmit(false)} 
                  disabled={createRecord.isPending || !formData.patient_id}
                >
                  {createRecord.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="患者名、症状、診断名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedPatient || "all"} onValueChange={(v) => setSelectedPatient(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="患者で絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての患者</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* HPKI Bridge Download */}
        <HpkiBridgeDownload variant="inline" />

        {/* Records List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {records.length === 0 ? "カルテが登録されていません" : "検索条件に一致するカルテがありません"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">
                          {getPatientName(record.patient_id)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(record.record_date), "yyyy年MM月dd日 (E)", { locale: ja })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.is_signed ? (
                        <Badge variant="outline" className="gap-1 text-green-600">
                          <FileSignature className="h-3 w-3" />
                          署名済
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600">
                          未署名
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="soap" className="w-full">
                    <TabsList>
                      <TabsTrigger value="soap">SOAP</TabsTrigger>
                      <TabsTrigger value="info">記録情報</TabsTrigger>
                    </TabsList>
                    <TabsContent value="soap" className="space-y-3 mt-4">
                      <div className="grid gap-3">
                        <div className="flex gap-3">
                          <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">S</Badge>
                          <p className="text-sm">{record.subjective || "-"}</p>
                        </div>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">O</Badge>
                          <p className="text-sm whitespace-pre-line">{record.objective || "-"}</p>
                        </div>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">A</Badge>
                          <p className="text-sm">{record.assessment || "-"}</p>
                        </div>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">P</Badge>
                          <p className="text-sm">{record.plan || "-"}</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="info" className="mt-4">
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">作成:</span>
                          <span>{format(new Date(record.created_at), "yyyy/MM/dd HH:mm")}</span>
                        </div>
                        {record.signed_at && (
                          <div className="flex items-center gap-2">
                            <FileSignature className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">署名:</span>
                            <span>{format(new Date(record.signed_at), "yyyy/MM/dd HH:mm")}</span>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {!record.is_signed && (
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => signRecord.mutate({ id: record.id })}
                        disabled={signRecord.isPending}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        署名
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
