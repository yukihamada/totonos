import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, BookOpen, ClipboardList, CheckCircle, Clock, Trophy, TrendingUp } from "lucide-react";
import { useMyLearning, useTestResults, useLMSStats } from "@/hooks/useLMS";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))", "hsl(var(--secondary))"];

export default function StudyHistory() {
  const { myEnrollments, myResults, isLoading } = useMyLearning();
  const { stats } = useLMSStats();

  const completedCourses = myEnrollments.filter(e => e.completed_at);
  const inProgressCourses = myEnrollments.filter(e => !e.completed_at && e.progress > 0);
  const passedTests = myResults.filter(r => r.passed);
  
  // Calculate average progress
  const avgProgress = myEnrollments.length > 0
    ? Math.round(myEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / myEnrollments.length)
    : 0;

  // Chart data
  const progressData = [
    { name: "完了", value: completedCourses.length },
    { name: "進行中", value: inProgressCourses.length },
    { name: "未開始", value: myEnrollments.filter(e => e.progress === 0).length },
  ];

  const testScoreData = myResults.slice(0, 10).map(r => ({
    name: r.test?.title?.slice(0, 10) || "テスト",
    score: r.max_score && r.max_score > 0 
      ? Math.round((r.score || 0) / r.max_score * 100) 
      : 0,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            受講履歴
          </h1>
          <p className="text-muted-foreground">学習の進捗状況とテスト結果</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                受講中コース
              </CardDescription>
              <CardTitle className="text-2xl">{myEnrollments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                完了コース
              </CardDescription>
              <CardTitle className="text-2xl">{completedCourses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                合格テスト
              </CardDescription>
              <CardTitle className="text-2xl">{passedTests.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                平均進捗率
              </CardDescription>
              <CardTitle className="text-2xl">{avgProgress}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>コース進捗状況</CardTitle>
              <CardDescription>受講コースのステータス分布</CardDescription>
            </CardHeader>
            <CardContent>
              {myEnrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {progressData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>テストスコア</CardTitle>
              <CardDescription>直近10件のテスト結果</CardDescription>
            </CardHeader>
            <CardContent>
              {myResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={testScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "スコア"]} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Lists */}
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              コース履歴
            </TabsTrigger>
            <TabsTrigger value="tests">
              <ClipboardList className="h-4 w-4 mr-2" />
              テスト結果
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  読み込み中...
                </CardContent>
              </Card>
            ) : myEnrollments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  受講履歴がまだありません
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myEnrollments.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{enrollment.course?.title || "コース"}</h3>
                          <p className="text-sm text-muted-foreground">
                            開始日: {format(new Date(enrollment.started_at), "yyyy/MM/dd", { locale: ja })}
                          </p>
                        </div>
                        <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                          {enrollment.completed_at ? "完了" : "進行中"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>進捗</span>
                          <span>{enrollment.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment.progress || 0} />
                      </div>
                      {enrollment.completed_at && (
                        <p className="text-sm text-muted-foreground mt-2">
                          完了日: {format(new Date(enrollment.completed_at), "yyyy/MM/dd", { locale: ja })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  読み込み中...
                </CardContent>
              </Card>
            ) : myResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  テスト結果がまだありません
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myResults.map((result) => {
                  const percentage = result.max_score && result.max_score > 0 
                    ? Math.round((result.score || 0) / result.max_score * 100) 
                    : 0;
                  
                  return (
                    <Card key={result.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{result.test?.title || "テスト"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {result.completed_at && format(new Date(result.completed_at), "yyyy/MM/dd HH:mm", { locale: ja })}
                              {result.attempt_number && ` • 第${result.attempt_number}回目`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{percentage}%</p>
                            <Badge variant={result.passed ? "default" : "destructive"}>
                              {result.passed ? "合格" : "不合格"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                          <span>得点: {result.score || 0} / {result.max_score || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
