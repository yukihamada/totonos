import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { useTestResults, type LmsTestResult } from "@/hooks/useLMS";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface TestResultsHistoryProps {
  testId: string;
  testName: string;
  passScore: number;
}

export function TestResultsHistory({ testId, testName, passScore }: TestResultsHistoryProps) {
  const { results, isLoading } = useTestResults(testId);

  const testResults = results.filter(r => r.test_id === testId);
  const passCount = testResults.filter(r => r.passed).length;
  const avgScore = testResults.length > 0
    ? Math.round(testResults.reduce((acc, r) => {
        const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
        return acc + pct;
      }, 0) / testResults.length)
    : 0;

  // Chart data - score trend
  const trendData = testResults
    .slice()
    .reverse()
    .slice(0, 10)
    .map((r, index) => ({
      name: `#${index + 1}`,
      score: r.max_score && r.max_score > 0 ? Math.round((r.score || 0) / r.max_score * 100) : 0,
      passLine: passScore,
    }));

  // Score distribution
  const distributionData = [
    { range: "0-20%", count: testResults.filter(r => {
      const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
      return pct < 20;
    }).length },
    { range: "20-40%", count: testResults.filter(r => {
      const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
      return pct >= 20 && pct < 40;
    }).length },
    { range: "40-60%", count: testResults.filter(r => {
      const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
      return pct >= 40 && pct < 60;
    }).length },
    { range: "60-80%", count: testResults.filter(r => {
      const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
      return pct >= 60 && pct < 80;
    }).length },
    { range: "80-100%", count: testResults.filter(r => {
      const pct = r.max_score && r.max_score > 0 ? (r.score || 0) / r.max_score * 100 : 0;
      return pct >= 80;
    }).length },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          読み込み中...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              受験回数
            </CardDescription>
            <CardTitle className="text-2xl">{testResults.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              合格回数
            </CardDescription>
            <CardTitle className="text-2xl text-primary">{passCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              平均スコア
            </CardDescription>
            <CardTitle className="text-2xl">{avgScore}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>合格率</CardDescription>
            <CardTitle className="text-2xl">
              {testResults.length > 0 ? Math.round((passCount / testResults.length) * 100) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">スコア推移</CardTitle>
            <CardDescription>直近10回の受験結果</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">データがありません</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "スコア"]} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="passLine"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">スコア分布</CardTitle>
            <CardDescription>得点帯別の受験回数</CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">データがありません</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}回`, "受験回数"]} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">受験履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              まだ受験履歴がありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>回数</TableHead>
                  <TableHead>受験日時</TableHead>
                  <TableHead>スコア</TableHead>
                  <TableHead>得点率</TableHead>
                  <TableHead>結果</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((result) => {
                  const percentage = result.max_score && result.max_score > 0
                    ? Math.round((result.score || 0) / result.max_score * 100)
                    : 0;
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell>第{result.attempt_number || 1}回</TableCell>
                      <TableCell>
                        {result.completed_at
                          ? format(new Date(result.completed_at), "yyyy/MM/dd HH:mm", { locale: ja })
                          : "-"}
                      </TableCell>
                      <TableCell>{result.score || 0} / {result.max_score || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="h-2 w-20" />
                          <span className="text-sm">{percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? "合格" : "不合格"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
