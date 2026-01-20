import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Users,
  ClipboardCheck,
  FileHeart,
  KeySquare,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { ReceptionEntry, ReceptionStatus } from "@/types/emr";

// Mock data
const mockStats = {
  todayPatients: 24,
  waiting: 5,
  inProgress: 2,
  completed: 17,
};

const mockRecentReceptions: ReceptionEntry[] = [
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
    chief_complaint: "頭痛",
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
    chief_complaint: "発熱",
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
    created_at: "",
    updated_at: "",
  },
];

const statusConfig: Record<ReceptionStatus, { label: string; color: string }> = {
  waiting: { label: "待機中", color: "bg-yellow-500" },
  called: { label: "呼出中", color: "bg-blue-500" },
  in_progress: { label: "診察中", color: "bg-green-500" },
  completed: { label: "完了", color: "bg-gray-500" },
  cancelled: { label: "キャンセル", color: "bg-red-500" },
};

export default function EmrDashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="h-6 w-6" />
              電子カルテ
            </h1>
            <p className="text-muted-foreground">
              本日の診療状況を確認します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/emr/hpki">
                <KeySquare className="h-4 w-4 mr-2" />
                HPKI署名
              </Link>
            </Button>
            <Button asChild>
              <Link to="/emr/reception">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                受付
              </Link>
            </Button>
          </div>
        </div>

        {/* Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                デモ版電子カルテ
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                この画面はデモンストレーション用です。実際の診療データは保存されません。
                HPKI署名機能を使用するにはローカルブリッジサーバーの起動が必要です。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">本日の患者数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.todayPatients}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "yyyy年MM月dd日 (E)", { locale: ja })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">待機中</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockStats.waiting}
              </div>
              <Button variant="link" className="px-0 h-auto" asChild>
                <Link to="/emr/reception">
                  受付一覧 <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">診察中</CardTitle>
              <Stethoscope className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">現在診療中</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">診察完了</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.completed}</div>
              <p className="text-xs text-muted-foreground">本日完了分</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>待機・診察中</CardTitle>
                <CardDescription>
                  現在の受付状況
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/emr/reception">すべて見る</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentReceptions
                .filter((r) => r.status === "waiting" || r.status === "in_progress")
                .map((reception) => (
                  <div
                    key={reception.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                        {reception.reception_number}
                      </div>
                      <div>
                        <p className="font-medium">{reception.patient?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reception.chief_complaint}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        statusConfig[reception.status].color
                      } text-white`}
                    >
                      {statusConfig[reception.status].label}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクセス</CardTitle>
              <CardDescription>
                よく使う機能へのショートカット
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/emr/reception">
                  <ClipboardCheck className="h-5 w-5 mr-3 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">受付</p>
                    <p className="text-xs text-muted-foreground">
                      患者の受付処理と待ち順管理
                    </p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/emr/patients">
                  <Users className="h-5 w-5 mr-3 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">患者管理</p>
                    <p className="text-xs text-muted-foreground">
                      患者情報の登録・検索
                    </p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/emr/records">
                  <FileHeart className="h-5 w-5 mr-3 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium">カルテ</p>
                    <p className="text-xs text-muted-foreground">
                      診療記録の作成・閲覧
                    </p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/emr/hpki">
                  <KeySquare className="h-5 w-5 mr-3 text-amber-500" />
                  <div className="text-left">
                    <p className="font-medium">HPKI署名</p>
                    <p className="text-xs text-muted-foreground">
                      電子署名の確認・テスト
                    </p>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
