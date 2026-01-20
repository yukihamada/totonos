import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { MedicalRecord, Patient } from "@/types/emr";
import { HpkiBridgeDownload } from "@/components/emr/HpkiBridgeDownload";

// Mock data
const mockPatients: Patient[] = [
  {
    id: "P001",
    patient_number: "001",
    name: "田中太郎",
    name_kana: "タナカタロウ",
    birth_date: "1980-05-15",
    gender: "male",
    created_at: "",
    updated_at: "",
  },
  {
    id: "P002",
    patient_number: "002",
    name: "鈴木花子",
    name_kana: "スズキハナコ",
    birth_date: "1975-03-20",
    gender: "female",
    created_at: "",
    updated_at: "",
  },
];

const mockRecords: MedicalRecord[] = [
  {
    id: "R001",
    patient_id: "P001",
    record_date: "2024-01-15",
    subjective: "3日前から頭痛が続いている。特に朝方がひどい。吐き気はない。",
    objective: "血圧: 135/85mmHg、体温: 36.5℃\n瞳孔正常、項部硬直なし",
    assessment: "緊張型頭痛の疑い",
    plan: "ロキソプロフェン処方、1週間後再診",
    icd10_codes: ["G44.2"],
    diagnosis_names: ["緊張型頭痛"],
    is_finalized: true,
    finalized_at: "2024-01-15T12:00:00Z",
    finalized_by: "Dr. 山田",
    signature_hash: "abc123...",
    signed_at: "2024-01-15T12:05:00Z",
    signer_name: "山田太郎（医師）",
    version: 1,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T12:05:00Z",
    created_by: "user1",
  },
  {
    id: "R002",
    patient_id: "P001",
    record_date: "2024-01-08",
    subjective: "風邪症状で来院。咳、鼻水、軽度の発熱。",
    objective: "体温: 37.8℃、咽頭発赤あり、肺音清明",
    assessment: "急性上気道炎",
    plan: "対症療法（解熱剤、咳止め）処方",
    icd10_codes: ["J06.9"],
    diagnosis_names: ["急性上気道炎"],
    is_finalized: true,
    finalized_at: "2024-01-08T15:00:00Z",
    finalized_by: "Dr. 山田",
    version: 1,
    created_at: "2024-01-08T14:00:00Z",
    updated_at: "2024-01-08T15:00:00Z",
    created_by: "user1",
  },
  {
    id: "R003",
    patient_id: "P002",
    record_date: "2024-01-16",
    subjective: "定期検診。特に自覚症状なし。",
    objective: "血圧: 120/75mmHg、体温: 36.2℃\n一般状態良好",
    assessment: "異常なし",
    plan: "次回3ヶ月後に定期検診",
    is_finalized: false,
    version: 1,
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T09:30:00Z",
    created_by: "user1",
  },
];

export default function EmrRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [records] = useState<MedicalRecord[]>(mockRecords);
  const [newRecordOpen, setNewRecordOpen] = useState(false);

  const filteredRecords = records.filter((r) => {
    if (selectedPatient && r.patient_id !== selectedPatient) return false;
    if (searchQuery) {
      const patient = mockPatients.find((p) => p.id === r.patient_id);
      return (
        patient?.name.includes(searchQuery) ||
        patient?.patient_number.includes(searchQuery) ||
        r.subjective.includes(searchQuery) ||
        r.assessment.includes(searchQuery)
      );
    }
    return true;
  });

  const getPatientName = (patientId: string) => {
    return mockPatients.find((p) => p.id === patientId)?.name || "不明";
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="患者を選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.patient_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>診療日 *</Label>
                    <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>病名（ICD-10）</Label>
                  <Input placeholder="病名を入力して検索..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewRecordOpen(false)}>
                  キャンセル
                </Button>
                <Button variant="secondary">
                  下書き保存
                </Button>
                <Button onClick={() => setNewRecordOpen(false)}>
                  <Lock className="h-4 w-4 mr-2" />
                  確定保存
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
                  {mockPatients.map((p) => (
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
                        {format(new Date(record.record_date), "yyyy年MM月dd日 (E)", {
                          locale: ja,
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.is_finalized ? (
                      <>
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          確定済
                        </Badge>
                        {record.signature_hash && (
                          <Badge variant="outline" className="gap-1 text-green-600">
                            <FileSignature className="h-3 w-3" />
                            署名済
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-amber-600">
                        下書き
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="soap" className="w-full">
                  <TabsList>
                    <TabsTrigger value="soap">SOAP</TabsTrigger>
                    <TabsTrigger value="diagnosis">診断</TabsTrigger>
                    <TabsTrigger value="info">記録情報</TabsTrigger>
                  </TabsList>
                  <TabsContent value="soap" className="space-y-3 mt-4">
                    <div className="grid gap-3">
                      <div className="flex gap-3">
                        <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">
                          S
                        </Badge>
                        <p className="text-sm">{record.subjective}</p>
                      </div>
                      <div className="flex gap-3">
                        <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">
                          O
                        </Badge>
                        <p className="text-sm whitespace-pre-line">{record.objective}</p>
                      </div>
                      <div className="flex gap-3">
                        <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">
                          A
                        </Badge>
                        <p className="text-sm">{record.assessment}</p>
                      </div>
                      <div className="flex gap-3">
                        <Badge variant="outline" className="h-6 w-6 justify-center shrink-0">
                          P
                        </Badge>
                        <p className="text-sm">{record.plan}</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="diagnosis" className="mt-4">
                    {record.diagnosis_names?.length ? (
                      <div className="space-y-2">
                        {record.diagnosis_names.map((name, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {record.icd10_codes?.[i] || "-"}
                            </Badge>
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        病名が登録されていません
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="info" className="mt-4">
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">作成:</span>
                        <span>
                          {format(new Date(record.created_at), "yyyy/MM/dd HH:mm")}
                        </span>
                      </div>
                      {record.finalized_at && (
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">確定:</span>
                          <span>
                            {format(new Date(record.finalized_at), "yyyy/MM/dd HH:mm")}
                            {record.finalized_by && ` (${record.finalized_by})`}
                          </span>
                        </div>
                      )}
                      {record.signed_at && (
                        <div className="flex items-center gap-2">
                          <FileSignature className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">署名:</span>
                          <span>
                            {format(new Date(record.signed_at), "yyyy/MM/dd HH:mm")}
                            {record.signer_name && ` (${record.signer_name})`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">バージョン:</span>
                        <span>v{record.version}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {!record.is_finalized && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      編集
                    </Button>
                    <Button size="sm">
                      <Lock className="h-4 w-4 mr-1" />
                      確定
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
