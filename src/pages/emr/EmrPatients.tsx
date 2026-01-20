import { useState } from "react";
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
import {
  Users,
  Search,
  UserPlus,
  ArrowLeft,
  FileHeart,
  Calendar,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ja } from "date-fns/locale";
import type { Patient, InsuranceType } from "@/types/emr";

// Mock data
const mockPatients: Patient[] = [
  {
    id: "P001",
    patient_number: "001",
    name: "田中太郎",
    name_kana: "タナカタロウ",
    birth_date: "1980-05-15",
    gender: "male",
    insurance_type: "employee_health",
    insurance_number: "12345678",
    phone: "090-1234-5678",
    address: "東京都新宿区西新宿1-1-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "P002",
    patient_number: "002",
    name: "鈴木花子",
    name_kana: "スズキハナコ",
    birth_date: "1975-03-20",
    gender: "female",
    insurance_type: "national_health",
    insurance_number: "87654321",
    phone: "080-9876-5432",
    address: "東京都渋谷区渋谷2-2-2",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "P003",
    patient_number: "003",
    name: "佐藤次郎",
    name_kana: "サトウジロウ",
    birth_date: "1990-08-10",
    gender: "male",
    insurance_type: "employee_health",
    insurance_number: "11223344",
    phone: "070-1111-2222",
    address: "東京都港区六本木3-3-3",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z",
  },
  {
    id: "P004",
    patient_number: "004",
    name: "高橋美咲",
    name_kana: "タカハシミサキ",
    birth_date: "1985-12-25",
    gender: "female",
    insurance_type: "late_elderly",
    insurance_number: "99887766",
    phone: "090-3333-4444",
    address: "東京都千代田区丸の内4-4-4",
    allergies: "ペニシリン系アレルギー",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-14T00:00:00Z",
  },
  {
    id: "P005",
    patient_number: "005",
    name: "山田健一",
    name_kana: "ヤマダケンイチ",
    birth_date: "1950-02-28",
    gender: "male",
    insurance_type: "late_elderly",
    insurance_number: "55667788",
    phone: "03-5555-6666",
    address: "東京都中央区銀座5-5-5",
    allergies: "卵アレルギー",
    notes: "難聴あり、大きな声で話す必要あり",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-11T00:00:00Z",
  },
];

const insuranceTypeLabels: Record<InsuranceType, string> = {
  national_health: "国保",
  employee_health: "社保",
  late_elderly: "後期",
  welfare: "生保",
  self_pay: "自費",
};

const genderLabels = {
  male: "男性",
  female: "女性",
  other: "その他",
};

export default function EmrPatients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients] = useState<Patient[]>(mockPatients);
  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.includes(searchQuery) ||
      p.name_kana.includes(searchQuery) ||
      p.patient_number.includes(searchQuery) ||
      p.phone?.includes(searchQuery)
  );

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規患者登録</DialogTitle>
                <DialogDescription>
                  患者の基本情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>氏名 *</Label>
                    <Input placeholder="山田太郎" />
                  </div>
                  <div className="space-y-2">
                    <Label>フリガナ *</Label>
                    <Input placeholder="ヤマダタロウ" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>生年月日 *</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>性別 *</Label>
                    <Select>
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
                    <Select>
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
                    <Input placeholder="12345678" />
                  </div>
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input placeholder="090-1234-5678" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>住所</Label>
                  <Input placeholder="東京都..." />
                </div>
                <div className="space-y-2">
                  <Label>アレルギー情報</Label>
                  <Input placeholder="薬品名など" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewPatientOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setNewPatientOpen(false)}>登録</Button>
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
                        <Badge variant="outline" className="text-xs">
                          {genderLabels[patient.gender]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(patient.birth_date), "yyyy/MM/dd")}
                      </p>
                    </TableCell>
                    <TableCell>
                      {patient.insurance_type && (
                        <Badge variant="secondary">
                          {insuranceTypeLabels[patient.insurance_type]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {patient.phone || "-"}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      {patient.allergies && (
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
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          受付
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
