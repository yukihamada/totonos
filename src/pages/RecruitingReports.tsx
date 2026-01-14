import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Mock data
const funnelData = [
  { stage: "応募", count: 156, rate: 100 },
  { stage: "書類選考", count: 98, rate: 63 },
  { stage: "一次面接", count: 52, rate: 33 },
  { stage: "技術面接", count: 28, rate: 18 },
  { stage: "最終面接", count: 15, rate: 10 },
  { stage: "内定", count: 8, rate: 5 },
  { stage: "入社", count: 6, rate: 4 },
];

const sourceData = [
  { name: "LinkedIn", value: 45, color: "#0077B5" },
  { name: "自社サイト", value: 28, color: "#3B82F6" },
  { name: "リファラル", value: 18, color: "#10B981" },
  { name: "Indeed", value: 15, color: "#6366F1" },
  { name: "Wantedly", value: 12, color: "#F59E0B" },
  { name: "その他", value: 8, color: "#6B7280" },
];

const monthlyData = [
  { month: "8月", applications: 18, hired: 1 },
  { month: "9月", applications: 22, hired: 2 },
  { month: "10月", applications: 28, hired: 1 },
  { month: "11月", applications: 35, hired: 3 },
  { month: "12月", applications: 25, hired: 2 },
  { month: "1月", applications: 42, hired: 4 },
];

const positionData = [
  { position: "エンジニア", applications: 68, hired: 4, timeToHire: 32 },
  { position: "PM", applications: 24, hired: 2, timeToHire: 28 },
  { position: "デザイナー", applications: 18, hired: 1, timeToHire: 25 },
  { position: "サポート", applications: 28, hired: 3, timeToHire: 18 },
  { position: "営業", applications: 18, hired: 2, timeToHire: 22 },
];

const metrics = {
  totalApplications: 156,
  totalHired: 12,
  conversionRate: 7.7,
  avgTimeToHire: 26,
  activePositions: 5,
  interviewsThisMonth: 24,
};

export default function RecruitingReports() {
  const [period, setPeriod] = useState("6months");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/recruiting">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">採用レポート</h1>
              <p className="text-muted-foreground">
                採用活動の分析と指標を確認します
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">過去1ヶ月</SelectItem>
                <SelectItem value="3months">過去3ヶ月</SelectItem>
                <SelectItem value="6months">過去6ヶ月</SelectItem>
                <SelectItem value="1year">過去1年</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">総応募数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalApplications}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +23% 前月比
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">採用数</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalHired}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 前月比
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">採用率</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.conversionRate}%
              </div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.5% 前月比
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">平均採用日数</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgTimeToHire}日</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3日 前月比
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">採用ファネル</TabsTrigger>
            <TabsTrigger value="sources">流入元</TabsTrigger>
            <TabsTrigger value="trends">トレンド</TabsTrigger>
            <TabsTrigger value="positions">ポジション別</TabsTrigger>
          </TabsList>

          {/* Funnel Tab */}
          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>採用ファネル</CardTitle>
                <CardDescription>
                  各ステージでの候補者数と通過率
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {funnelData.slice(0, -1).map((stage, index) => {
                const nextStage = funnelData[index + 1];
                const dropRate = Math.round(
                  ((stage.count - nextStage.count) / stage.count) * 100
                );
                return (
                  <Card key={stage.stage}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stage.stage} → {nextStage.stage}
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round((nextStage.count / stage.count) * 100)}%
                          </p>
                        </div>
                        <Badge variant="secondary">
                          -{dropRate}% 離脱
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>流入元分布</CardTitle>
                  <CardDescription>
                    候補者の応募経路
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>流入元別詳細</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceData.map((source) => (
                      <div key={source.name} className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{source.name}</span>
                            <span>{source.value}人</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(source.value / 45) * 100}%`,
                                backgroundColor: source.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>月別推移</CardTitle>
                <CardDescription>
                  応募数と採用数の推移
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="applications"
                        stroke="#3B82F6"
                        name="応募数"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="hired"
                        stroke="#10B981"
                        name="採用数"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ポジション別分析</CardTitle>
                <CardDescription>
                  職種ごとの採用パフォーマンス
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ポジション</th>
                        <th className="text-right py-3 px-4">応募数</th>
                        <th className="text-right py-3 px-4">採用数</th>
                        <th className="text-right py-3 px-4">採用率</th>
                        <th className="text-right py-3 px-4">平均採用日数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionData.map((pos) => (
                        <tr key={pos.position} className="border-b">
                          <td className="py-3 px-4 font-medium">
                            {pos.position}
                          </td>
                          <td className="text-right py-3 px-4">
                            {pos.applications}
                          </td>
                          <td className="text-right py-3 px-4">{pos.hired}</td>
                          <td className="text-right py-3 px-4">
                            {Math.round((pos.hired / pos.applications) * 100)}%
                          </td>
                          <td className="text-right py-3 px-4">
                            {pos.timeToHire}日
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
