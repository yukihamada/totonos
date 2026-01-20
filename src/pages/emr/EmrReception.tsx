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
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardCheck,
  Search,
  UserPlus,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { ReceptionEntry, ReceptionStatus, Patient } from "@/types/emr";

// Mock data
const mockReceptions: ReceptionEntry[] = [
  {
    id: "1",
    patient_id: "P001",
    patient: {
      id: "P001",
      patient_number: "001",
      name: "田中太郎",
      name_kana: "タナカタロウ",
      birth_date: "1980-05-15",
      gender: "male",
      created_at: "",
      updated_at: "",
    },
    reception_date: new Date().toISOString(),
    reception_number: 1,
    status: "waiting",
    chief_complaint: "頭痛、めまい",
    scheduled_time: "09:00",
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    patient_id: "P002",
    patient: {
      id: "P002",
      patient_number: "002",
      name: "鈴木花子",
      name_kana: "スズキハナコ",
      birth_date: "1975-03-20",
      gender: "female",
      created_at: "",
      updated_at: "",
    },
    reception_date: new Date().toISOString(),
    reception_number: 2,
    status: "in_progress",
    chief_complaint: "発熱、咳",
    scheduled_time: "09:30",
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    patient_id: "P003",
    patient: {
      id: "P003",
      patient_number: "003",
      name: "佐藤次郎",
      name_kana: "サトウジロウ",
      birth_date: "1990-08-10",
      gender: "male",
      created_at: "",
      updated_at: "",
    },
    reception_date: new Date().toISOString(),
    reception_number: 3,
    status: "waiting",
    chief_complaint: "腹痛",
    scheduled_time: "10:00",
    created_at: "",
    updated_at: "",
  },
  {
    id: "4",
    patient_id: "P004",
    patient: {
      id: "P004",
      patient_number: "004",
      name: "高橋美咲",
      name_kana: "タカハシミサキ",
      birth_date: "1985-12-25",
      gender: "female",
      created_at: "",
      updated_at: "",
    },
    reception_date: new Date().toISOString(),
    reception_number: 4,
    status: "completed",
    chief_complaint: "定期検診",
    scheduled_time: "08:30",
    created_at: "",
    updated_at: "",
  },
];

const statusConfig: Record<ReceptionStatus, { label: string; color: string; bgColor: string }> = {
  waiting: { label: "待機中", color: "bg-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30" },
  called: { label: "呼出中", color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  in_progress: { label: "診察中", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-950/30" },
  completed: { label: "完了", color: "bg-gray-500", bgColor: "" },
  cancelled: { label: "キャンセル", color: "bg-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
};

export default function EmrReception() {
  const [searchQuery, setSearchQuery] = useState("");
  const [receptions, setReceptions] = useState<ReceptionEntry[]>(mockReceptions);
  const [newReceptionOpen, setNewReceptionOpen] = useState(false);

  const filteredReceptions = receptions.filter(
    (r) =>
      r.patient?.name.includes(searchQuery) ||
      r.patient?.name_kana.includes(searchQuery) ||
      r.patient?.patient_number.includes(searchQuery)
  );

  const waitingCount = receptions.filter((r) => r.status === "waiting").length;
  const inProgressCount = receptions.filter((r) => r.status === "in_progress").length;

  const updateStatus = (id: string, newStatus: ReceptionStatus) => {
    setReceptions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規受付</DialogTitle>
                <DialogDescription>
                  患者を検索して受付処理を行います
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>患者検索</Label>
                  <Input placeholder="患者番号または氏名で検索..." />
                </div>
                <div className="space-y-2">
                  <Label>主訴</Label>
                  <Textarea placeholder="来院理由・症状を入力..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewReceptionOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setNewReceptionOpen(false)}>受付登録</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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
                  {receptions.filter((r) => r.status === "completed").length}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本日完了</p>
                <p className="text-lg font-semibold">患者</p>
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
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">番号</TableHead>
                  <TableHead>患者</TableHead>
                  <TableHead>予約時刻</TableHead>
                  <TableHead>主訴</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptions.map((reception) => (
                  <TableRow
                    key={reception.id}
                    className={statusConfig[reception.status].bgColor}
                  >
                    <TableCell>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {reception.reception_number}
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
                    <TableCell>{reception.scheduled_time || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {reception.chief_complaint}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusConfig[reception.status].color} text-white`}
                      >
                        {statusConfig[reception.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {reception.status === "waiting" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(reception.id, "in_progress")}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            診察開始
                          </Button>
                        )}
                        {reception.status === "in_progress" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(reception.id, "completed")}
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
                            onClick={() => updateStatus(reception.id, "cancelled")}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
