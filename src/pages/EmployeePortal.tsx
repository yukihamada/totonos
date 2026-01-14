import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Calendar, DollarSign, Clock, AlertCircle } from "lucide-react";

interface Payslip {
  id: string;
  year: number;
  month: number;
  base_salary: number;
  overtime_pay: number;
  allowances: number;
  gross_pay: number;
  income_tax: number;
  resident_tax: number;
  social_insurance: number;
  deductions: number;
  net_pay: number;
  status: string;
  issued_at: string;
}

export default function EmployeePortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (token) {
      verifyAndFetchData();
    } else {
      setError("アクセストークンが必要です");
      setLoading(false);
    }
  }, [token]);

  const verifyAndFetchData = async () => {
    try {
      // Verify token and get employee data
      const { data, error } = await supabase.functions.invoke("verify-portal-token", {
        body: { token },
      });

      if (error || !data.employee) {
        throw new Error("無効なトークンまたは期限切れです");
      }

      setEmployee(data.employee);
      setPayslips(data.payslips || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (payslip: Payslip) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-payslip-pdf", {
        body: { payslipId: payslip.id, token },
      });

      if (error) throw error;

      // Download PDF
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `給与明細_${payslip.year}年${payslip.month}月.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const filteredPayslips = payslips.filter((p) => p.year === selectedYear);
  const years = [...new Set(payslips.map((p) => p.year))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">アクセスエラー</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold">給与明細ポータル</h1>
          <p className="text-muted-foreground mt-2">
            {employee?.name} 様の給与情報
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の手取り</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{(filteredPayslips[0]?.net_pay || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">年間総支給額</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{filteredPayslips.reduce((sum, p) => sum + p.gross_pay, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">明細数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPayslips.length}件
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>給与明細一覧</CardTitle>
                <CardDescription>過去の給与明細を確認・ダウンロード</CardDescription>
              </div>
              <Tabs value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <TabsList>
                  {years.map((year) => (
                    <TabsTrigger key={year} value={String(year)}>
                      {year}年
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayslips.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {selectedYear}年の給与明細はありません
                </p>
              ) : (
                filteredPayslips.map((payslip) => (
                  <div
                    key={payslip.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {payslip.year}年{payslip.month}月分
                        </p>
                        <p className="text-sm text-muted-foreground">
                          発行日: {new Date(payslip.issued_at).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">
                          ¥{payslip.net_pay.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (総支給: ¥{payslip.gross_pay.toLocaleString()})
                        </p>
                      </div>
                      <Badge variant={payslip.status === "issued" ? "default" : "secondary"}>
                        {payslip.status === "issued" ? "発行済み" : "下書き"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPayslip(payslip)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payslip Detail Modal would go here */}
      </div>
    </div>
  );
}
