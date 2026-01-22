import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ja } from "date-fns/locale";
import type { LmsEnrollment, LmsTestResult } from "@/hooks/useLMS";

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))", "hsl(var(--secondary))"];

interface StudyProgressChartsProps {
  enrollments: LmsEnrollment[];
  testResults: LmsTestResult[];
}

export function StudyProgressCharts({ enrollments, testResults }: StudyProgressChartsProps) {
  // Course progress data
  const completedCourses = enrollments.filter(e => e.completed_at).length;
  const inProgressCourses = enrollments.filter(e => !e.completed_at && (e.progress || 0) > 0).length;
  const notStartedCourses = enrollments.filter(e => (e.progress || 0) === 0 && !e.completed_at).length;

  const progressData = [
    { name: "完了", value: completedCourses },
    { name: "進行中", value: inProgressCourses },
    { name: "未開始", value: notStartedCourses },
  ].filter(d => d.value > 0);

  // Monthly test score data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthResults = testResults.filter(r => {
      if (!r.completed_at) return false;
      const completedDate = new Date(r.completed_at);
      return isWithinInterval(completedDate, { start: monthStart, end: monthEnd });
    });

    const avgScore = monthResults.length > 0
      ? Math.round(monthResults.reduce((acc, r) => {
          const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
          return acc + pct;
        }, 0) / monthResults.length)
      : 0;

    const passRate = monthResults.length > 0
      ? Math.round((monthResults.filter(r => r.passed).length / monthResults.length) * 100)
      : 0;

    return {
      month: format(date, "M月", { locale: ja }),
      tests: monthResults.length,
      avgScore,
      passRate,
    };
  });

  // Recent test scores
  const recentTestData = testResults.slice(0, 10).map(r => ({
    name: r.test?.title?.slice(0, 10) || "テスト",
    score: r.max_score && r.max_score > 0 
      ? Math.round((r.score || 0) / r.max_score * 100) 
      : 0,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Course Progress Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>コース進捗状況</CardTitle>
          <CardDescription>受講コースのステータス分布</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">データがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
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

      {/* Recent Test Scores Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>テストスコア</CardTitle>
          <CardDescription>直近10件のテスト結果</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">データがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentTestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "スコア"]} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>月別学習推移</CardTitle>
          <CardDescription>過去6ヶ月のテスト受験数と平均スコア</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "avgScore") return [`${value}%`, "平均スコア"];
                  if (name === "passRate") return [`${value}%`, "合格率"];
                  return [`${value}回`, "受験回数"];
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgScore"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
                name="avgScore"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="passRate"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--chart-2))" }}
                name="passRate"
              />
              <Bar
                yAxisId="right"
                dataKey="tests"
                fill="hsl(var(--muted))"
                radius={[4, 4, 0, 0]}
                name="tests"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
