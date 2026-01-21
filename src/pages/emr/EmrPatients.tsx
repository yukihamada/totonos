import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  UserPlus,
  ArrowLeft,
  FileHeart,
  Calendar,
  Loader2,
  Camera,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { useEmrPatients, EmrPatient } from "@/hooks/emr/useEmrPatients";
import { useEmrPatientOCR, PatientOCRResult } from "@/hooks/emr/useEmrOCR";
import { Textarea } from "@/components/ui/textarea";
import { EmrImageUploader } from "@/components/emr/EmrImageUploader";

type InsuranceType = "national_health" | "employee_health" | "late_elderly" | "welfare" | "self_pay";

const insuranceTypeLabels: Record<InsuranceType, string> = {
  national_health: "国保",
  employee_health: "社保",
  late_elderly: "後期",
  welfare: "生保",
  self_pay: "自費",
};

const genderLabels: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

export default function EmrPatients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"manual" | "ocr">("manual");
  const { patients, isLoading, createPatient } = useEmrPatients();
  const { processImage, isProcessing, progress, result: ocrResult, reset: resetOCR } = useEmrPatientOCR();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    name_kana: "",
    birth_date: "",
    gender: "" as "male" | "female" | "other" | "",
    insurance_type: "" as InsuranceType | "",
    insurance_number: "",
    phone: "",
    address: "",
    allergies: "",
    notes: "",
  });

  // Apply OCR result to form
  useEffect(() => {
    if (ocrResult) {
      setFormData({
        name: ocrResult.name || "",
        name_kana: ocrResult.name_kana || "",
        birth_date: ocrResult.birth_date || "",
        gender: (ocrResult.gender as "male" | "female" | "other" | "") || "",
        insurance_type: (ocrResult.insurance_type as InsuranceType | "") || "",
        insurance_number: ocrResult.insurance_number || "",
        phone: ocrResult.phone || "",
        address: ocrResult.address || "",
        allergies: ocrResult.allergies?.join(", ") || "",
        notes: ocrResult.notes || "",
      });
      setInputMode("manual"); // Switch to manual to show filled form
    }
  }, [ocrResult]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name_kana && p.name_kana.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.patient_number.includes(searchQuery) ||
      (p.phone && p.phone.includes(searchQuery))
  );

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return "-";
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.name_kana) {
      return;
    }

    await createPatient.mutateAsync({
      name: formData.name,
      name_kana: formData.name_kana || null,
      birth_date: formData.birth_date || null,
      gender: formData.gender || null,
      insurance_type: formData.insurance_type || null,
      insurance_number: formData.insurance_number || null,
      phone: formData.phone || null,
      address: formData.address || null,
      allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()) : null,
      notes: formData.notes || null,
      email: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      blood_type: null,
      is_active: true,
    });

    setFormData({
      name: "",
      name_kana: "",
      birth_date: "",
      gender: "",
      insurance_type: "",
      insurance_number: "",
      phone: "",
      address: "",
      allergies: "",
      notes: "",
    });
    resetOCR();
    setInputMode("manual");
    setNewPatientOpen(false);
  };

  const handleImageUpload = async (file: File) => {
    await processImage(file);
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
                <Users className="h-6 w-6" />
                患者管理
              </h1>
              <p className="text-muted-foreground">
                登録患者数: {patients.length}名
              </p>
            </div>
          </div>
          <Dialog open={newPatientOpen} onOpenChange={setNewPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                新規患者登録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新規患者登録</DialogTitle>
                <DialogDescription>
                  画像から読み取るか、手動で入力してください
                </DialogDescription>
              </DialogHeader>

              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "manual" | "ocr")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">手動入力</TabsTrigger>
                  <TabsTrigger value="ocr">
                    <Camera className="h-4 w-4 mr-2" />
                    画像から読み取り
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ocr" className="mt-4">
                  <EmrImageUploader
                    onFileSelect={handleImageUpload}
                    isProcessing={isProcessing}
                    progress={progress}
                    label="問診票・保険証・紹介状の画像をアップロード"
                  />
                  {ocrResult && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-primary">
                        ✓ 読み取り完了（信頼度: {Math.round(ocrResult.confidence * 100)}%）
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        「手動入力」タブで内容を確認・編集してください
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>氏名 *</Label>
                    <Input 
                      placeholder="山田太郎" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>フリガナ *</Label>
                    <Input 
                      placeholder="ヤマダタロウ" 
                      value={formData.name_kana}
                      onChange={(e) => setFormData({ ...formData, name_kana: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>生年月日</Label>
                    <Input 
                      type="date" 
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>性別</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(v) => setFormData({ ...formData, gender: v as "male" | "female" | "other" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男性</SelectItem>
                        <SelectItem value="female">女性</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>保険種別</Label>
                    <Select 
                      value={formData.insurance_type} 
                      onValueChange={(v) => setFormData({ ...formData, insurance_type: v as InsuranceType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national_health">国民健康保険</SelectItem>
                        <SelectItem value="employee_health">社会保険</SelectItem>
                        <SelectItem value="late_elderly">後期高齢者医療</SelectItem>
                        <SelectItem value="welfare">生活保護</SelectItem>
                        <SelectItem value="self_pay">自費</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>保険証番号</Label>
                    <Input 
                      placeholder="12345678" 
                      value={formData.insurance_number}
                      onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input 
                      placeholder="090-1234-5678" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>住所</Label>
                  <Input 
                    placeholder="東京都..." 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>アレルギー情報（カンマ区切り）</Label>
                  <Input 
                    placeholder="ペニシリン, 卵" 
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>備考</Label>
                  <Textarea 
                    placeholder="特記事項..." 
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNewPatientOpen(false)}>
                  キャンセル
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createPatient.isPending || !formData.name || !formData.name_kana}
                >
                  {createPatient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  登録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="患者番号、氏名、フリガナ、電話番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>患者一覧</CardTitle>
            <CardDescription>
              {filteredPatients.length}件の患者が見つかりました
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {patients.length === 0 ? "患者が登録されていません" : "検索条件に一致する患者が見つかりません"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">患者番号</TableHead>
                    <TableHead>氏名</TableHead>
                    <TableHead>年齢・性別</TableHead>
                    <TableHead>保険</TableHead>
                    <TableHead>電話番号</TableHead>
                    <TableHead>備考</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono">
                        {patient.patient_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {patient.name_kana}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{calculateAge(patient.birth_date)}歳</span>
                          {patient.gender && (
                            <Badge variant="outline" className="text-xs">
                              {genderLabels[patient.gender]}
                            </Badge>
                          )}
                        </div>
                        {patient.birth_date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(patient.birth_date), "yyyy/MM/dd")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.insurance_type && (
                          <Badge variant="secondary">
                            {insuranceTypeLabels[patient.insurance_type as InsuranceType] || patient.insurance_type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {patient.phone || "-"}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        {patient.allergies && patient.allergies.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            アレルギー
                          </Badge>
                        )}
                        {patient.notes && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {patient.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/emr/records?patient=${patient.id}`}>
                              <FileHeart className="h-4 w-4 mr-1" />
                              カルテ
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/emr/reception?patient=${patient.id}`}>
                              <Calendar className="h-4 w-4 mr-1" />
                              受付
                            </Link>
                          </Button>
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
