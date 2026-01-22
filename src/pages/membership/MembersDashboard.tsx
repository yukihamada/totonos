import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, TrendingUp, UserPlus, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMembershipStats } from "@/hooks/useMembership";
import { Button } from "@/components/ui/button";

export default function MembersDashboard() {
  const navigate = useNavigate();
  const { stats, isLoading } = useMembershipStats();

  const statCards = [
    { 
      label: "総会員数", 
      value: stats?.totalMembers || 0, 
      icon: Users, 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      label: "今月入会", 
      value: stats?.newMembersThisMonth || 0, 
      icon: UserPlus, 
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      label: "本日チェックイン", 
      value: stats?.todayCheckins || 0, 
      icon: CheckCircle, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "本日予約", 
      value: stats?.todayBookings || 0, 
      icon: Calendar, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
  ];

  const quickActions = [
    {
      title: "会員一覧",
      description: "会員情報の確認・編集",
      icon: Users,
      href: "/membership/members",
    },
    {
      title: "スケジュール",
      description: "クラス・レッスンの管理",
      icon: Calendar,
      href: "/membership/schedules",
    },
    {
      title: "チェックイン",
      description: "入退館管理",
      icon: CheckCircle,
      href: "/membership/checkins",
    },
    {
      title: "予約管理",
      description: "クラス予約の確認",
      icon: Clock,
      href: "/membership/bookings",
    },
    {
      title: "プラン管理",
      description: "会員プランの設定",
      icon: TrendingUp,
      href: "/membership/plans",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">会員ダッシュボード</h1>
          <p className="text-muted-foreground">会員管理の概要と統計</p>
        </div>
        
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">クイックアクセス</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Card 
                key={action.href}
                className="cursor-pointer hover:bg-accent/50 transition-colors group"
                onClick={() => navigate(action.href)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>直近のチェックインと予約</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              アクティビティがまだありません
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
