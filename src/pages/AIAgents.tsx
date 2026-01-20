import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Zap, Mail, FileText, Users, Calendar, TrendingUp, Settings } from "lucide-react";

const agents = [
  {
    id: "email-assistant",
    name: "メールアシスタント",
    description: "受信メールを分析し、自動返信や振り分けを行います",
    icon: Mail,
    status: "active",
    category: "コミュニケーション",
  },
  {
    id: "invoice-processor",
    name: "請求書処理",
    description: "請求書を自動で読み取り、データ化します",
    icon: FileText,
    status: "inactive",
    category: "経理",
  },
  {
    id: "lead-scorer",
    name: "リードスコアリング",
    description: "見込み客を自動でスコアリングし、優先度を付けます",
    icon: TrendingUp,
    status: "active",
    category: "営業",
  },
  {
    id: "scheduler",
    name: "スケジュール調整",
    description: "会議やアポイントメントの日程調整を自動化します",
    icon: Calendar,
    status: "inactive",
    category: "生産性",
  },
  {
    id: "hr-assistant",
    name: "人事アシスタント",
    description: "採用プロセスや従業員管理をサポートします",
    icon: Users,
    status: "inactive",
    category: "人事",
  },
];

export default function AIAgents() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AIエージェント</h1>
            <p className="text-muted-foreground">
              業務を自動化するAIエージェントを管理します
            </p>
          </div>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            新規エージェント作成
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <agent.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {agent.category}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={agent.status === "active"} />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {agent.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={agent.status === "active" ? "default" : "secondary"}
                  >
                    {agent.status === "active" ? "稼働中" : "停止中"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              カスタムエージェント
            </CardTitle>
            <CardDescription>
              独自のAIエージェントを作成して、特定のワークフローを自動化できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              カスタムエージェントを作成
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
