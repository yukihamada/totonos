import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, TrendingUp, UserPlus, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MembersDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "総会員数", value: "0", icon: Users, color: "text-primary" },
    { label: "今月入会", value: "0", icon: UserPlus, color: "text-green-500" },
    { label: "本日チェックイン", value: "0", icon: CheckCircle, color: "text-blue-500" },
    { label: "本日予約", value: "0", icon: Calendar, color: "text-orange-500" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">会員ダッシュボード</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/membership/members")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />会員一覧</CardTitle>
              <CardDescription>会員情報の確認・編集</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/membership/schedules")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />スケジュール</CardTitle>
              <CardDescription>クラス・レッスンの管理</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/membership/checkins")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />チェックイン</CardTitle>
              <CardDescription>入退館管理</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
