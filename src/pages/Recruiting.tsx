import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  FileText,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Mock data
const mockStats = {
  openPositions: 5,
  totalCandidates: 42,
  newThisWeek: 8,
  interviewsScheduled: 12,
  offersExtended: 3,
  hired: 2,
};

const mockPositions = [
  {
    id: "1",
    title: "フロントエンドエンジニア",
    department: "開発部",
    location: "東京",
    type: "正社員",
    applicants: 15,
    status: "open",
    postedAt: new Date("2024-01-05"),
  },
  {
    id: "2",
    title: "プロダクトマネージャー",
    department: "プロダクト部",
    location: "東京",
    type: "正社員",
    applicants: 8,
    status: "open",
    postedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    title: "カスタマーサポート",
    department: "サポート部",
    location: "大阪",
    type: "契約社員",
    applicants: 12,
    status: "open",
    postedAt: new Date("2024-01-12"),
  },
];

const mockRecentCandidates = [
  {
    id: "1",
    name: "田中一郎",
    position: "フロントエンドエンジニア",
    status: "interview",
    appliedAt: new Date("2024-01-14"),
  },
  {
    id: "2",
    name: "鈴木花子",
    position: "プロダクトマネージャー",
    status: "screening",
    appliedAt: new Date("2024-01-13"),
  },
  {
    id: "3",
    name: "佐藤次郎",
    position: "フロントエンドエンジニア",
    status: "offer",
    appliedAt: new Date("2024-01-12"),
  },
];

const mockUpcomingInterviews = [
  {
    id: "1",
    candidate: "田中一郎",
    position: "フロントエンドエンジニア",
    interviewer: "山田太郎",
    date: new Date("2024-01-18T10:00:00"),
    type: "技術面接",
  },
  {
    id: "2",
    candidate: "高橋美咲",
    position: "カスタマーサポート",
    interviewer: "木村由美",
    date: new Date("2024-01-18T14:00:00"),
    type: "一次面接",
  },
  {
    id: "3",
    candidate: "伊藤健太",
    position: "プロダクトマネージャー",
    interviewer: "佐々木一郎",
    date: new Date("2024-01-19T11:00:00"),
    type: "最終面接",
  },
];

const statusConfig = {
  screening: { label: "書類選考", color: "bg-gray-500" },
  interview: { label: "面接中", color: "bg-blue-500" },
  offer: { label: "内定", color: "bg-green-500" },
  rejected: { label: "不採用", color: "bg-red-500" },
  hired: { label: "入社", color: "bg-purple-500" },
};

export default function Recruiting() {
  const conversionRate = Math.round(
    (mockStats.hired / mockStats.totalCandidates) * 100
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">採用管理</h1>
            <p className="text-muted-foreground">
              採用活動の全体像を把握します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/recruiting/reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                レポート
              </Link>
            </Button>
            <Button asChild>
              <Link to="/job-postings/new">
                <Briefcase className="h-4 w-4 mr-2" />
                求人を作成
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">公開中の求人</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.openPositions}</div>
              <Button variant="link" className="px-0 h-auto" asChild>
                <Link to="/job-postings">
                  求人一覧 <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">候補者数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalCandidates}</div>
              <p className="text-xs text-green-600">
                +{mockStats.newThisWeek} 今週
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">面接予定</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.interviewsScheduled}
              </div>
              <Button variant="link" className="px-0 h-auto" asChild>
                <Link to="/interviews">
                  スケジュール確認 <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">採用率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <Progress value={conversionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Positions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>公開中の求人</CardTitle>
                <CardDescription>
                  現在募集中のポジション
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/job-postings">すべて見る</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPositions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <Link
                      to={`/job-postings/${position.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {position.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <Badge variant="secondary" className="text-xs">
                        {position.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{position.applicants}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">応募者</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>最近の候補者</CardTitle>
                <CardDescription>
                  直近の応募者とステータス
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/candidates">すべて見る</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <Link
                      to={`/candidates/${candidate.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {candidate.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {candidate.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${
                        statusConfig[candidate.status as keyof typeof statusConfig]
                          .color
                      } text-white`}
                    >
                      {
                        statusConfig[candidate.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(candidate.appliedAt, "MM/dd", { locale: ja })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>今後の面接予定</CardTitle>
              <CardDescription>
                スケジュールされている面接
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/interviews">すべて見る</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {mockUpcomingInterviews.map((interview) => (
                <Card key={interview.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{interview.candidate}</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.position}
                        </p>
                      </div>
                      <Badge variant="outline">{interview.type}</Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(interview.date, "MM/dd (E) HH:mm", {
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{interview.interviewer}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recruitment Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>採用ファネル</CardTitle>
            <CardDescription>
              候補者のステージ別分布
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: "応募", count: 42, color: "bg-blue-500" },
                { stage: "書類選考", count: 28, color: "bg-yellow-500" },
                { stage: "一次面接", count: 15, color: "bg-orange-500" },
                { stage: "最終面接", count: 8, color: "bg-purple-500" },
                { stage: "内定", count: 3, color: "bg-green-500" },
                { stage: "入社", count: 2, color: "bg-emerald-500" },
              ].map((stage, index, arr) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{stage.stage}</div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${stage.color} rounded-full flex items-center justify-end pr-3`}
                        style={{ width: `${(stage.count / 42) * 100}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {stage.count}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="text-sm text-muted-foreground w-16 text-right">
                      {Math.round((arr[index + 1].count / stage.count) * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
